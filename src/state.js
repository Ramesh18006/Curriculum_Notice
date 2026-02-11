/**
 * Application state management.
 * Encapsulates user + token in localStorage with read/write helpers.
 */

/** @returns {object|null} Current user data. */
export function getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

/** Stores user data and JWT token after login. */
export function setSession(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
}

/** Clears user data and JWT token (logout). */
export function clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

/** @returns {boolean} True if a user is logged in. */
export function isLoggedIn() {
    return !!localStorage.getItem('token');
}
