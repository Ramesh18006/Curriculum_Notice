import { login as apiLogin } from '../api.js';
import { setSession } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast } from '../utils.js';

export function renderLogin() {
    renderApp(`
    <div class="auth-page">
      <div class="auth-card">
        <h1>📢 CircularHub</h1>
        <p class="subtitle">Digital Circular &amp; Notice Management</p>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="you@college.edu" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="pass">Password</label>
          <input type="password" id="pass" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button class="btn btn-primary" id="login-btn">Sign In</button>
        <p style="text-align:center;margin-top:16px">
          <button class="btn btn-ghost" id="to-signup">Don't have an account? Sign Up</button>
        </p>
      </div>
    </div>
  `);

    document.getElementById('login-btn').onclick = handleLogin;
    document.getElementById('to-signup').onclick = () => navigate('#signup');
    document.getElementById('pass').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });
}

async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pass').value;
    if (!email || !password) return toast('Please fill in all fields', 'warning');

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
        const { token, user } = await apiLogin(email, password);
        setSession(user, token);
        navigate('#dashboard');
    } catch (err) {
        toast(err.message || 'Invalid credentials', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}
