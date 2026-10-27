/* Node-only SEO regression checks for the exact publication output. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const workerOutput = process.argv.includes('--worker');
const output = path.join(root, workerOutput ? 'dist' : 'dist-plesk');
const manifest = JSON.parse(fs.readFileSync(workerOutput ? path.join(output, 'seo-pages/manifest.json') : path.join(root, 'state/plesk-build.json'), 'utf8'));
const origin = 'https://www.probiyom.com';
const documents = new Map();
const titles = new Set(), descriptions = new Set();
const pageFile = route => path.join(output, workerOutput ? 'seo-pages' : '', route, 'index.html');
const document404 = fs.readFileSync(path.join(output, workerOutput ? 'seo-pages/404.html' : '404.html'), 'utf8');
const verification = [...parseHTML(fs.readFileSync(path.join(root, 'index.html'), 'utf8')).document.querySelectorAll('meta[name="google-site-verification"]')].map(e => e.getAttribute('content'));

function localFile(url) {
  const file = path.resolve(output, '.' + decodeURIComponent(url.pathname));
  return file.startsWith(output + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile();
}

function checkDocuments() {
  assert.ok(manifest.routes.length > 0);
  assert.equal(new Set(manifest.routes).size, manifest.routes.length);
  const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual([...urls].sort(), manifest.routes.map(route => origin + route).sort(), 'Sitemap must contain exactly the canonical, indexable routes');
  const robots = fs.readFileSync(path.join(output, 'robots.txt'), 'utf8');
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.probiyom\.com\/sitemap\.xml\s*$/m);
  assert.ok(!/^\s*Disallow:\s*\/\s*$/m.test(robots), 'Public pages must not be blocked');

  for (const route of manifest.routes) {
    const html = fs.readFileSync(pageFile(route), 'utf8');
    const { document } = parseHTML(html);
    documents.set(route, { html, document });
    const canonical = document.querySelectorAll('link[rel="canonical"]');
    assert.equal(canonical.length, 1, route);
    assert.equal(canonical[0].getAttribute('href'), origin + route, route);
    assert.equal(document.querySelector('meta[property="og:url"]').getAttribute('content'), origin + route, route);
    const metaRobots = document.querySelectorAll('meta[name="robots"]');
    assert.equal(metaRobots.length, 1, route);
    assert.ok(!/noindex/i.test(metaRobots[0].getAttribute('content')), route);
    assert.equal(document.querySelectorAll('h1').length, 1, route);
    assert.ok(document.querySelector('#page-content').textContent.trim().length > 200, route + ': meaningful HTML must exist before JavaScript');
    const description = document.querySelector('meta[name="description"]').getAttribute('content');
    assert.ok(document.title && !titles.has(document.title), route + ': duplicate or empty title');
    assert.ok(description && !descriptions.has(description), route + ': duplicate or empty description');
    titles.add(document.title); descriptions.add(description);
    for (const node of document.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(node.textContent);
    assert.ok(html.includes('GTM-578BDWC9'), route);
    assert.deepEqual([...document.querySelectorAll('meta[name="google-site-verification"]')].map(e => e.getAttribute('content')), verification, route);
    assert.ok(document.querySelector('#critical-styles').textContent.length > 0, route);
    assert.ok(document.querySelector('#store-announcement-bootstrap').textContent.includes('StoreAnnouncement'), route);
    assert.equal(document.querySelectorAll('script[src]').length, 1, route);
    assert.match(document.querySelector('script[src]').getAttribute('src'), /^scripts\/site\.[a-f0-9]{12}\.js$/);
    const styles = document.querySelector('link[data-full-styles]');
    assert.equal(styles.getAttribute('media'), 'print', route);
    assert.equal(document.querySelector('noscript link[rel="stylesheet"]').getAttribute('href'), styles.getAttribute('href'), route);
    for (const element of document.querySelectorAll('img[src],script[src],link[rel="stylesheet"]')) {
      const value = element.getAttribute('src') || element.getAttribute('href');
      if (!value) continue;
      const url = new URL(value, origin + '/');
      if (url.origin === origin) assert.ok(localFile(url), route + ': missing asset ' + url.pathname);
    }
  }
  for (const [route, { document }] of documents) {
    for (const anchor of document.querySelectorAll('a[href]')) {
      const url = new URL(anchor.getAttribute('href'), origin + '/');
      if (!['probiyom.com', 'www.probiyom.com'].includes(url.hostname)) continue;
      assert.equal(url.origin, origin, route + ': link uses a noncanonical host');
      assert.ok(!manifest.aliases[url.pathname], route + ': link points to a redirect');
      assert.ok(documents.has(url.pathname) || localFile(url), route + ': broken internal link ' + url.pathname);
      if (/^#\/?(?:home|about|products|contact|faq|blog)(?:\/|$)/.test(url.hash)) {
        assert.ok(documents.get(url.pathname)?.document.getElementById(decodeURIComponent(url.hash.slice(1))), route + ': legacy hash navigation remains');
      }
    }
  }
  const errorDocument = parseHTML(document404).document;
  assert.ok(!errorDocument.querySelector('link[rel="canonical"]'));
  assert.match(errorDocument.querySelector('meta[name="robots"]').getAttribute('content'), /noindex/);
}

async function checkRouter() {
  const cases = [
    ['/#/blog/0', '/blog/ilk-yazi/'], ['/#blog/1', '/blog/ikinci-yazi/'],
    ['/blog/0/?utm=test', '/blog/ilk-yazi/?utm=test'],
    ['/about/#/', '/'], ['/#/products/home_cleaning', '/products/home_cleaning/'],
    ['/#details', '/#details'], ['/#blog', '/#blog']
  ];
  for (const [input, expected] of cases) {
    const { document } = parseHTML('<html><head><meta name="robots" content="index, follow"><link rel="canonical" href="' + origin + '/"></head><body><main id="page-content"></main><section id="details"></section><section id="blog"></section></body></html>');
    const context = { document, URL, CustomEvent: document.defaultView.CustomEvent, location: new URL(input, origin),
      blogPosts: [{ slug: 'ilk-yazi' }, { slug: 'ikinci-yazi' }], GroupSlugToEnum: { home_cleaning: 0 },
      addEventListener() {}, scrollTo() {}, fetch: async () => ({ ok: true, text: async () => '<h1>Page</h1>' }) };
    context.window = context;
    const move = (_state, _title, url) => { context.location = new URL(url, context.location); };
    context.history = { replaceState: move, pushState: move };
    context.PageControllers = { mount: () => ({ destroy() {} }) };
    const entries = [];
    let cancelledEntries = 0;
    document.querySelector('main').animate = (frames, options) => {
      entries.push({ frames, duration: options.duration });
      return { cancel() { cancelledEntries += 1; } };
    };
    vm.createContext(context);
    for (const file of ['site-routes.js', 'helpers.js', 'page-seo.js', 'router.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
    context.Router.init(document.querySelector('main'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(context.location.pathname + context.location.search + context.location.hash, expected, input);
    context.Router.navigate('blog/0');
    assert.equal(context.location.pathname, '/blog/ilk-yazi/');
    context.Router.navigate('products/unknown');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(document.querySelector('link[rel="canonical"]'), null);
    assert.match(document.querySelector('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.ok(entries.length > 0, 'Ready SPA pages fade in');
    assert.equal(entries[0].duration, 220);
    assert.deepEqual(Object.keys(entries[0].frames[0]), ['opacity'], 'Page entry must not animate layout');
    assert.ok(cancelledEntries > 0, 'Navigation cancels the previous entry animation');
  }
}

async function checkWorker() {
  const worker = (await import(pathToFileURL(path.join(__dirname, 'seo-worker.mjs')).href)).default;
  const env = { ASSETS: { async fetch(request) {
    const pathname = new URL(request.url).pathname;
    let body;
    if (pathname === '/seo-pages/manifest.json') body = JSON.stringify(manifest);
    else if (pathname === '/seo-pages/404.html') body = document404;
    else if (pathname.startsWith('/seo-pages/')) {
      const route = pathname.slice('/seo-pages'.length).replace(/index\.html$/, '');
      body = documents.get(route)?.html;
    }
    if (body === undefined) return new Response('Missing', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : body, { headers: { 'content-type': pathname.endsWith('.json') ? 'application/json' : 'text/html' } });
  } } };
  const request = (url, method = 'GET') => worker.fetch(new Request(url, { method }), env);
  for (const from of ['http://probiyom.com/', 'https://probiyom.com/', 'http://www.probiyom.com/']) {
    const response = await request(from + '?source=test');
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('location'), origin + '/?source=test');
  }
  for (const route of manifest.routes) for (const method of ['GET', 'HEAD']) {
    const response = await request(origin + route, method);
    assert.equal(response.status, 200, route);
    if (method === 'HEAD') assert.equal(await response.text(), '');
    if (route !== '/') {
      const redirect = await request(origin + route + 'index.html?source=test');
      assert.equal(redirect.status, 308, route);
      assert.equal(redirect.headers.get('location'), origin + route + '?source=test');
    }
  }
  for (const route of ['/Probiyotik', '/unknown/', '/unknown/index.html', '/products/unknown/', '/blog/unknown/', '/404.html']) {
    const response = await request(origin + route);
    assert.equal(response.status, 404, route);
    assert.match(response.headers.get('x-robots-tag'), /noindex/, route);
  }
  assert.equal((await request('https://preview.workers.dev/about/')).status, 200, 'Preview hosts must remain usable');
}

function checkSlider() {
  const { document, Event } = parseHTML('<html><body><div id="slider"></div></body></html>').window;
  const timers = new Map();
  let timerId = 0;
  const context = { document, matchMedia: () => ({ matches: false }),
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id) };
  context.window = context;
  vm.createContext(context);
  for (const file of ['helpers.js', 'slider.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
  const container = document.querySelector('#slider');
  const slider = context.ImageSlider(container, [{ src: '/a.webp' }, { src: '/b.webp' }, { src: '/c.webp' }], 7000);
  const next = () => { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); };
  next();
  assert.equal(container.querySelector('.dock-counter').textContent, '02 / 03');
  assert.equal(container.querySelectorAll('img')[2].getAttribute('src'), '/c.webp', 'Preload the upcoming image after each transition');
  next(); next();
  assert.equal(container.querySelector('.dock-counter').textContent, '01 / 03', 'Autoplay wraps to the first slide');
  container.querySelector('.dock-btn-pause').dispatchEvent(new Event('click'));
  assert.equal(timers.size, 0, 'Pause cancels autoplay');
  container.querySelector('.dock-btn-pause').dispatchEvent(new Event('click'));
  assert.equal(timers.size, 1, 'Resume schedules exactly one transition');
  slider.destroy();
  assert.equal(timers.size, 0, 'Route changes clean up the slider timer');
}

function checkMotionPreference() {
  const { document } = parseHTML('<html><body></body></html>');
  let systemReduced = true;
  const context = { document, matchMedia: () => ({ matches: systemReduced }) };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'helpers.js'), 'utf8'), context);
  assert.equal(context.isMotionReduced(), true, 'System reduced motion remains the default');
  document.documentElement.setAttribute('data-motion', 'full');
  assert.equal(context.isMotionReduced(), false, 'Explicit site choice enables motion');
  document.documentElement.removeAttribute('data-motion');
  systemReduced = false;
  assert.equal(context.isMotionReduced(), false, 'Normal system motion is preserved');
}

(async () => {
  checkDocuments();
  checkMotionPreference();
  checkSlider();
  await checkRouter();
  await checkWorker();
  console.log('PASS: ' + manifest.routes.length + ' pages; sitemap, robots, HTML metadata, schema, assets, internal links, legacy hashes, canonical redirects and true 404 responses (' + path.basename(output) + ').');
})().catch(error => { console.error(error); process.exitCode = 1; });
