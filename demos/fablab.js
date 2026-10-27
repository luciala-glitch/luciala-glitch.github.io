// FABLab mobile prototype — rebuilt from the Figma flow as a working state machine.
(() => {
const $ = s => document.querySelector(s);
const app = $('#app');

// ---------- content ----------
const MACHINES = [
  {id: 'laser', name: 'Laser Cutter', level: 1, hero: '../assets/fab/laser-hero.webp',
    specs: [['Material', 'Acrylic, Plywood, Cardboard, MDF, Paper, Basswood/Balsa, Leather (non-PVC), Fabric (non-PVC), Foam Board (non-PVC), Laser-safe Rubber'], ['Not allowed', 'PVC/Vinyl, ABS, Polycarbonate (PC), Metals, Carbon-fiber composites, Anything containing chlorine'], ['Bed size', '32" × 18"']],
    notes: ['Wear safety goggles', 'Do not leave machine unattended', 'Clean work area after cutting']},
  {id: 'printer', name: '3D Printer', level: 1,
    specs: [['Material', 'PLA, PETG, ABS, TPU, Nylon']],
    notes: ['Check bed leveling and nozzle clearance before printing', 'Do not leave long prints unattended', 'Remove prints carefully to avoid damaging the build plate', 'Clean the build surface after each job']},
  {id: 'cnc', name: 'CNC Mill', level: 2, specs: [['Material', 'Wood, machinable wax, aluminum (staff approval)']], notes: ['Clamp the workpiece securely', 'Keep hands clear of the spindle', 'Clear chips with a brush, not by hand']},
  {id: 'pcb', name: 'PCB Milling', level: 1, specs: [['Material', 'FR-1 copper boards']], notes: ['Secure the board flat on the bed', 'Wear eye protection']},
  {id: 'vinyl', name: 'Vinyl Cutter', level: 1, specs: [['Material', 'Adhesive vinyl, heat-transfer vinyl']], notes: ['Keep fingers away from the blade carriage']},
  {id: 'sla', name: 'SLA Printer', level: 1, specs: [['Material', 'Standard photopolymer resins']], notes: ['Wear nitrile gloves when handling resin', 'Wash and cure parts before use']},
  {id: 'scanner', name: '3D Scanner', level: 1, specs: [['Use', 'Objects up to 30 cm']], notes: ['Handle the scanner with both hands']},
  {id: 'plotter', name: 'Plotter', level: 1, specs: [['Media', 'Paper rolls up to 36"']], notes: ['Load media with the machine paused']}
];
const QUIZ = {
  laser: {video: 'Initial CO2 Machine Setup', questions: [
    {q: 'Which of the following materials is safe to cut on a laser cutter?', options: ['PVC', 'Acrylic', 'Vinyl', 'Polycarbonate'], answer: 1, why: 'Acrylic cuts cleanly. PVC and vinyl release chlorine gas, and polycarbonate burns and discolors.'},
    {q: 'What safety gear is required when using the laser cutter?', options: ['Gloves', 'Safety goggles', 'Helmet'], answer: 1, why: 'Goggles protect your eyes from reflected laser light and debris.'}]},
  printer: {video: 'First Print, Step by Step', questions: [
    {q: 'What should you check before starting a print?', options: ['Bed leveling and nozzle clearance', 'Room temperature', 'Filament color'], answer: 0, why: 'A level bed and clear nozzle prevent failed prints and damaged build plates.'}]},
  cnc: {video: 'Workholding Basics', questions: [
    {q: 'What must happen before the spindle starts?', options: ['The workpiece is clamped securely', 'Safety glasses come off', 'The enclosure door stays open'], answer: 0, why: 'An unclamped part can be thrown by the cutter.'}]}
};
const SKETCH = {
  login: ['login', 'Login', 'The paper version asked for a student ID. The pixel version accepts a username or email and opens with a photo of the lab.'],
  home: ['home', 'Home', 'Machine names became recognizable photos, so students can find equipment by sight.'],
  detail: ['detail', 'Machine detail', 'Training level and the allowed and banned materials appear before the booking button.'],
  calendar: ['calendar', 'Booking', 'Hatched days became a calendar. Unavailable slots are struck through instead of hidden.'],
  confirm: ['confirm', 'Confirm booking', 'The slider stayed. Students can adjust by half an hour without starting over.'],
  training: ['training', 'Training center', 'Each machine shows its status, and every button says what happens next.'],
  video: ['video', 'Safety training', 'The video is the first step of the module, and the quiz follows directly.'],
  quiz: ['quiz', 'Quiz', 'Instant feedback after each answer replaced a single submit at the end.'],
  bookings: ['bookings', 'My bookings', 'Pending and confirmed tell students whether training is still missing.'],
  modify: ['modify', 'Modify booking', 'Reschedule, cancel, and save became one clear decision.']
};
const TASKS = [
  ['login', 'Log in', 'Any username works.'],
  ['detail', 'Open a machine', 'Try the laser cutter.'],
  ['booked', 'Book a time slot', 'Pick a day, a slot, then confirm.'],
  ['quiz', 'Pass a safety quiz', 'Pending bookings become confirmed.'],
  ['modify', 'Change or cancel a booking', 'From My Booking.']
];
const SLOTS = ['9:00–10:00', '10:00–11:00', '12:00–1:00', '1:00–2:00', '2:00–3:00', '3:00–4:00', '4:00–5:00', '7:00–8:00', '8:00–9:00'];
const SLOT_START = [9, 10, 12, 13, 14, 15, 16, 19, 20];
const TODAY = 15; // Sep 15, 2025 in the prototype's timeline

// ---------- state ----------
const fresh = () => ({
  stack: [{name: 'login'}], done: new Set(), favorites: new Set(['printer']),
  training: {laser: 'done', printer: 'progress', cnc: 'none'},
  bookings: [
    {id: 1, machine: 'laser', day: 28, start: 14, len: 2},
    {id: 2, machine: 'printer', day: 26, start: 11, len: 1},
    {id: 3, machine: 'cnc', day: 30, start: 18.5, len: .5}
  ], draft: null, query: '', modal: null, nextId: 4, quiz: null
});
let S = fresh();

const machine = id => MACHINES.find(m => m.id === id);
const trained = id => S.training[id] === 'done';
const fmtTime = h => { const hh = Math.floor(h), mm = h % 1 ? '30' : '00', h12 = ((hh + 11) % 12) + 1; return `${h12}:${mm}`; };
const range = (start, len) => `${fmtTime(start)}–${fmtTime(start + len)} ${start + len >= 12 ? 'PM' : 'AM'}`;
const dayName = d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(d - 1) % 7];
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const slotTaken = (id, day, i) => hash(`${id}-${day}-${i}`) % 4 === 0 || S.bookings.some(b => b.machine !== id ? false : b.day === day && b.start === SLOT_START[i]);
const dayFull = (id, day) => hash(`${id}-full-${day}`) % 6 === 0;

// ---------- icons ----------
const I = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8f97" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  heart: f => `<svg viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3.3 4.5 6.9 4.5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.6 0 5.7 3.7 4.1 6.9C19 15.6 12 20 12 20z"/></svg>`,
  grid: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l2-5h14l2 5v1a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0V9zm2 4.5V20h14v-6.5a4.6 4.6 0 01-3-.6 4.6 4.6 0 01-4 .6 4.6 4.6 0 01-4-.6 4.6 4.6 0 01-3 .6z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21a8.5 8.5 0 0117 0z"/></svg>',
  play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  status: '<svg width="70" height="13" viewBox="0 0 70 13" fill="currentColor"><rect x="0" y="8" width="3" height="5" rx="1"/><rect x="5" y="5.5" width="3" height="7.5" rx="1"/><rect x="10" y="3" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1"/><path d="M30 3.5a9 9 0 0112 0l-1.4 1.5a7 7 0 00-9.2 0zM32.6 6.4a5.2 5.2 0 016.8 0L38 7.9a3.2 3.2 0 00-4 0zM36 12l-2-2.2a2.8 2.8 0 014 0z"/><rect x="46" y=".5" width="21" height="12" rx="3.5" fill="none" stroke="currentColor"/><rect x="48" y="2.5" width="16" height="8" rx="2"/></svg>'
};
const statusBar = light => `<div class="sb${light ? ' light' : ''}"><span>9:41</span>${I.status}</div>`;
const tabs = active => `<nav class="tabs" aria-label="App tabs">${[['bookings', 'My Booking', I.grid], ['home', 'Home', I.home], ['training', 'Training', I.user]].map(([k, l, ic]) => `<button type="button" data-tab="${k}" class="${active === k ? 'on' : ''}">${ic}<span>${l}</span></button>`).join('')}</nav>`;
const topbar = (title, back = true) => `<div class="topbar">${back ? `<button class="icon-btn" data-back aria-label="Back">${I.back}</button>` : '<span></span>'}<h2>${title}</h2><span></span></div>`;

// ---------- navigation ----------
let direction = 'fwd';
const current = () => S.stack.at(-1);
const go = (name, params = {}) => { direction = 'fwd'; S.stack.push({name, ...params}); render(); };
const back = () => { if (S.stack.length > 1) { direction = 'back'; S.stack.pop(); render(); } };
const tab = name => { direction = 'fwd'; S.stack = [{name: 'home'}]; if (name !== 'home') S.stack.push({name}); render(); };
const complete = key => { if (!S.done.has(key)) { S.done.add(key); renderTasks(); } };

// ---------- screens ----------
const SCREENS = {
  login: () => `<div class="screen login">${statusBar(true)}<div class="login-hero"></div><div class="body" style="display:flex;flex-direction:column">
    <h1>Welcome to FABLab!</h1>
    <label class="field"><input id="user" placeholder="Username or Email" value="lucia" autocomplete="off"></label>
    <label class="field"><input id="pw" type="password" placeholder="Password" value="fablab2025"><button type="button" data-act="peek" aria-label="Show password">${I.eye}</button></label>
    <button class="forgot" type="button" data-act="forgot">Forgot password?</button>
    <button class="btn" data-act="login">Login</button>
    <p class="help muted">Need help? Contact Lab Manager</p></div></div>`,

  home: () => {
    const q = S.query.trim().toLowerCase();
    const list = MACHINES.filter(m => !q || m.name.toLowerCase().includes(q));
    return `<div class="screen">${statusBar()}<div class="body">
      <p class="welcome">Welcome, Lucia!</p>
      <label class="search">${I.search}<input id="q" placeholder="Search machine…" value="${S.query}" aria-label="Search machines"></label>
      <div class="grid">${list.map(m => `<button class="mcard" data-open="${m.id}"><img src="../assets/fab/m-${m.id}.webp" alt=""><span>${m.name}</span></button>`).join('') || '<p class="empty muted">No machine matches that search.</p>'}</div>
    </div>${tabs('home')}</div>`;
  },

  detail: ({id}) => {
    const m = machine(id), fav = S.favorites.has(id);
    return `<div class="screen detail">${statusBar(true)}<div class="body" style="padding-top:0">
      <div class="detail-hero" style="background-image:url(${m.hero || `../assets/fab/m-${id}.webp`});margin-left:-22px;margin-right:-22px"><button class="icon-btn" data-back aria-label="Back">${I.close}</button></div>
      <h1>${m.name}<button class="heart" data-act="fav" aria-pressed="${fav}" aria-label="${fav ? 'Remove from' : 'Add to'} favorites">${I.heart(fav)}</button></h1>
      <p class="req">Require Safety Training Level ${m.level}.${trained(id) ? ' <span style="color:#2f8f35;font-size:13px;font-weight:600">✓ Completed</span>' : ''}</p>
      <div class="specs">${m.specs.map(([k, v]) => `<b>${k}:</b> ${v}`).join('<br>')}</div>
      <button class="btn" data-act="availability">＋ Check Availability</button>
      <div class="notes"><b>Usage Notes:</b><ul>${m.notes.map(n => `<li>${n}</li>`).join('')}</ul></div>
    </div>${tabs('home')}</div>`;
  },

  calendar: ({id}) => {
    const m = machine(id), d = S.draft;
    const cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(x => `<span class="dow">${x}</span>`).join('') +
      Array.from({length: 30}, (_, i) => { const day = i + 1, past = day < TODAY, full = !past && dayFull(id, day);
        return `<button class="day${day === TODAY ? ' today' : ''}${full ? ' full' : ''}${d.day === day ? ' sel' : ''}" data-day="${day}" ${past || full ? 'disabled' : ''} aria-label="September ${day}${full ? ', fully booked' : ''}">${day}</button>`; }).join('');
    return `<div class="screen">${statusBar()}${topbar(`${m.name} booking`)}<div class="body">
      <div class="cal-head"><span>Sep 2025</span><div><button class="icon-btn" disabled aria-label="Previous month">${I.back}</button><button class="icon-btn" disabled style="transform:scaleX(-1)" aria-label="Next month">${I.back}</button></div></div>
      <div class="cal">${cells}</div>
      ${d.day ? `<p class="slot-label">Select a time and press next · ${dayName(d.day)}, Sep ${d.day}</p>
      <div class="slots">${SLOTS.map((s, i) => `<button class="slot${d.slot === i ? ' sel' : ''}" data-slot="${i}" ${slotTaken(id, d.day, i) ? 'disabled aria-label="' + s + ', taken"' : ''}>${s}</button>`).join('')}</div>` : '<p class="slot-label muted">Choose a day to see open times.</p>'}
      <button class="btn" data-act="next" ${d.day && d.slot != null ? '' : 'disabled'}>NEXT</button>
    </div>${tabs('home')}</div>`;
  },

  confirm: () => {
    const d = S.draft, m = machine(d.machine), start = SLOT_START[d.slot] + d.shift;
    return `<div class="screen">${statusBar()}${topbar('Confirm Booking')}<div class="body">
      <div class="summary"><div><span>Machine</span>${m.name}</div><div><span>Date</span>${dayName(d.day)}, Sep ${d.day}</div><div><span>Time</span><b id="time">${range(start, 1)}</b></div></div>
      <div class="adjust"><input type="range" id="shift" min="-1" max="1" step=".5" value="${d.shift}" aria-label="Adjust start time"><p>‹ Slide to adjust time ›</p></div>
      ${d.confirmed
        ? `<div class="stack">${trained(m.id) ? '' : '<button class="btn" data-act="to-training">Go to Training</button>'}<button class="btn${trained(m.id) ? '' : ' ghost'}" data-act="to-bookings">Go to My Booking</button></div>
           <p class="confirmed">Booking Confirmed ${I.check}</p>${trained(m.id) ? '' : `<p class="muted" style="text-align:center;font-size:13px;margin-top:6px">Status stays pending until Level ${m.level} training is complete.</p>`}`
        : `<button class="btn" data-act="confirm">${d.editing ? 'Save Change' : 'Confirm Booking'}</button>`}
    </div>${tabs('home')}</div>`;
  },

  bookings: () => {
    const list = [...S.bookings].sort((a, b) => a.day - b.day || a.start - b.start);
    return `<div class="screen">${statusBar()}${topbar('My Booking', false)}<div class="body">
      ${list.map(b => { const m = machine(b.machine), ok = trained(b.machine);
        return `<article class="bk"><div class="bk-top">${m.name}<span>${range(b.start, b.len)}</span></div><p>${dayName(b.day)}, Sep ${b.day}, 2025</p>
          <span class="status ${ok ? 'ok' : 'wait'}">${ok ? '● Confirmed' : '● Pending · training required'}</span>
          <button class="btn small" data-modify="${b.id}">Modify</button></article>`; }).join('') || '<p class="empty muted">No bookings yet. Find a machine on Home.</p>'}
    </div>${tabs('bookings')}</div>`;
  },

  training: () => {
    const rows = [['laser', 1], ['printer', 1], ['cnc', 2]];
    const label = {done: ['Completed', 'Try It Again', 'green'], progress: ['In Progress', 'Continue', ''], none: ['Not Started', 'Start', '']};
    return `<div class="screen">${statusBar()}${topbar('Training Center', false)}<div class="body">
      <p class="intro">Welcome to the safety training portal! Complete all modules before using machines.</p>
      ${rows.map(([id, lvl]) => { const [st, act, cls] = label[S.training[id]];
        return `<div class="tr"><div class="tr-top"><span>Safety Level ${lvl}</span><span>${machine(id).name}</span></div><p>Status: ${st}</p><button class="btn small ${cls}" data-quiz="${id}">${act}</button></div>`; }).join('')}
    </div>${tabs('training')}</div>`;
  },

  quiz: ({id}) => {
    const qz = QUIZ[id], st = S.quiz, item = qz.questions[st.index], answered = st.picked != null;
    const right = answered && st.picked === item.answer;
    return `<div class="screen">${statusBar()}${topbar('Safety Training')}<div class="body">
      <p class="muted" style="margin:0 0 12px;text-align:center;font-size:13px">${machine(id).name}</p>
      <div class="video"><button class="play" data-act="play" aria-label="${st.playing ? 'Pause' : 'Play'} training video">${st.playing ? '❚❚' : I.play}</button><h3>${qz.video}</h3><div class="bar"><i id="vbar" style="width:${st.progress}%"></i></div><span class="t">${st.progress >= 100 ? 'Watched' : 'Training video · 2 min'}</span></div>
      <p class="q"><small>Question ${st.index + 1} of ${qz.questions.length}</small>${item.q}</p>
      ${item.options.map((o, i) => { const cls = !answered ? '' : i === item.answer ? ' right' : i === st.picked ? ' wrong' : '';
        return `<button class="opt${cls}" data-pick="${i}" ${answered ? 'disabled' : ''}><i>${cls === ' right' ? '✓' : cls === ' wrong' ? '✕' : ''}</i>${o}</button>`; }).join('')}
      ${answered ? `<p class="feedback ${right ? 'ok' : 'no'}">${right ? 'Correct. ' : 'Not quite. '}${item.why}</p><button class="btn ${right ? '' : 'ghost'}" data-act="${right ? 'qnext' : 'retry'}">${right ? (st.index + 1 < qz.questions.length ? 'Next' : 'Finish') : 'Try again'}</button>` : ''}
    </div>${tabs('training')}</div>`;
  }
};

const MODALS = {
  modify: b => `<div class="scrim" data-scrim><div class="modal" role="dialog" aria-modal="true" aria-label="Modify booking"><h3>Change time or cancel booking?</h3><p>${machine(b.machine).name} · ${dayName(b.day)}, Sep ${b.day} · ${range(b.start, b.len)}</p>
    <div class="row"><button class="btn small" data-act="reschedule">Reschedule</button><button class="btn small ghost" data-act="cancel-booking" style="color:#e5534b;border-color:#e5534b">Cancel Booking</button></div><button class="btn small ghost" data-act="close-modal">Keep Booking</button></div></div>`,
  canceled: () => `<div class="scrim" data-scrim><div class="modal" role="dialog" aria-modal="true"><h3>Your booking has been canceled!</h3><p>The slot is open for other students again.</p>
    <div class="row"><button class="btn small" data-act="rebook">Rebook</button><button class="btn small ghost" data-act="close-modal">Done</button></div><button class="btn small ghost" data-act="go-home">Go Back to Home Page</button></div></div>`,
  verified: id => `<div class="scrim" data-scrim><div class="modal" role="dialog" aria-modal="true"><div style="color:#62c266;margin-bottom:6px">${I.check}</div><h3>Training Verified</h3><p>Level ${machine(id).level} ${machine(id).name} Training Completed. You're now allowed to use this machine, and its pending bookings are confirmed.</p>
    <div class="row"><button class="btn small ghost" data-act="close-modal">Back</button><button class="btn small" data-act="verified-continue">Continue</button></div></div></div>`,
  forgot: () => `<div class="scrim" data-scrim><div class="modal" role="dialog" aria-modal="true"><h3>Reset password</h3><p>In the real service this sends a reset link to your university email. Any password works in this demo.</p><button class="btn small" data-act="close-modal">OK</button></div></div>`
};

// ---------- render ----------
function render() {
  const view = current();
  app.innerHTML = SCREENS[view.name](view) + (S.modal ? MODALS[S.modal.type](S.modal.data) : '');
  const screen = app.querySelector('.screen');
  if (direction === 'back') screen.classList.add('back');
  bind(view);
  renderSketch(view);
  const focusTarget = app.querySelector('.modal button') || null;
  if (focusTarget) focusTarget.focus({preventScroll: true});
}
function renderSketch(view) {
  let key = view.name;
  if (view.name === 'confirm') key = 'confirm';
  if (view.name === 'quiz') key = S.quiz.picked == null && S.quiz.progress < 100 ? 'video' : 'quiz';
  if (S.modal?.type === 'modify' || S.modal?.type === 'canceled') key = 'modify';
  const [file, title, text] = SKETCH[key] || SKETCH.home;
  const img = $('#sketch-img');
  if (!img.src.endsWith(`sketch-${file}.webp`)) { img.style.opacity = 0; img.onload = () => img.style.opacity = 1; img.src = `../assets/fab/sketch-${file}.webp`; }
  img.alt = `Paper prototype sketch of the ${title} screen`;
  $('#sketch-cap').innerHTML = `<b>${title.toUpperCase()}</b>${text}`;
}
function renderTasks() {
  $('#tasks').innerHTML = TASKS.map(([k, t, hint]) => `<li class="${S.done.has(k) ? 'done' : ''}"><i>✓</i><div><b>${t}</b><small>${hint}</small></div></li>`).join('');
  $('#task-progress').textContent = S.done.size === TASKS.length ? 'JOURNEY COMPLETE · THANKS FOR TRYING IT' : `${S.done.size} / ${TASKS.length} STEPS`;
}
let toastTimer;
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2600); };

let videoTimer;
function bind(view) {
  app.querySelectorAll('[data-back]').forEach(b => b.onclick = back);
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => tab(b.dataset.tab));
  app.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { go('detail', {id: b.dataset.open}); complete('detail'); });
  app.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { S.draft.day = +b.dataset.day; S.draft.slot = null; render(); });
  app.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { S.draft.slot = +b.dataset.slot; render(); });
  app.querySelectorAll('[data-modify]').forEach(b => b.onclick = () => { S.modal = {type: 'modify', data: S.bookings.find(x => x.id === +b.dataset.modify)}; render(); });
  app.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => startQuiz(b.dataset.quiz));
  app.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { S.quiz.picked = +b.dataset.pick; render(); });
  const scrim = app.querySelector('[data-scrim]');
  if (scrim) scrim.onclick = e => { if (e.target === scrim) { S.modal = null; render(); } };
  const q = app.querySelector('#q');
  if (q) q.oninput = () => { S.query = q.value; const pos = q.selectionStart; render(); const n = app.querySelector('#q'); n.focus(); n.setSelectionRange(pos, pos); };
  const shift = app.querySelector('#shift');
  if (shift) shift.oninput = () => { S.draft.shift = +shift.value; app.querySelector('#time').textContent = range(SLOT_START[S.draft.slot] + S.draft.shift, 1); };
  app.querySelectorAll('[data-act]').forEach(b => b.onclick = () => ACTIONS[b.dataset.act]?.(view));
}
function startQuiz(id) {
  S.quiz = {id, index: 0, picked: null, progress: S.training[id] === 'progress' ? 60 : 0, playing: false};
  clearInterval(videoTimer);
  go('quiz', {id});
}

const ACTIONS = {
  login: () => { complete('login'); S.stack = [{name: 'home'}]; direction = 'fwd'; render(); },
  peek: () => { const p = app.querySelector('#pw'); p.type = p.type === 'password' ? 'text' : 'password'; },
  forgot: () => { S.modal = {type: 'forgot'}; render(); },
  fav: ({id}) => { S.favorites.has(id) ? S.favorites.delete(id) : S.favorites.add(id); toast(S.favorites.has(id) ? 'Saved to favorites' : 'Removed from favorites'); render(); },
  availability: ({id}) => { S.draft = {machine: id, day: null, slot: null, shift: 0}; go('calendar', {id}); },
  next: () => { S.draft.confirmed = false; go('confirm'); },
  confirm: () => {
    const d = S.draft, start = SLOT_START[d.slot] + d.shift;
    if (d.editing) { const b = S.bookings.find(x => x.id === d.editing); Object.assign(b, {day: d.day, start, len: 1}); complete('modify'); }
    else S.bookings.push({id: S.nextId++, machine: d.machine, day: d.day, start, len: 1});
    d.confirmed = true; complete('booked'); render();
  },
  'to-training': () => tab('training'),
  'to-bookings': () => tab('bookings'),
  'close-modal': () => { S.modal = null; render(); },
  'go-home': () => { S.modal = null; tab('home'); },
  reschedule: () => { const b = S.modal.data; S.modal = null; S.draft = {machine: b.machine, day: b.day, slot: null, shift: 0, editing: b.id}; go('calendar', {id: b.machine}); },
  'cancel-booking': () => { const b = S.modal.data; S.bookings = S.bookings.filter(x => x !== b); complete('modify'); S.modal = {type: 'canceled', data: b}; render(); },
  rebook: () => { const b = S.modal.data; S.modal = null; S.draft = {machine: b.machine, day: null, slot: null, shift: 0}; go('calendar', {id: b.machine}); },
  play: () => {
    const st = S.quiz; st.playing = !st.playing; clearInterval(videoTimer);
    if (st.playing) videoTimer = setInterval(() => {
      st.progress = Math.min(100, st.progress + 4);
      const bar = app.querySelector('#vbar'); if (bar) bar.style.width = st.progress + '%';
      if (st.progress >= 100) { clearInterval(videoTimer); st.playing = false; render(); }
    }, 120);
    render();
  },
  retry: () => { S.quiz.picked = null; render(); },
  qnext: () => {
    const st = S.quiz, qz = QUIZ[st.id];
    if (st.index + 1 < qz.questions.length) { st.index++; st.picked = null; render(); return; }
    clearInterval(videoTimer);
    const confirmedNow = S.bookings.filter(b => b.machine === st.id && !trained(b.machine)).length;
    S.training[st.id] = 'done'; complete('quiz');
    S.modal = {type: 'verified', data: st.id}; render();
    if (confirmedNow) toast(`${confirmedNow} pending booking${confirmedNow > 1 ? 's' : ''} confirmed`);
  },
  'verified-continue': () => { const id = S.modal.data; S.modal = null; S.draft = {machine: id, day: null, slot: null, shift: 0}; S.stack = [{name: 'home'}, {name: 'detail', id}]; go('calendar', {id}); }
};

addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) { S.modal = null; render(); } });
$('#reset').onclick = () => { clearInterval(videoTimer); S = fresh(); direction = 'back'; render(); renderTasks(); toast('Demo reset'); };
$('#sketch-toggle').onchange = e => $('#sketch-fig').classList.toggle('off', !e.target.checked);

// fit the device to the viewport
function fit() {
  const wrap = document.querySelector('.fl-device-wrap'), small = innerWidth <= 760;
  const s = small ? Math.min(1, (innerWidth - 32) / 418) : Math.min(1, (innerHeight - 110) / 872);
  wrap.style.setProperty('--s', s.toFixed(3)); document.querySelector('.fl-device').style.setProperty('--s', s.toFixed(3));
}
addEventListener('resize', fit); fit();
render(); renderTasks();
})();
