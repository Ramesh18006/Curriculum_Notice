import { getCirculars, getMyReads, getAnalytics, markAsRead, getBusSchedule, getEvents, getAuthUrl, getComments, postComment, getFeedback, postFeedback, getAnalyticsSummary } from '../api.js';
import { getUser, clearSession } from '../state.js';
import { navigate } from '../router.js';
import { renderApp, toast, esc, formatDate } from '../utils.js';
import { t, setLang, getLang, languages } from '../i18n.js';

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
          <h2>${t('hello')}, ${esc(user.name)} 👋</h2>
          <p>
            <span class="badge badge-${esc(user.role)}">${esc(user.role)}</span>
            ${user.department ? `&nbsp;${esc(user.department)}` : ''}
            ${user.year ? ' · Year ' + esc(user.year) : ''}
          </p>
        </div>
        <div class="actions">
          <select id="lang-switcher" class="btn btn-outline btn-sm" style="padding:4px 8px;font-size:12px;">
            ${languages.map(l => `<option value="${l.code}" ${getLang() === l.code ? 'selected' : ''}>${l.label}</option>`).join('')}
          </select>
          ${(user.role === 'admin' || user.role === 'staff') ? `<button class="btn btn-primary btn-sm" id="new-btn">${t('newCircular')}</button>` : ''}
          <button class="btn btn-outline btn-sm" id="logout-btn">${t('logout')}</button>
        </div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab ${activeTab === 'circulars' ? 'active' : ''}" data-tab="circulars" role="tab">${t('tabCirculars')}</button>
        <button class="tab ${activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar" role="tab">${t('tabCalendar')}</button>
        <button class="tab ${activeTab === 'feedback' ? 'active' : ''}" data-tab="feedback" role="tab">${t('tabFeedback')}</button>
        ${(user.role === 'admin' || user.role === 'staff') ? `<button class="tab ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics" role="tab">${t('tabAnalytics')}</button>` : ''}
        <button class="tab ${activeTab === 'bus' ? 'active' : ''}" data-tab="bus" role="tab">${t('tabBus')}</button>
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

  // Language switcher
  document.getElementById('lang-switcher').onchange = (e) => {
    setLang(e.target.value);
    renderDashboard(); // Re-render with new language
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
  else if (activeTab === 'feedback') await loadFeedback(container);
  else if (activeTab === 'analytics') await loadAnalyticsDashboard(container);
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
                ${t('syncGoogle')}
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
    container.innerHTML = `<div class="empty-state">${t('failedCalendar')}</div>`;
  }
}

function showEventModal(dateStr, events) {
  const modalContainer = document.getElementById('calendar-modal');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>${t('eventsFor')} ${dateStr}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${events.map(e => `
            <div class="modal-event-item">
              <div class="event-title">
                <span class="badge badge-${esc(e.type)}">${esc(e.type)}</span>
                ${esc(e.title)}
              </div>
              <p class="event-desc">${esc(e.description || t('noDescription'))}</p>
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

    // Sort: pinned urgent unread first, then by date
    const sorted = [...circulars].sort((a, b) => {
      const aUrgentUnread = a.priority === 'urgent' && !readSet.has(a.id) && a.created_by !== user.id;
      const bUrgentUnread = b.priority === 'urgent' && !readSet.has(b.id) && b.created_by !== user.id;
      if (aUrgentUnread && !bUrgentUnread) return -1;
      if (!aUrgentUnread && bUrgentUnread) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Analytics (for Admin and Authors)
    let analytics = {};
    const needsAnalytics = sorted
      .map((c, i) => (user.role === 'admin' || c.created_by === user.id) ? i : -1)
      .filter(i => i !== -1);

    if (needsAnalytics.length > 0) {
      try {
        const results = await Promise.all(
          needsAnalytics.map(i => getAnalytics(sorted[i].id))
        );
        needsAnalytics.forEach((circIdx, resIdx) => {
          analytics[sorted[circIdx].id] = results[resIdx];
        });
      } catch (e) {
        console.warn('Failed to load analytics', e);
      }
    }

    if (!sorted.length) {
      container.innerHTML = `<div class="empty-state">${t('noCirculars')}</div>`;
      return;
    }

    container.innerHTML = `
      <div class="circulars-feed">
        ${sorted.map((c, idx) => {
      const isRead = readSet.has(c.id);
      const isPinned = c.priority === 'urgent' && !isRead && c.created_by !== user.id;
      return `
            <div class="circular-item ${esc(c.priority)}${isPinned ? ' pinned' : ''}" data-idx="${idx}">
              ${isPinned ? `<div class="pin-badge">${t('pinned')}</div>` : ''}
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
                <span class="info">${t('by')} ${c.created_by === user.id ? `<strong>${t('byYou')}</strong>` : esc(c.author || 'Admin')} · ${formatDate(c.created_at)}${analytics[c.id] ? ` · 👁 ${analytics[c.id].read_count}/${analytics[c.id].total_count} ${t('readLabel')}` : ''}</span>
                ${(user.role !== 'admin' && c.created_by !== user.id)
          ? (isRead
            ? `<button class="btn btn-read btn-sm" disabled>${t('read')}</button>`
            : `<button class="btn btn-success btn-sm mark-read" data-id="${c.id}">${t('markAsRead')}</button>`)
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
          btn.textContent = t('read');
          btn.className = 'btn btn-read btn-sm';
          btn.disabled = true;
          btn.onclick = null;
          toast(t('markedAsRead'), 'success');
          // Re-sort by reloading to move pinned item to normal position
          loadCirculars(container);
        } catch (err) {
          toast(err.message || t('failedCirculars'), 'error');
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
        const circular = sorted[idx];
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
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-outline btn-sm" id="export-pdf-btn" title="Export as PDF" style="display:flex;align-items:center;gap:4px;font-size:12px;">
            📄 PDF
          </button>
          <button class="modal-close">&times;</button>
        </div>
      </div>
      <div class="modal-body" style="overflow-y:auto;flex:1;">
        <div style="margin-bottom:16px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
           <span class="badge badge-${esc(c.priority)}">${esc(c.priority)}</span>
           ${c.target_dept !== 'All' ? `<span class="badge badge-staff">${esc(c.target_dept)}</span>` : ''}
           ${c.target_year !== 'All' ? `<span class="badge badge-student">Year ${esc(c.target_year)}</span>` : ''}
        </div>
        ${stats ? `
          <div style="margin-bottom:16px; padding:14px; background:rgba(108,92,231,0.08); border-radius:10px; border:1px solid rgba(108,92,231,0.2);">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">${t('readAnalytics')}</div>
            <div style="display:flex; gap:20px; font-size:14px; font-weight:600;">
              <span>✅ ${stats.read_count} ${t('readWord')}</span>
              <span>⏳ ${stats.unread_count} ${t('unread')}</span>
              <span>👥 ${stats.total_count} ${t('total')}</span>
            </div>
          </div>
        ` : ''}
        <div style="white-space:pre-wrap; font-size:15px; color:var(--text); line-height:1.7;">${esc(c.content)}</div>
        ${attachmentHTML}
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--card-border); font-size:13px; color:var(--text-dim);">
          ${t('publishedBy')} <strong>${c.created_by === user?.id ? t('byYou') : esc(c.author || 'Admin')}</strong> ${t('on')} ${formatDate(c.created_at)}
        </div>

        <!-- Comments / Feedback Section -->
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--card-border);">
          <h4 style="margin:0 0 12px;font-size:14px;">${t('commentsTitle')}</h4>
          <div id="comments-list" style="max-height:200px;overflow-y:auto;margin-bottom:12px;">
            <div style="color:var(--text-dim);font-size:13px;">${t('loadingComments')}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <input id="comment-input" placeholder="${t('writeComment')}" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);background:var(--card);color:var(--text);font-size:13px;" />
            <button id="comment-send" class="btn btn-primary btn-sm" style="white-space:nowrap;">${t('send')}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Export PDF handler
  overlay.querySelector('#export-pdf-btn').onclick = () => exportCircularPDF(c);

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
        commentsList.innerHTML = `<div style="color:var(--text-dim);font-size:13px;padding:8px 0;">${t('noComments')}</div>`;
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
      commentsList.innerHTML = `<div style="color:var(--text-dim);font-size:13px;">${t('failedComments')}</div>`;
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
      toast(err.message || t('failedComments'), 'error');
    } finally {
      sendBtn.disabled = false;
    }
  };
  sendBtn.onclick = sendComment;
  commentInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendComment(); });
}

// ── Export Circular as PDF ───────────────────────────────
function exportCircularPDF(c) {
  const priorityColors = { urgent: '#e74c3c', medium: '#f39c12', low: '#27ae60' };
  const priorityColor = priorityColors[c.priority] || '#6c5ce7';

  // Build attachment section for PDF
  let attachSection = '';
  if (c.attachment_url) {
    const fullUrl = window.location.origin + c.attachment_url;
    attachSection = `
      <div style="margin-top:24px;padding:12px;background:#f8f9fa;border-radius:8px;border:1px solid #eee;">
        <strong>📎 Attachment:</strong>
        <a href="${fullUrl}" style="color:#6c5ce7;margin-left:8px;">${fullUrl}</a>
      </div>`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(c.title)} — CircularHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1a1a2e;
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .header {
      border-bottom: 3px solid ${priorityColor};
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 12px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
      color: #555;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
      background: ${priorityColor};
    }
    .content {
      font-size: 15px;
      white-space: pre-wrap;
      color: #333;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
      display: flex;
      justify-content: space-between;
    }
    .watermark {
      text-align: center;
      margin-top: 40px;
      font-size: 11px;
      color: #bbb;
      letter-spacing: 1px;
    }
    @media print {
      body { padding: 24px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${esc(c.title)}</h1>
    <div class="meta">
      <span class="badge">${esc(c.priority)}</span>
      <span class="meta-item">📅 ${new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      <span class="meta-item">👤 ${esc(c.author || 'Admin')}</span>
      ${c.target_dept !== 'All' ? `<span class="meta-item">🏢 ${esc(c.target_dept)}</span>` : ''}
      ${c.target_year !== 'All' ? `<span class="meta-item">🎓 Year ${esc(c.target_year)}</span>` : ''}
    </div>
  </div>

  <div class="content">${esc(c.content)}</div>

  ${attachSection}

  <div class="footer">
    <span>Exported from CircularHub</span>
    <span>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
  </div>

  <div class="watermark">
    ── CircularHub · Digital Circular & Notice Management Platform ──
  </div>

  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  printWindow.document.write(html);
  printWindow.document.close();
}

async function loadBus(container) {
  try {
    const buses = await getBusSchedule();
    if (!buses.length) {
      container.innerHTML = `<div class="empty-state">${t('noBus')}</div>`;
      return;
    }
    container.innerHTML = `
      <div class="card">
        <h3>${t('busSchedule')}</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>${t('route')}</th><th>${t('time')}</th><th>${t('stops')}</th></tr></thead>
            <tbody>
              ${buses.map(b => `<tr><td><strong>${esc(b.route_name)}</strong></td><td>${esc(b.departure_time)}</td><td>${esc(b.stops)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch {
    container.innerHTML = `<div class="empty-state">${t('failedBus')}</div>`;
  }
}

// ── Feedback Tab ─────────────────────────────────────────
async function loadFeedback(container) {
  const user = getUser();
  try {
    const feedbacks = await getFeedback();

    const isStaffOrAdmin = user.role === 'admin' || user.role === 'staff';

    container.innerHTML = `
      <div class="feedback-section">
        ${!isStaffOrAdmin ? `
          <div class="card" style="margin-bottom:20px;">
            <h3 style="margin:0 0 12px;">${t('shareIdeas')}</h3>
            <p style="color:var(--text-dim);font-size:13px;margin-bottom:12px;">${t('feedbackHint')}</p>
            <div class="form-group" style="margin-bottom:10px;">
              <select id="fb-category" style="padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);background:var(--card);color:var(--text);font-size:13px;width:100%;">
                <option value="general">${t('categoryGeneral')}</option>
                <option value="website">${t('categoryWebsite')}</option>
                <option value="college">${t('categoryCollege')}</option>
                <option value="academics">${t('categoryAcademics')}</option>
                <option value="infrastructure">${t('categoryInfra')}</option>
              </select>
            </div>
            <div style="display:flex;gap:8px;">
              <textarea id="fb-message" placeholder="${t('feedbackPlaceholder')}" rows="3" style="flex:1;padding:10px 12px;border-radius:8px;border:1px solid var(--card-border);background:var(--card);color:var(--text);font-size:13px;resize:vertical;"></textarea>
            </div>
            <button class="btn btn-primary btn-sm" id="fb-send" style="margin-top:10px;">${t('submitFeedback')}</button>
          </div>
        ` : `<h3 style="margin:0 0 16px;">${t('studentFeedback')}</h3>`}

        <div id="fb-list">
          ${feedbacks.length === 0
        ? `<div class="empty-state">${t('noFeedback')}</div>`
        : feedbacks.map(f => `
              <div class="card" style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div>
                    <strong>${esc(f.author_name)}</strong>
                    <span class="badge badge-${f.author_role === 'admin' ? 'urgent' : f.author_role === 'staff' ? 'staff' : 'student'}" style="font-size:10px;padding:1px 6px;margin-left:4px;">${esc(f.author_role)}</span>
                    ${f.department ? `<span style="color:var(--text-dim);font-size:12px;margin-left:4px;">${esc(f.department)}</span>` : ''}
                  </div>
                  <span style="font-size:12px;color:var(--text-dim);">${formatDate(f.created_at)}</span>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:8px;">
                  <span class="badge badge-student" style="font-size:10px;padding:2px 8px;text-transform:capitalize;">${esc(f.category || 'general')}</span>
                </div>
                <p style="margin:0;font-size:14px;color:var(--text);line-height:1.6;">${esc(f.message)}</p>
              </div>
            `).join('')
      }
        </div>
      </div>
    `;

    // Submit feedback handler (students)
    const sendBtn = document.getElementById('fb-send');
    if (sendBtn) {
      sendBtn.onclick = async () => {
        const msg = document.getElementById('fb-message').value.trim();
        const cat = document.getElementById('fb-category').value;
        if (!msg) return toast(t('feedbackPlaceholder'), 'warning');
        sendBtn.disabled = true;
        sendBtn.textContent = t('sending');
        try {
          await postFeedback(msg, cat);
          toast(t('feedbackSubmitted'), 'success');
          loadFeedback(container); // Refresh
        } catch (err) {
          toast(err.message || t('failedFeedback'), 'error');
        } finally {
          sendBtn.disabled = false;
          sendBtn.textContent = t('submitFeedback');
        }
      };
    }
  } catch {
    container.innerHTML = `<div class="empty-state">${t('failedFeedback')}</div>`;
  }
}

// ── Analytics Dashboard Tab ──────────────────────────────
async function loadAnalyticsDashboard(container) {
  try {
    const stats = await getAnalyticsSummary();

    container.innerHTML = `
      <div class="analytics-dashboard">
        <h3 style="margin:0 0 20px;">${t('engagementTitle')}</h3>

        <!-- Overview Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px;">
          <div class="card" style="text-align:center;padding:20px;">
            <div style="font-size:28px;font-weight:700;color:var(--primary);">${stats.total_circulars}</div>
            <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;margin-top:4px;">${t('circulars')}</div>
          </div>
          <div class="card" style="text-align:center;padding:20px;">
            <div style="font-size:28px;font-weight:700;color:#00b894;">${stats.total_reads}</div>
            <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;margin-top:4px;">${t('totalReads')}</div>
          </div>
          <div class="card" style="text-align:center;padding:20px;">
            <div style="font-size:28px;font-weight:700;color:#fdcb6e;">${stats.overall_read_rate}%</div>
            <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;margin-top:4px;">${t('readRate')}</div>
          </div>
          <div class="card" style="text-align:center;padding:20px;">
            <div style="font-size:28px;font-weight:700;color:#e17055;">${stats.total_comments}</div>
            <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;margin-top:4px;">${t('comments')}</div>
          </div>
        </div>

        <!-- Reach % bar -->
        <div class="card" style="margin-bottom:20px;padding:20px;">
          <div style="font-size:13px;color:var(--text-dim);margin-bottom:8px;">${t('overallReach')}</div>
          <div style="background:rgba(108,92,231,0.1);border-radius:8px;height:24px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,var(--primary),#a29bfe);height:100%;width:${Math.min(stats.overall_read_rate, 100)}%;border-radius:8px;transition:width 0.6s ease;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:600;">
              ${stats.overall_read_rate}%
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:6px;">${stats.total_reads} of ${stats.total_audience} targeted users have read at least one circular</div>
        </div>

        <!-- Per-circular breakdown -->
        <div class="card" style="padding:20px;">
          <h4 style="margin:0 0 14px;font-size:14px;">${t('recentPerformance')}</h4>
          ${stats.per_circular.length === 0
        ? `<div style="color:var(--text-dim);font-size:13px;">${t('noCircularsYet')}</div>`
        : `<div class="table-wrap"><table style="width:100%;">
                <thead><tr>
                  <th style="text-align:left;">${t('colTitle')}</th>
                  <th>${t('colPriority')}</th>
                  <th>${t('colAudience')}</th>
                  <th>${t('colReads')}</th>
                  <th>${t('colReadRate')}</th>
                  <th>${t('colPublished')}</th>
                </tr></thead>
                <tbody>
                  ${stats.per_circular.map(c => `
                    <tr>
                      <td style="text-align:left;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(c.title)}</td>
                      <td><span class="badge badge-${esc(c.priority)}">${esc(c.priority)}</span></td>
                      <td>${c.audience}</td>
                      <td>${c.reads}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:6px;">
                          <div style="flex:1;background:rgba(108,92,231,0.1);border-radius:4px;height:8px;overflow:hidden;min-width:60px;">
                            <div style="height:100%;width:${c.read_rate}%;background:${c.read_rate >= 70 ? '#00b894' : c.read_rate >= 40 ? '#fdcb6e' : '#e17055'};border-radius:4px;"></div>
                          </div>
                          <span style="font-size:12px;font-weight:600;">${c.read_rate}%</span>
                        </div>
                      </td>
                      <td style="font-size:12px;color:var(--text-dim);">${formatDate(c.created_at)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table></div>`
      }
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = `<div class="empty-state">${t('failedAnalytics')}</div>`;
  }
}
