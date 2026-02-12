/**
 * CircularHub — App entry point.
 * Boots the router and registers all page handlers.
 */
import './style.css';

import { route, setFallback, initRouter } from './router.js';
import { isLoggedIn, getUser } from './state.js';

import { renderLogin } from './pages/login.js';
import { renderSignup } from './pages/signup.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCreate } from './pages/create.js';

// ── Route table ──────────────────────────────────────────
route('#login', renderLogin);
route('#signup', renderSignup);
route('#dashboard', renderDashboard);
route('#create', () => {
  const user = getUser();
  if (user?.role === 'admin' || user?.role === 'staff') renderCreate();
  else renderDashboard();
});

// ── Fallback: redirect based on auth status ──────────────
setFallback(() => {
  isLoggedIn() ? renderDashboard() : renderLogin();
});

// ── Boot ─────────────────────────────────────────────────
initRouter();