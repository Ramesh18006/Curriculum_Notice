/**
 * Minimal hash-based router.
 * Registers routes and calls the matching handler on hash change.
 */

const routes = {};
let fallback = () => { };

/** Register a route handler:  `route('#dashboard', renderDashboard)` */
export function route(hash, handler) {
    routes[hash] = handler;
}

/** Set the handler for unknown routes (e.g., redirect to login). */
export function setFallback(handler) {
    fallback = handler;
}

/** Navigate programmatically. */
export function navigate(hash) {
    window.location.hash = hash;
}

/** Resolve the current hash and call the registered handler. */
function resolve() {
    const hash = window.location.hash || '#login';
    const handler = routes[hash] || fallback;
    handler();
}

/** Initialize the router — call once on app boot. */
export function initRouter() {
    window.addEventListener('hashchange', resolve);
    resolve();
}
