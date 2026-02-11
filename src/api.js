/**
 * Centralized API client.
 * All backend calls go through here — handles JWT, parsing, and error normalization.
 */

const BASE = '/api';

/** Returns the stored JWT token, or null. */
function getToken() {
    return localStorage.getItem('token');
}

/** Core fetch wrapper. */
async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return data;
}

// ── Auth ──────────────────────────────────────────────────
export function login(email, password) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function register(payload) {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ── Circulars ─────────────────────────────────────────────
export function getCirculars() {
    return request('/circulars');
}

export function createCircular(payload) {
    return request('/circulars', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function markAsRead(circularId) {
    return request(`/circulars/${circularId}/read`, { method: 'POST' });
}

export function getAnalytics(circularId) {
    return request(`/circulars/${circularId}/analytics`);
}

// ── Users ─────────────────────────────────────────────────
export function getMyReads() {
    return request('/users/reads');
}

export function getMyProfile() {
    return request('/users/me');
}

// ── Bus ───────────────────────────────────────────────────
export function getBusSchedule() {
    return request('/bus');
}
