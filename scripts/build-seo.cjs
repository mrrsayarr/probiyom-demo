/* Generate SEO HTML with the site's existing renderers in Node.js. */
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const postcss = require('postcss');
const { optimize: optimizeSvg } = require('svgo');
const criticalCss = require('./critical-css.cjs');

const root = path.resolve(__dirname, '..');
const origin = 'https://www.probiyom.com';
const noOp = () => {};
const excluded = new Set(['scripts/app.js', 'scripts/router.js', 'scripts/contact-map.js']);
const forPlesk = process.argv.includes('--plesk');
const dist = path.join(root, forPlesk ? 'dist-plesk' : 'dist');

async function build() {
  const imageAssets = require('./image-assets.cjs')(root);
  await fs.writeFile(path.join(root, 'data/image-assets.js'), 'var ImageAssets = ' + JSON.stringify(imageAssets) + ';\n');
  const shell = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const { document: sourceDocument } = parseHTML(shell);
  const scripts = [];
  const runtime = [];
  let storeCode = '';
  for (const element of sourceDocument.querySelectorAll('script[src]')) {
    const name = element.getAttribute('src').split('?')[0];
    if (/^https?:/.test(name)) continue;
    const code = await fs.readFile(path.join(root, name), 'utf8');
    if (name === 'scripts/store-announcement.js') storeCode = code;
    else runtime.push(code);
    if (!excluded.has(name)) scripts.push([name, code]);
  }
  const crypto = require('node:crypto');
  const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
  const js = (await minify(runtime.join('\n;\n'), { compress: true, mangle: true })).code;
  const jsName = 'scripts/site.' + hash(js) + '.js';
  let css = '';
  for (const link of sourceDocument.querySelectorAll('link[rel="stylesheet"]')) {
    const name = link.getAttribute('href').split('?')[0];
    assert.ok(!/^https?:/.test(name), 'Keep critical styles local: ' + name);
    let content = await fs.readFile(path.join(root, name), 'utf8');
    // Bundled CSS lives in styles/, so retain each source stylesheet's URL base.
    content = content.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (all, quote, value) => {
      if (/^(data:|https?:|\/|#)/.test(value)) return all;
      return 'url(/' + path.posix.join(path.posix.dirname(name), value) + ')';
    });
    css += '\n' + content;
  }
  const minifiedCss = new CleanCSS({ level: 1 }).minify(css);
  assert.deepEqual(minifiedCss.errors, [], 'CSS minification failed');
  css = minifiedCss.styles;
  const criticalSource = css;
  // Font declarations live in the always-present critical styles. Defining them twice
  // can trigger another font selection when the asynchronous stylesheet arrives.
  const fullStyles = postcss.parse(css);
  fullStyles.walkAtRules('font-face', rule => rule.remove());
  css = fullStyles.toString();
  const cssName = 'styles/site.' + hash(css) + '.css';
  const templates = new Map();
  for (const name of await fs.readdir(path.join(root, 'pages'))) {
    if (name.endsWith('.html')) templates.set('pages/' + name, await fs.readFile(path.join(root, 'pages', name), 'utf8'));
  }

  function renderContext(route) {
    const { document } = parseHTML(shell);
    const context = {
      document, URL, console,
      location: new URL(route, origin),
      scrollY: 0, innerWidth: 1440,
      addEventListener: noOp, removeEventListener: noOp, scrollTo: noOp,
      matchMedia: () => ({ matches: true }),
      setTimeout: () => 0, clearTimeout: noOp, setInterval: () => 0, clearInterval: noOp,
      requestAnimationFrame: () => 0, cancelAnimationFrame: noOp,
      Image: function () { return document.createElement('img'); },
      // Maps initialize on the visitor's device; the address is rendered below.
      ContactMap: () => ({ destroy: noOp }),
      fetch: () => { throw new Error('Network access is not part of the HTML build.'); }
    };
    context.window = context;
    context.Router = { getRouteHref: value => context.SiteRoutes.href(value), navigate: noOp };
    vm.createContext(context);
    for (const [name, code] of scripts) vm.runInContext(code, context, { filename: name, timeout: 5000 });
    return context;
  }

  const data = renderContext('/');
  // Start the existing popup with a small, independent script before SPA hydration.
  // Keep its configuration and helpers local; the app reuses the same initialized instance.
  const popupSource = data.SiteData.storeAnnouncement.image.split('?')[0];
  const popupImages = { [popupSource]: imageAssets[popupSource] };
  const popupJs = (await minify('(function(){var SiteData=' + JSON.stringify({
    trendyol: data.SiteData.trendyol, storeAnnouncement: data.SiteData.storeAnnouncement
  }) + ';var ImageAssets=' + JSON.stringify(popupImages) + ';' +
    data.escapeAttr.toString() + ';' + data.setResponsiveImage.toString() + ';' + storeCode +
    ';window.StoreAnnouncement=StoreAnnouncement;StoreAnnouncement.init();})();',
    { compress: true, mangle: true })).code;
  const routes = ['/', ...Object.keys(data.SiteRoutes.pages).filter(key => key !== 'home').map(key => data.SiteRoutes.href(key)),
    ...Object.keys(data.GroupSlugToEnum).map(slug => data.SiteRoutes.href('products/' + slug)),
    ...data.blogPosts.map(post => data.SiteRoutes.href('blog/' + data.blogSlug(post)))];
  assert.equal(new Set(routes).size, routes.length, 'Duplicate route: check blog slugs.');
  const aliases = Object.fromEntries(data.blogPosts.map((post, index) => [data.SiteRoutes.href('blog/' + index), data.SiteRoutes.href('blog/' + data.blogSlug(post))]));
  // Plesk serves physical directory indexes; Workers use an internal document store.
  const output = forPlesk ? dist : path.join(dist, 'seo-pages');
  const manifestFile = forPlesk ? path.join(root, 'state', 'plesk-build.json') : path.join(output, 'manifest.json');
  await fs.mkdir(output, { recursive: true });
  let previous = { routes: [] };
  try { previous = JSON.parse(await fs.readFile(manifestFile, 'utf8')); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const desired = new Set([...routes, ...Object.keys(aliases)].map(route => route.replace(/\/+$/, '')));
  for (const route of [...previous.routes, ...Object.keys(previous.aliases || {})].filter(route => !desired.has(route.replace(/\/+$/, '')))) {
    if (!/^\/[a-z0-9_/-]*$/.test(route) || route.includes('..')) throw new Error('Unsafe generated route');
    await fs.rm(path.join(output, route.slice(1), 'index.html'), { force: true });
  }

  const titles = new Set();
  for (const route of [...routes, '/404/']) {
    const context = renderContext(route);
    const document = context.document;
    const main = document.getElementById('page-content');
    const [page = 'home', parameter] = route.split('/').filter(Boolean);
    main.innerHTML = templates.get(route === '/404/' ? 'pages/not-found.html' : context.SiteRoutes.template(page, parameter));
    if (route === '/404/') {
      context.PageSEO.update('404 - Sayfa Bulunamadı', 'Aradığınız sayfa bulunamadı.', '404');
      document.querySelector('meta[name="robots"]').setAttribute('content', 'noindex, follow');
      document.querySelector('link[rel="canonical"]')?.remove();
    } else {
      context.PageControllers.mount(page, parameter, main);
    }
    context.Navbar(document.getElementById('navbar-container'));
    context.Footer(document.getElementById('footer-container'));
    main.setAttribute('data-prerender-route', route);
    document.getElementById('app-loader')?.remove();
    document.getElementById('contact-map')?.replaceChildren();
    document.querySelectorAll('.faq-answer').forEach(answer => {
      answer.removeAttribute('inert');
      answer.style.maxHeight = 'none';
    });
    document.querySelectorAll('.faq-question').forEach(button => button.setAttribute('aria-expanded', 'true'));
    // Image loading and decoding are properties in the renderers; emit real attributes.
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      const item = imageAssets[src.split('?')[0]];
      if (item) {
        img.setAttribute('width', item.width);
        img.setAttribute('height', item.height);
        if (item.srcset && img.hasAttribute('src') && !img.hasAttribute('srcset')) {
          img.setAttribute('srcset', item.srcset);
          img.setAttribute('sizes', '(max-width: 767px) 100vw, 800px');
        }
      }
      if (img.closest('.home-certificates')) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('sizes', '220px');
      }
      if (img.loading) img.setAttribute('loading', img.loading);
      if (img.decoding) img.setAttribute('decoding', img.decoding);
    });
    document.querySelectorAll('script[src]').forEach(script => script.remove());
    const popupScript = document.createElement('script');
    popupScript.setAttribute('id', 'store-announcement-bootstrap');
    popupScript.textContent = popupJs.replace(/<\/script/gi, '<\\/script');
    // The small opening dialog needs no additional network round trip or main bundle.
    document.body.insertBefore(popupScript, document.body.firstChild);
    const bundle = document.createElement('script');
    bundle.setAttribute('src', jsName);
    bundle.setAttribute('defer', '');
    document.body.appendChild(bundle);
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove());
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet'); style.setAttribute('href', cssName);
    const critical = document.createElement('style');
    critical.setAttribute('id', 'critical-styles');
    critical.textContent = criticalCss(criticalSource, document);
    document.head.appendChild(critical);
    style.setAttribute('media', 'print');
    style.setAttribute('onload', "this.media='all'");
    style.setAttribute('data-full-styles', '');
    const noScriptStyles = document.createElement('noscript');
    noScriptStyles.innerHTML = '<link rel="stylesheet" href="' + cssName + '">';
    document.head.appendChild(noScriptStyles);
    document.head.appendChild(style);
    document.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => link.remove());
    if (route === '/' && !context.SiteData.storeAnnouncement.enabled) {
      const hero = document.querySelector('.slider-slide img');
      const preload = document.createElement('link');
      preload.setAttribute('rel', 'preload'); preload.setAttribute('as', 'image');
      preload.setAttribute('href', hero.getAttribute('src'));
      preload.setAttribute('imagesrcset', hero.getAttribute('srcset'));
      preload.setAttribute('imagesizes', hero.getAttribute('sizes'));
      preload.setAttribute('fetchpriority', 'high'); document.head.appendChild(preload);
    }
    if (route === '/' && context.SiteData.storeAnnouncement.enabled) {
      // The announcement covers the slider, so its image gets the first download slot.
      document.querySelector('.slider-slide img').setAttribute('fetchpriority', 'low');
    }
    if (context.SiteData.storeAnnouncement.enabled) {
      const popupSource = context.SiteData.storeAnnouncement.image.split('?')[0];
      const popupAsset = imageAssets[popupSource];
      const preload = document.createElement('link');
      preload.setAttribute('rel', 'preload');
      preload.setAttribute('as', 'image');
      preload.setAttribute('href', popupSource);
      if (popupAsset && popupAsset.srcset) preload.setAttribute('imagesrcset', popupAsset.srcset);
      preload.setAttribute('imagesizes', context.StoreAnnouncement.imageSizes);
      preload.setAttribute('fetchpriority', 'high');
      document.head.appendChild(preload);
    }

    assert.equal(main.querySelectorAll('h1').length, 1, route + ': expected one main heading');
    assert.ok(!titles.has(document.title), route + ': duplicate page title');
    titles.add(document.title);
    if (route !== '/404/') assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), origin + route);
    const schema = document.getElementById('dynamic-schema');
    if (schema) JSON.parse(schema.textContent);
    if (page === 'blog' && parameter) assert.ok(main.querySelector('.blog-detail-text').textContent.length > 500, 'Empty article: ' + route);
    if (page === 'faq') assert.equal(main.querySelectorAll('.faq-question').length, context.faqs.length);

    const file = route === '/404/' ? path.join(output, '404.html') : path.join(output, route.slice(1), 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, '<!DOCTYPE html>\n' + document.documentElement.outerHTML, 'utf8');
  }

  await fs.mkdir(path.dirname(manifestFile), { recursive: true });
  await fs.writeFile(manifestFile, JSON.stringify({ routes, aliases }, null, 2) + '\n');
  for (const [alias, canonical] of Object.entries(aliases)) {
    const file = path.join(output, alias.slice(1), 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    if (forPlesk) {
      // Apache sends a permanent redirect; this also works on plain static hosts.
      await fs.writeFile(file, '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">' +
        '<meta name="robots" content="noindex, follow"><link rel="canonical" href="' + origin + canonical + '">' +
        '<meta http-equiv="refresh" content="0;url=' + canonical + '"><title>Yönlendiriliyor | Probiyom</title>' +
        '</head><body><a href="' + canonical + '">Yazıya git</a></body></html>');
    } else {
      await fs.copyFile(path.join(output, canonical.slice(1), 'index.html'), file);
    }
  }
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes.map(route => '  <url><loc>' + origin + route + '</loc></url>').join('\n') + '\n</urlset>\n';
  await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap);
  for (const name of ['data', 'images', 'pages', 'st', 'styles']) await fs.cp(path.join(root, name), path.join(dist, name), { recursive: true, force: true });
  // Keep the original source SVG; only the published copy is optimized.
  const logo = optimizeSvg(await fs.readFile(path.join(root, 'images/logo.svg'), 'utf8'), { multipass: true });
  assert.ok(logo.data.includes('viewBox='), 'Preserve the logo coordinate system');
  await fs.writeFile(path.join(dist, 'images/logo.svg'), logo.data);
  // HTML protects template fragments even when nginx bypasses Apache headers.
  for (const name of await fs.readdir(path.join(dist, 'pages'))) {
    if (!name.endsWith('.html')) continue;
    const file = path.join(dist, 'pages', name);
    const template = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, '<meta name="robots" content="noindex, follow">\n' + template);
  }
  await fs.mkdir(path.join(dist, 'scripts'), { recursive: true });
  for (const name of await fs.readdir(path.join(root, 'scripts'))) {
    if (name.endsWith('.js')) await fs.copyFile(path.join(root, 'scripts', name), path.join(dist, 'scripts', name));
  }
  await fs.writeFile(path.join(dist, jsName), js);
  await fs.writeFile(path.join(dist, cssName), css);
  // Prune only content-addressed bundles generated by this build script.
  for (const directory of ['styles', 'scripts']) {
    for (const name of await fs.readdir(path.join(dist, directory))) {
  if (/^(site|store)\.[a-f0-9]{12}\.(css|js)$/.test(name) && ![cssName, jsName].includes(directory + '/' + name)) {
        await fs.rm(path.join(dist, directory, name));
      }
    }
  }
  for (const name of ['robots.txt', 'sitemap.xml', 'llms.txt', '_headers', 'google48726a64ae31bd98.html']) await fs.copyFile(path.join(root, name), path.join(dist, name));
  if (forPlesk) {
    const redirects = Object.entries(aliases).map(([alias, canonical]) =>
      'RewriteRule ^' + alias.slice(1).replace(/\/$/, '') + '/?$ ' + canonical + ' [R=308,L]');
    const htaccess = [
      '# Generated for Apache/Plesk. Serve real pages; never rewrite unknown URLs to the homepage.',
      'DirectoryIndex index.html',
      'Options -Indexes',
      'ErrorDocument 404 /404.html',
      '',
      '<IfModule mod_rewrite.c>',
      'RewriteEngine On',
      ...redirects,
      'RewriteCond %{THE_REQUEST} \\s/+[^?\\s]*index\\.html[?\\s] [NC]',
      'RewriteRule ^(.*/)?index\\.html$ /$1 [R=308,L]',
      '</IfModule>',
      '',
      '<IfModule mod_headers.c>',
      'Header always set X-Content-Type-Options "nosniff"',
      'Header always set X-Frame-Options "SAMEORIGIN"',
      'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
      '<FilesMatch "\\.(html|txt|xml|json)$">',
      'Header set Cache-Control "no-cache"',
      '</FilesMatch>',
      '<FilesMatch "\\.(css|js|webp|png|jpe?g|svg|woff2)$">',
      'Header set Cache-Control "public, max-age=604800"',
      '</FilesMatch>',
      '<FilesMatch "^((site|store)\\.[a-f0-9]{12}\\.(css|js)|.+-[a-f0-9]{8}-[0-9]+\\.webp)$">',
      'Header set Cache-Control "public, max-age=31536000, immutable"',
      '</FilesMatch>',
      '</IfModule>',
      '',
      '<IfModule mod_deflate.c>',
      'AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript text/javascript application/json application/xml text/xml image/svg+xml',
      '</IfModule>',
      ''
    ].join('\n');
    await fs.writeFile(path.join(dist, '.htaccess'), htaccess);
    await fs.writeFile(path.join(dist, 'pages', '.htaccess'), '<IfModule mod_headers.c>\nHeader always set X-Robots-Tag "noindex, follow"\n</IfModule>\n');
    assert.equal(await fs.stat(path.join(dist, 'blog', 'index.html')).then(info => info.isFile()), true);
    assert.equal(await fs.stat(path.join(dist, 'products', 'index.html')).then(info => info.isFile()), true);
  } else {
    await fs.copyFile(path.join(output, 'index.html'), path.join(dist, 'index.html'));
    await fs.copyFile(path.join(output, '404.html'), path.join(dist, '404.html'));
  }
  console.log('Built ' + routes.length + ' pages, true 404 document, sitemap and ' + path.basename(dist) + '/ package using Node.js only.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
