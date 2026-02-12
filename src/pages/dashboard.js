import { getCirculars, getMyReads, getAnalytics, markAsRead, getBusSchedule, getEvents, getAuthUrl, getComments, postComment } from '../api.js';
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

    // Analytics (for Admin and Authors)
    let analytics = {};
    const needsAnalytics = circulars
      .map((c, i) => (user.role === 'admin' || c.created_by === user.id) ? i : -1)
      .filter(i => i !== -1);

    if (needsAnalytics.length > 0) {
      try {
        const results = await Promise.all(
          needsAnalytics.map(i => getAnalytics(circulars[i].id))
        );
        needsAnalytics.forEach((circIdx, resIdx) => {
          analytics[circulars[circIdx].id] = results[resIdx];
        });
      } catch (e) {
        console.warn('Failed to load analytics', e);
      }
    }

    if (!circulars.length) {
      container.innerHTML = '<div class="empty-state">No circulars to show.</div>';
      return;
    }

    container.innerHTML = `
      <div class="circulars-feed">
        ${circulars.map((c, idx) => {
      const isRead = readSet.has(c.id);
      return `
            <div class="circular-item ${esc(c.priority)}" data-idx="${idx}">
              <div class="circular-header">
                <strong>${esc(c.title)}</strong>
                <div class="circular-meta">
                  <span class="badge badge-${esc(c.priority)}">${esc(c.priority)}</span>
                  ${c.target_dept !== 'All' ? `<span class="badge badge-staff">${esc(c.target_dept)}</span>` : ''}
                </div>
              </div>
              <div class="circular-preview">
                <p>${esc(c.content.substring(0, 120))}${c.content.length > 120 ? '...' : ''}</p>
              </div>
              <div class="circular-footer">
                <span class="info">By ${c.created_by === user.id ? '<strong>You</strong>' : esc(c.author || 'Admin')} · ${formatDate(c.created_at)}${analytics[c.id] ? ` · 👁 ${analytics[c.id].read_count}/${analytics[c.id].total_count} read` : ''}</span>
                ${(user.role !== 'admin' && c.created_by !== user.id)
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
      btn.onclick = async (e) => {
        e.stopPropagation(); // Prevents opening the detail modal
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

    // Detail view handler — click anywhere on a circular card to open detail
    container.querySelectorAll('.circular-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        // Don't open if clicking a button
        if (e.target.closest('button')) return;

        const idx = parseInt(item.getAttribute('data-idx'));
        const circular = circulars[idx];
        if (circular) showCircularDetail(circular, analytics[circular.id]);
      });
    });
  } catch {
    container.innerHTML = `<div class="empty-state">Failed to load circulars. ${user.role === 'staff' ? 'Check if you have created any.' : 'Is the server running?'}</div>`;
  }
}

async function showCircularDetail(c, stats) {
  // Remove any existing modal first
  const existing = document.getElementById('circular-detail-modal');
  if (existing) existing.remove();

  const user = getUser();

  // Build attachment HTML
  let attachmentHTML = '';
  if (c.attachment_url) {
    const url = c.attachment_url;
    const isPDF = url.toLowerCase().endsWith('.pdf');
    if (isPDF) {
      attachmentHTML = `
        <div style="margin:16px 0;">
          <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">📎 Attachment</div>
          <a href="${url}" target="_blank" rel="noopener" 
             style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(108,92,231,0.1);border-radius:8px;color:var(--primary);text-decoration:none;font-weight:500;border:1px solid rgba(108,92,231,0.2);">
            📄 View PDF Document
          </a>
        </div>`;
    } else {
      attachmentHTML = `
        <div style="margin:16px 0;">
          <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">📎 Attachment</div>
          <img src="${url}" alt="Attachment" style="max-width:100%;border-radius:10px;border:1px solid var(--card-border);" />
        </div>`;
    }
  }

  // Create modal
  const overlay = document.createElement('div');
  overlay.id = 'circular-detail-modal';
  overlay.className = 'modal-backdrop';
  overlay.innerHTML = `
    <div class="modal" style="max-height:90vh;display:flex;flex-direction:column;">
      <div class="modal-header">
        <h3>${esc(c.title)}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" style="overflow-y:auto;flex:1;">
        <div style="margin-bottom:16px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
           <span class="badge badge-${esc(c.priority)}">${esc(c.priority)}</span>
           ${c.target_dept !== 'All' ? `<span class="badge badge-staff">${esc(c.target_dept)}</span>` : ''}
           ${c.target_year !== 'All' ? `<span class="badge badge-student">Year ${esc(c.target_year)}</span>` : ''}
        </div>
        ${stats ? `
          <div style="margin-bottom:16px; padding:14px; background:rgba(108,92,231,0.08); border-radius:10px; border:1px solid rgba(108,92,231,0.2);">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">📊 Read Analytics</div>
            <div style="display:flex; gap:20px; font-size:14px; font-weight:600;">
              <span>✅ ${stats.read_count} Read</span>
              <span>⏳ ${stats.unread_count} Unread</span>
              <span>👥 ${stats.total_count} Total</span>
            </div>
          </div>
        ` : ''}
        <div style="white-space:pre-wrap; font-size:15px; color:var(--text); line-height:1.7;">${esc(c.content)}</div>
        ${attachmentHTML}
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--card-border); font-size:13px; color:var(--text-dim);">
          Published by <strong>${c.created_by === user?.id ? 'You' : esc(c.author || 'Admin')}</strong> on ${formatDate(c.created_at)}
        </div>

        <!-- Comments / Feedback Section -->
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--card-border);">
          <h4 style="margin:0 0 12px;font-size:14px;">💬 Comments & Feedback</h4>
          <div id="comments-list" style="max-height:200px;overflow-y:auto;margin-bottom:12px;">
            <div style="color:var(--text-dim);font-size:13px;">Loading comments...</div>
          </div>
          <div style="display:flex;gap:8px;">
            <input id="comment-input" placeholder="Write a comment..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);background:var(--card);color:var(--text);font-size:13px;" />
            <button id="comment-send" class="btn btn-primary btn-sm" style="white-space:nowrap;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  // Load comments
  const commentsList = overlay.querySelector('#comments-list');
  async function loadComments() {
    try {
      const comments = await getComments(c.id);
      if (!comments.length) {
        commentsList.innerHTML = '<div style="color:var(--text-dim);font-size:13px;padding:8px 0;">No comments yet. Be the first to share feedback!</div>';
      } else {
        commentsList.innerHTML = comments.map(cm => `
          <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:12px;color:var(--text-dim);">
              <strong style="color:var(--text);">${esc(cm.author_name)}</strong>
              <span class="badge badge-${cm.author_role === 'admin' ? 'urgent' : cm.author_role === 'staff' ? 'staff' : 'student'}" style="font-size:10px;padding:1px 6px;margin-left:4px;">${esc(cm.author_role)}</span>
              · ${formatDate(cm.created_at)}
            </div>
            <div style="font-size:13px;color:var(--text);margin-top:4px;">${esc(cm.message)}</div>
          </div>
        `).join('');
        commentsList.scrollTop = commentsList.scrollHeight;
      }
    } catch {
      commentsList.innerHTML = '<div style="color:var(--text-dim);font-size:13px;">Failed to load comments.</div>';
    }
  }
  loadComments();

  // Send comment handler
  const sendBtn = overlay.querySelector('#comment-send');
  const commentInput = overlay.querySelector('#comment-input');
  const sendComment = async () => {
    const msg = commentInput.value.trim();
    if (!msg) return;
    sendBtn.disabled = true;
    try {
      await postComment(c.id, msg);
      commentInput.value = '';
      await loadComments();
    } catch (err) {
      toast(err.message || 'Failed to send comment', 'error');
    } finally {
      sendBtn.disabled = false;
    }
  };
  sendBtn.onclick = sendComment;
  commentInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendComment(); });
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
