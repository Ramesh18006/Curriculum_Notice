import { createCircular } from '../api.js';
import { getUser } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast } from '../utils.js';

export function renderCreate() {
    const user = getUser();
    if (!user || user.role !== 'admin') return navigate('#dashboard');

    renderApp(`
    <div class="create-page">
      <button class="btn btn-ghost" id="back-btn">← Back to Dashboard</button>
      <h2>Create New Circular</h2>
      <div class="card">
        <div class="form-group">
          <label for="c-title">Title</label>
          <input id="c-title" placeholder="Circular title" maxlength="255" />
        </div>
        <div class="form-group">
          <label for="c-content">Content</label>
          <textarea id="c-content" placeholder="Write the circular content…" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="c-priority">Priority</label>
            <select id="c-priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label for="c-dept">Target Department</label>
            <select id="c-dept">
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="c-year">Target Year</label>
          <select id="c-year">
            <option value="All">All Years</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="publish-btn">Publish Circular</button>
        </div>
      </div>
    </div>
  `);

    document.getElementById('back-btn').onclick = () => navigate('#dashboard');
    document.getElementById('publish-btn').onclick = handleCreate;
}

async function handleCreate() {
    const title = document.getElementById('c-title').value.trim();
    const content = document.getElementById('c-content').value.trim();
    const priority = document.getElementById('c-priority').value;
    const target_dept = document.getElementById('c-dept').value;
    const target_year = document.getElementById('c-year').value;

    if (!title || !content) return toast('Title and content are required', 'warning');

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = 'Publishing…';

    try {
        await createCircular({ title, content, priority, target_dept, target_year });
        toast('Circular published!', 'success');
        navigate('#dashboard');
    } catch (err) {
        toast(err.message || 'Failed to create circular', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Publish Circular';
    }
}
