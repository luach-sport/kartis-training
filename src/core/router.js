// ניתוב בין מסכים לפי מה שאחרי ה-# בכתובת (#/shows, #/show/abc...).
// כל מסך מחזיר פונקציית ניקוי, שנקראת כשעוזבים אותו (למשל כדי להפסיק להאזין לשינויים בענן).

let routes = [];
let onChange = () => {};
let current = null;

function compile(pattern) {
  const names = [];
  const re = new RegExp('^' + pattern.replace(/:[a-zA-Z]+/g, (m) => {
    names.push(m.slice(1));
    return '([^/]+)';
  }) + '/?$');
  return { re, names };
}

export function defineRoutes(list) {
  routes = list.map((r) => ({ ...r, ...compile(r.path) }));
}

export function match(path) {
  for (const route of routes) {
    const m = route.re.exec(path);
    if (m) {
      const params = {};
      route.names.forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
      return { route, params, path };
    }
  }
  return null;
}

export function currentPath() {
  return (location.hash || '').replace(/^#/, '') || '/';
}

export function navigate(path, { replace = false } = {}) {
  const target = '#' + path;
  if (location.hash === target) {
    resolve();
    return;
  }
  if (replace) location.replace(target);
  else location.hash = target;
}

export function goBack(fallback = '/shows') {
  if (history.length > 1 && current && current.path !== fallback) history.back();
  else navigate(fallback, { replace: true });
}

export function getCurrent() {
  return current;
}

export function resolve() {
  const found = match(currentPath()) || match('/');
  current = found;
  onChange(found);
}

export function startRouter(handler) {
  onChange = handler;
  window.addEventListener('hashchange', resolve);
  resolve();
}
