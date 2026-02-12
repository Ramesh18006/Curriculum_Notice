import { register as apiRegister } from '../api.js';
import { navigate } from '../router.js';
import { renderApp, toast } from '../utils.js';

export function renderSignup() {
  renderApp(`
    <div class="auth-page">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join the CircularHub platform</p>
        <div class="form-group">
          <label for="s-name">Full Name</label>
          <input id="s-name" placeholder="Your name" autocomplete="name" />
        </div>
        <div class="form-group">
          <label for="s-email">Email</label>
          <input type="email" id="s-email" placeholder="you@college.edu" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="s-pass">Password</label>
          <div class="input-with-icon">
            <input type="password" id="s-pass" placeholder="Choose a password" autocomplete="new-password" />
            <button type="button" class="toggle-password" id="toggle-s-pass">👁️</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="s-role">Role</label>
            <select id="s-role">
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label for="s-dept">Department</label>
            <select id="s-dept">
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>
        <div class="form-group" id="year-group">
          <label for="s-year">Year</label>
          <select id="s-year">
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
        <button class="btn btn-primary" id="reg-btn">Create Account</button>
        <p style="text-align:center;margin-top:16px">
          <button class="btn btn-ghost" id="to-login">Already have an account? Sign In</button>
        </p>
      </div>
    </div>
  `);

  document.getElementById('reg-btn').onclick = handleSignup;
  document.getElementById('to-login').onclick = () => navigate('#login');

  const passInput = document.getElementById('s-pass');
  const toggleBtn = document.getElementById('toggle-s-pass');
  toggleBtn.onclick = () => {
    const type = passInput.type === 'password' ? 'text' : 'password';
    passInput.type = type;
    toggleBtn.textContent = type === 'password' ? '👁️' : '🔒';
  };

  // Show/hide year/dept fields based on role
  const roleEl = document.getElementById('s-role');
  const yearGroup = document.getElementById('year-group');
  const deptGroup = document.getElementById('s-dept').parentElement;

  const toggleFields = () => {
    const isStudent = roleEl.value === 'student';
    yearGroup.style.display = isStudent ? '' : 'none';
    deptGroup.style.display = isStudent ? '' : 'none';
  };

  roleEl.addEventListener('change', toggleFields);
  toggleFields(); // Init
}

async function handleSignup() {
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const password = document.getElementById('s-pass').value;
  const role = document.getElementById('s-role').value;
  const department = document.getElementById('s-dept').value.trim();
  const year = role === 'student' ? document.getElementById('s-year').value : null;

  const isStudent = role === 'student';

  if (!name || !email || !password || (isStudent && !department)) {
    return toast('Please fill all required fields', 'warning');
  }

  const btn = document.getElementById('reg-btn');
  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    await apiRegister({ name, email, password, role, department, year });
    toast('Account created! Please sign in.', 'success');
    navigate('#login');
  } catch (err) {
    toast(err.message || 'Registration failed', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}
