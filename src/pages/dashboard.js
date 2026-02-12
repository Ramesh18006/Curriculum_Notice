import { getCirculars, getMyReads, getAnalytics, markAsRead, getBusSchedule, getEvents, getAuthUrl } from '../api.js';
import { getUser, clearSession } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast, esc, formatDate } from '../utils.js';

let activeTab = 'circulars';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

export async function renderDashboard() {
  const user = getUser();
  if (!user) return navigate('#login');

  renderApp(`
    <div class="dashboard">
      <div class="top-bar">
        <div class="greeting">
          <h2>Hello, ${esc(user.name)} 👋</h2>
          <p>
            <span class="badge badge-${esc(user.role)}">${esc(user.role)}</span>
            ${user.department ? `&nbsp;${esc(user.department)}` : ''}
            ${user.year ? ' · Year ' + esc(user.year) : ''}
          </p>
        </div>
        <div class="actions">
          ${(user.role === 'admin' || user.role === 'staff') ? '<button class="btn btn-primary btn-sm" id="new-btn">+ New Circular</button>' : ''}
          <button class="btn btn-outline btn-sm" id="logout-btn">Logout</button>
        </div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab ${activeTab === 'circulars' ? 'active' : ''}" data-tab="circulars" role="tab" aria-selected="${activeTab === 'circulars'}">📢 Circulars</button>
        <button class="tab ${activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar" role="tab" aria-selected="${activeTab === 'calendar'}">📅 Calendar</button>
        <button class="tab ${activeTab === 'bus' ? 'active' : ''}" data-tab="bus" role="tab" aria-selected="${activeTab === 'bus'}">🚌 Bus Schedule</button>
      </div>
      <div id="tab-content" role="tabpanel">
        <div class="loading-skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>
  `);

  // Events
  document.getElementById('logout-btn').onclick = () => {
    clearSession();
    navigate('#login');
  };

  const newBtn = document.getElementById('new-btn');
  if (newBtn) newBtn.onclick = () => navigate('#create');

  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => {
      activeTab = t.dataset.tab;
      document.querySelectorAll('.tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      t.classList.add('active');
      t.setAttribute('aria-selected', 'true');
      loadTabContent();
    };
  });

  loadTabContent();
}

async function loadTabContent() {
  const container = document.getElementById('tab-content');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-skeleton">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
    </div>`;

  if (activeTab === 'circulars') await loadCirculars(container);
  else if (activeTab === 'calendar') await loadCalendar(container);
  else await loadBus(container);
}

async function loadCalendar(container) {
  try {
    const events = await getEvents();
    const now = new Date();
    const month = currentMonth;
    const year = currentYear;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    container.innerHTML = `
          <div class="calendar-container">
            <div class="calendar-header-row">
              <div class="calendar-nav">
                <button class="btn btn-outline btn-sm" id="prev-month">←</button>
                <h3>📅 ${monthName} ${year}</h3>
                <button class="btn btn-outline btn-sm" id="next-month">→</button>
              </div>
              <button class="btn btn-outline btn-sm google-btn" id="connect-google">
                <img src="https://www.gstatic.com/images/branding/product/1x/calendar_32dp.png" width="16" />
                Sync Google Calendar
              </button>
            </div>
            <div class="calendar-grid">
              ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="calendar-day-head">${d}</div>`).join('')}
              ${Array(firstDay).fill('').map(() => '<div class="calendar-day empty"></div>').join('')}
              ${Array(daysInMonth).fill(0).map((_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dailyEvents = events.filter(e => e.date.startsWith(dateStr));
      const todayDate = now.getDate();
      const todayMonth = now.getMonth();
      const todayYear = now.getFullYear();
      const isToday = todayDate === day && todayMonth === month && todayYear === year;

      return `
                  <div class="calendar-day ${isToday ? 'today' : ''} ${dailyEvents.length ? 'has-events' : ''}" data-day="${day}">
                    <div class="calendar-date-num">${day}</div>
                    ${dailyEvents.slice(0, 3).map(e => `
                      <div class="event-marker ${esc(e.type)}" title="${esc(e.description)}">
                        ${esc(e.title)}
                      </div>
                    `).join('')}
                    ${dailyEvents.length > 3 ? `<div class="event-marker more">+${dailyEvents.length - 3} more</div>` : ''}
                  </div>
                `;
    }).join('')}
            </div>
          </div>
          <div id="calendar-modal"></div>
        `;

    // Nav Bindings
    document.getElementById('prev-month').onclick = () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      loadCalendar(container);
    };
    document.getElementById('next-month').onclick = () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      loadCalendar(container);
    };

    // Google Sync
    document.getElementById('connect-google').onclick = async () => {
      try {
        const { url } = await getAuthUrl();
        window.open(url, 'Google OAuth', 'width=600,height=600');
      } catch {
        toast('Failed to get auth URL', 'error');
      }
    };

    // Day Click modal
    container.querySelectorAll('.calendar-day:not(.empty)').forEach(el => {
      el.onclick = () => {
        const day = el.dataset.day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dailyEvents = events.filter(e => e.date.startsWith(dateStr));

        if (!dailyEvents.length) return;

        showEventModal(dateStr, dailyEvents);
      };
    });

  } catch (err) {
    container.innerHTML = '<div class="empty-state">Failed to load calendar events.</div>';
  }
}

function showEventModal(dateStr, events) {
  const modalContainer = document.getElementById('calendar-modal');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Events for ${dateStr}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${events.map(e => `
            <div class="modal-event-item">
              <div class="event-title">
                <span class="badge badge-${esc(e.type)}">${esc(e.type)}</span>
                ${esc(e.title)}
              </div>
              <p class="event-desc">${esc(e.description || 'No description provided')}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const close = () => modalContainer.innerHTML = '';
  modalContainer.querySelector('.modal-close').onclick = close;
  modalContainer.querySelector('.modal-backdrop').onclick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) close();
  };
}

async function loadCirculars(container) {
  const user = getUser();
  try {
    const [circulars, readIds] = await Promise.all([
      getCirculars(),
      getMyReads(),
    ]);

    const readSet = new Set(readIds);

    // Admin analytics (batch)
    let analytics = {};
    if (user.role === 'admin' && circulars.length) {
      const results = await Promise.all(
        circulars.map(c => getAnalytics(c.id))
      );
      circulars.forEach((c, i) => { analytics[c.id] = results[i].read_count; });
    }

    if (!circulars.length) {
      container.innerHTML = '<div class="empty-state">No circulars to show.</div>';
      return;
    }

    container.innerHTML = `
      <div class="circulars-feed">
        ${circulars.map(c => {
      const isRead = readSet.has(c.id);
      return `
            <div class="circular-item ${esc(c.priority)}">
              <div class="circular-header">
                <strong>${esc(c.title)}</strong>
                <div class="circular-meta">
                  <span class="badge badge-${esc(c.priority)}">${esc(c.priority)}</span>
                  ${c.target_dept !== 'All' ? `<span class="badge badge-staff">${esc(c.target_dept)}</span>` : ''}
                </div>
              </div>
              <p>${esc(c.content)}</p>
              <div class="circular-footer">
                <span class="info">By ${esc(c.author || 'Admin')} · ${formatDate(c.created_at)}${user.role === 'admin' ? ` · 👁 ${analytics[c.id] || 0} reads` : ''}</span>
                ${user.role !== 'admin'
          ? (isRead
            ? '<button class="btn btn-read btn-sm" disabled>✓ Read</button>'
            : `<button class="btn btn-success btn-sm mark-read" data-id="${c.id}">Mark as Read</button>`)
          : ''}
              </div>
            </div>`;
    }).join('')}
      </div>`;

    // Mark-as-read handlers
    container.querySelectorAll('.mark-read').forEach(btn => {
      btn.onclick = async () => {
        const circularId = btn.getAttribute('data-id');
        try {
          await markAsRead(circularId);
          btn.textContent = '✓ Read';
          btn.className = 'btn btn-read btn-sm';
          btn.disabled = true;
          btn.onclick = null;
          toast('Marked as read', 'success');
        } catch (err) {
          toast(err.message || 'Failed to mark as read', 'error');
        }
      };
    });
  } catch {
    container.innerHTML = '<div class="empty-state">Failed to load circulars. Is the server running?</div>';
  }
}

async function loadBus(container) {
  try {
    const buses = await getBusSchedule();
    if (!buses.length) {
      container.innerHTML = '<div class="empty-state">No bus schedules available.</div>';
      return;
    }
    container.innerHTML = `
      <div class="card">
        <h3>🚌 Bus Schedule</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Route</th><th>Time</th><th>Stops</th></tr></thead>
            <tbody>
              ${buses.map(b => `<tr><td><strong>${esc(b.route_name)}</strong></td><td>${esc(b.departure_time)}</td><td>${esc(b.stops)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch {
    container.innerHTML = '<div class="empty-state">Failed to load bus schedule.</div>';
  }
}
