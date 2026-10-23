// Extract first-screen styles without a browser. The complete stylesheet remains available.
const postcss = require('postcss');
const CleanCSS = require('clean-css');

module.exports = function criticalCss(css, document) {
  const classes = new Set(['app-footer', 'is-scrolled', 'is-open', 'is-active', 'force-hide', 'd-none']);
  const ids = new Set(['navbar-container', 'page-content']);
  const roots = document.querySelectorAll('.app-header, #mobile-fab-container, #page-content > :first-child, #page-content > section:nth-of-type(-n+2)');
  for (const root of roots) {
    for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) {
      for (const name of ancestor.classList) classes.add(name);
      if (ancestor.id) ids.add(ancestor.id);
    }
    for (const element of [root, ...root.querySelectorAll('*')]) {
      for (const name of element.classList) classes.add(name);
      if (element.id) ids.add(element.id);
    }
  }
  function relevant(selector) {
    if (/\.store-announcement(?:\b|__)/.test(selector)) return true;
    const usedClasses = [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(match => match[1]);
    const usedIds = [...selector.matchAll(/#([a-zA-Z_][\w-]*)/g)].map(match => match[1]);
    return usedClasses.every(name => classes.has(name)) && usedIds.every(name => ids.has(name));
  }
  function prune(container) {
    for (const node of [...(container.nodes || [])]) {
      if (node.type === 'comment') { node.remove(); continue; }
      if (node.type === 'rule') {
        // Keep whole selector lists, including functional pseudo-classes.
        if (!postcss.list.comma(node.selector).some(relevant)) node.remove();
      } else if (node.type === 'atrule' && !/^(font-face|(?:-\w+-)?keyframes)$/i.test(node.name)) {
        if (node.nodes) {
          prune(node);
          if (!node.nodes.length) node.remove();
        }
      }
    }
  }
  const tree = postcss.parse(css);
  prune(tree);
  const result = new CleanCSS({ level: 1 }).minify(tree.toString());
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  return result.styles;
};
