import { getCirculars, getMyReads, getAnalytics, markAsRead, getBusSchedule } from '../api.js';
import { getUser, clearSession } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast, esc, formatDate } from '../utils.js';

let activeTab = 'circulars';

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
            &nbsp;${esc(user.department || '')}${user.year ? ' · Year ' + esc(user.year) : ''}
          </p>
        </div>
        <div class="actions">
          ${user.role === 'admin' ? '<button class="btn btn-primary btn-sm" id="new-btn">+ New Circular</button>' : ''}
          <button class="btn btn-outline btn-sm" id="logout-btn">Logout</button>
        </div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab ${activeTab === 'circulars' ? 'active' : ''}" data-tab="circulars" role="tab" aria-selected="${activeTab === 'circulars'}">📢 Circulars</button>
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
    else await loadBus(container);
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
                try {
                    await markAsRead(btn.dataset.id);
                    btn.textContent = '✓ Read';
                    btn.className = 'btn btn-read btn-sm';
                    btn.disabled = true;
                    btn.onclick = null;
                    toast('Marked as read', 'success');
                } catch {
                    toast('Failed to mark as read', 'error');
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
