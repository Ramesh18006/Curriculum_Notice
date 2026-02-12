import { createCircular } from '../api.js';
import { getUser } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast } from '../utils.js';
import { t } from '../i18n.js';

export function renderCreate() {
  const user = getUser() || {};
  const isStaff = user.role?.toLowerCase() === 'staff';

  renderApp(`
    <div class="create-page">
      <button class="btn btn-ghost" id="back-btn">${t('backToDashboard')}</button>
      <h2>${t('createTitle')}</h2>
      <div class="card">
        <div class="form-group">
          <label for="c-title">${t('titleLabel')}</label>
          <input id="c-title" placeholder="${t('titlePlaceholder')}" maxlength="255" />
        </div>
        <div class="form-group">
          <label for="c-content">${t('contentLabel')}</label>
          <textarea id="c-content" placeholder="${t('contentPlaceholder')}" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="c-priority">${t('priorityLabel')}</label>
            <select id="c-priority">
              <option value="low">${t('priorityLow')}</option>
              <option value="medium">${t('priorityMedium')}</option>
              <option value="urgent">${t('priorityUrgent')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="c-role">${t('targetRole')}</label>
            <select id="c-role" ${isStaff ? 'disabled' : ''}>
              ${isStaff ? `<option value="student">${t('studentsOnly')}</option>` : `
                <option value="All">${t('everyone')}</option>
                <option value="student">${t('studentsOnly')}</option>
                <option value="staff">${t('staffOnly')}</option>
              `}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="c-dept">${t('targetDept')}</label>
            <select id="c-dept">
              <option value="All">${t('allDepts')}</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>
          <div class="form-group">
            <label for="c-year">${t('targetYear')}</label>
            <select id="c-year">
              <option value="All">${t('allYears')}</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="c-attachment">${t('attachmentLabel')}</label>
          <input type="file" id="c-attachment" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" />
          <small style="color: var(--text-dim);margin-top:4px;display:block;">${t('attachmentHint')}</small>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="c-event-date">${t('eventDateLabel')}</label>
            <input type="date" id="c-event-date" />
            <small style="color: var(--text-dim);margin-top:4px;display:block;">${t('eventDateHint')}</small>
          </div>
          <div class="form-group">
            <label for="c-event-type">${t('eventTypeLabel')}</label>
            <select id="c-event-type">
              <option value="event">${t('eventGeneral')}</option>
              <option value="celebration">${t('eventCelebration')}</option>
              <option value="exam">${t('eventExam')}</option>
              <option value="holiday">${t('eventHoliday')}</option>
              <option value="workshop">${t('eventWorkshop')}</option>
              <option value="seminar">${t('eventSeminar')}</option>
              <option value="deadline">${t('eventDeadline')}</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="publish-btn">${t('publishBtn')}</button>
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
  const roleEl = document.getElementById('c-role');
  const target_role = roleEl ? roleEl.value : 'student';
  const target_dept = document.getElementById('c-dept').value;
  const target_year = document.getElementById('c-year').value;
  const fileInput = document.getElementById('c-attachment');

  if (!title || !content) return toast(t('titleContentRequired'), 'warning');

  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.textContent = t('publishing');

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('priority', priority);
    formData.append('target_role', target_role);
    formData.append('target_dept', target_dept);
    formData.append('target_year', target_year);
    if (fileInput.files[0]) {
      formData.append('attachment', fileInput.files[0]);
    }
    const eventDate = document.getElementById('c-event-date').value;
    const eventType = document.getElementById('c-event-type').value;
    if (eventDate) {
      formData.append('event_date', eventDate);
      formData.append('event_type', eventType);
    }

    await createCircular(formData);
    toast(t('published'), 'success');
    navigate('#dashboard');
  } catch (err) {
    toast(err.message || 'Failed to create circular', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('publishBtn');
  }
}
