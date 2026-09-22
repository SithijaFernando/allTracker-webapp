// Minimal hash router. No dependencies, no build complexity.
// Each route renders into the #content element.

type RouteHandler = () => void | Promise<void>;

const routes: Record<string, RouteHandler> = {};

export function registerRoute(path: string, handler: RouteHandler) {
  routes[path] = handler;
}

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "" ? "/" : hash;
}

async function render() {
  const path = currentPath();
  const handler = routes[path] ?? routes["/"];

  document.querySelectorAll<HTMLAnchorElement>(".nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === path);
  });

  await handler();
}

export function startRouter() {
  window.addEventListener("hashchange", render);
  render();
}
