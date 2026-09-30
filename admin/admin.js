/* =========================================================
   admin.js - login + message dashboard
   ========================================================= */

/* CHANGE THIS PASSWORD! ------------------------------------
   Note: this is a simple lock for testing. Anyone who knows
   how to read JavaScript can find it, so it is NOT real
   security. A real login needs a backend (e.g. Firebase Auth). */
const ADMIN_PASSWORD = 'jq2026';

const $ = (id) => document.getElementById(id);
let filter = 'all';   // "all" or "unread"
let openId = null;    // which message is expanded

/* 1. LOGIN --------------------------------------------------- */
function showApp() {
  $('login').hidden = true;
  $('app').hidden = false;
  render();
}
if (sessionStorage.getItem('jq_admin') === 'yes') showApp();   // stay logged in until tab closes

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('pass').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('jq_admin', 'yes');
    showApp();
  } else {
    $('loginError').textContent = 'Wrong password. Try again.';
    $('pass').classList.remove('bad');
    void $('pass').offsetWidth;          // restarts the shake animation
    $('pass').classList.add('bad');
  }
});
$('logout').addEventListener('click', () => {
  sessionStorage.removeItem('jq_admin');
  location.reload();
});

/* 2. HELPERS ------------------------------------------------- */
// Makes user text safe so nobody can inject HTML into your panel
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function formatDate(iso) {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* 3. DRAW THE PAGE ------------------------------------------- */
function render() {
  const all = MessageStore.getAll();
  const term = $('search').value.toLowerCase().trim();

  // numbers at the top
  const today = new Date().toDateString();
  $('sTotal').textContent = all.length;
  $('sUnread').textContent = all.filter((m) => !m.read).length;
  $('sToday').textContent = all.filter((m) => new Date(m.date).toDateString() === today).length;

  // apply the tab + search
  const shown = all.filter((m) => {
    if (filter === 'unread' && m.read) return false;
    return !term || (m.name + m.email + m.message).toLowerCase().includes(term);
  });

  if (!shown.length) {
    $('list').innerHTML = `<div class="empty"><b>${all.length ? 'No matches' : 'No messages yet'}</b>${all.length ? 'Try a different search.' : 'When someone uses "Hire me" on your website, it shows up here.'}</div>`;
    return;
  }

  $('list').innerHTML = shown.map((m, i) => `
    <article class="msg ${m.read ? '' : 'unread'} ${m.id === openId ? 'open' : ''}" data-id="${m.id}" style="animation-delay:${Math.min(i, 8) * 60}ms">
      <div class="msg-head">
        <div class="avatar">${esc(m.name.charAt(0).toUpperCase())}</div>
        <div class="who">
          <b>${esc(m.name)}</b>
          <small>${esc(m.email)}</small>
          <div class="preview">${esc(m.message)}</div>
        </div>
        <div class="date">${formatDate(m.date)}</div>
      </div>
      <div class="msg-body"><div class="msg-inner">
        <p class="text">${esc(m.message)}</p>
        <div class="actions">
          <a class="btn small" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: your message')}">Reply</a>
          <button class="btn ghost small" data-act="toggle">Mark as ${m.read ? 'unread' : 'read'}</button>
          <button class="btn ghost small danger" data-act="delete">Delete</button>
        </div>
      </div></div>
    </article>`).join('');
}

/* 4. CLICKS INSIDE THE LIST ---------------------------------- */
$('list').addEventListener('click', (e) => {
  const card = e.target.closest('.msg');
  if (!card) return;
  const id = card.dataset.id;
  const list = MessageStore.getAll();
  const msg = list.find((m) => m.id === id);
  const act = e.target.dataset.act;

  if (act === 'delete') {
    if (confirm('Delete this message?')) { MessageStore.saveAll(list.filter((m) => m.id !== id)); render(); }
  } else if (act === 'toggle') {
    msg.read = !msg.read; MessageStore.saveAll(list); render();
  } else if (e.target.closest('.msg-head')) {
    openId = openId === id ? null : id;              // open / close
    if (openId && !msg.read) { msg.read = true; MessageStore.saveAll(list); }   // opening = read
    render();
  }
});

/* 5. SEARCH + TABS ------------------------------------------- */
$('search').addEventListener('input', render);
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
  filter = tab.dataset.filter;
  render();
}));

/* 6. TOOLS AT THE BOTTOM ------------------------------------- */
$('testBtn').addEventListener('click', () => {
  MessageStore.add({ name: 'Test Visitor', email: 'test@example.com', message: 'Hi JQ! I love your portfolio and would like to hire you for a website.' });
  render();
});
$('clearBtn').addEventListener('click', () => {
  if (confirm('Delete ALL messages? This cannot be undone.')) { MessageStore.saveAll([]); render(); }
});
$('exportBtn').addEventListener('click', () => {
  const rows = [['Name', 'Email', 'Message', 'Date']].concat(
    MessageStore.getAll().map((m) => [m.name, m.email, m.message, m.date]));
  const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = 'messages.csv';
  link.click();
});

/* 7. LIVE UPDATE when a message arrives in another tab ------- */
window.addEventListener('storage', (e) => { if (e.key === MessageStore.KEY && !$('app').hidden) render(); });