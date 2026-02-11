/**
 * Shared utilities — toast notifications, HTML escaping, date formatting.
 */

// ── XSS Protection ───────────────────────────────────────
const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes HTML special characters to prevent XSS. */
export function esc(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ESCAPE_MAP[c]);
}

// ── Toast ─────────────────────────────────────────────────
let toastTimer = null;

export function toast(msg, type = 'info') {
    // Remove previous toast if still visible
    document.querySelectorAll('.toast').forEach(el => el.remove());
    clearTimeout(toastTimer);

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);

    toastTimer = setTimeout(() => el.remove(), 3200);
}

// ── Date Formatting ──────────────────────────────────────
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// ── DOM Helper ───────────────────────────────────────────
/** Shortcut to set innerHTML on `#app` and return the element. */
export function renderApp(html) {
    const app = document.querySelector('#app');
    app.innerHTML = html;
    return app;
}
