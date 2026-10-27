// Oxylus experiment explorer — synthetic public edition.
// Every value below is generated in the browser. Signals are normalized indices;
// operational failure criteria are intentionally absent.
(() => {
const CATS = {
  passed: {label: 'No breach', color: '#d6d6d0'},
  efficiency: {label: 'Efficiency drop', color: '#7fa7c9'},
  voltage: {label: 'Voltage drift', color: '#ff3d3d'},
  early: {label: 'Early-life spike', color: '#ffcf7a'},
  multi: {label: 'Multi-stage drift', color: '#f2b134'},
  decay: {label: 'Late efficiency decay', color: '#a3b18a'}
};
const SIGNALS = ['Signal A', 'Signal B', 'Signal C'];
const SIGNAL_COLORS = ['#ff5b1f', '#7fa7c9', '#e9e9e4'];
const MILESTONES = [10, 24, 50, 100, 200, 400];
const POINTS = 320;

const rngFrom = seed => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const between = (rng, a, b) => a + (b - a) * rng();
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const sigmoid = x => 1 / (1 + Math.exp(-x));
const fmt = (n, d = 1) => Number(n).toFixed(d);

function makeDataset(key) {
  const rng = rngFrom(key === 'A' ? 2026 : 4751);
  const count = key === 'A' ? 180 : 150;
  const weights = key === 'A'
    ? [['passed', .26], ['efficiency', .22], ['voltage', .19], ['early', .1], ['multi', .14], ['decay', .09]]
    : [['passed', .34], ['efficiency', .16], ['voltage', .14], ['early', .12], ['multi', .12], ['decay', .12]];
  const runs = [];
  for (let i = 1; i <= count; i++) {
    let roll = rng(), cat = 'passed';
    for (const [name, w] of weights) { if ((roll -= w) < 0) { cat = name; break; } }
    const duration = cat === 'early' ? between(rng, 40, 260) : between(rng, 120, 820);
    let breach = null;
    if (cat === 'early') breach = between(rng, 3, 22);
    else if (cat === 'decay') breach = between(rng, duration * .6, duration * .92);
    else if (cat !== 'passed') breach = between(rng, 24, duration * .75);
    const first = Math.floor(rng() * 3);
    const gap = breach === null ? null : Math.min(breach - 1, between(rng, 2, 46));
    const eventHour = breach === null ? (rng() < .55 ? between(rng, 30, duration * .8) : null) : breach - gap;
    const events = [null, null, null];
    if (eventHour !== null) {
      events[first] = eventHour;
      SIGNALS.forEach((_, s) => { if (s !== first && rng() < .65) events[s] = Math.min(duration, eventHour + between(rng, 3, 40)); });
    }
    runs.push({
      id: `SYN-${key}${String(i).padStart(3, '0')}`, cat, duration, breach, gap, eventHour, first: eventHour === null ? null : first,
      events, stand: 'ABCD'[i % 4], lot: `E-${pick(rng, ['11', '14', '17', '22', '29'])}`, catalyst: `K-${pick(rng, ['03', '05', '08', '13'])}`,
      seed: Math.floor(rng() * 1e9), dirs: SIGNALS.map(() => rng() < .5 ? -1 : 1)
    });
  }
  return runs;
}

function seriesFor(run) {
  if (run.series) return run.series;
  const rng = rngFrom(run.seed);
  const out = {t: [], v: [], e: [], s: [[], [], []]};
  const b = run.breach, {cat} = run;
  let nv = 0, ne = 0, ns = [0, 0, 0];
  for (let i = 0; i < POINTS; i++) {
    const t = run.duration * i / (POINTS - 1);
    nv = nv * .82 + (rng() - .5) * .012; ne = ne * .8 + (rng() - .5) * .012;
    let v = .24 + .16 * (1 - Math.exp(-t / 5)) + .05 * t / 800 + nv;
    let e = .62 + .24 * (1 - Math.exp(-t / 3)) + ne;
    if (b !== null) {
      const x = t - b;
      if (cat === 'voltage') v += .28 * sigmoid(x / 9);
      if (cat === 'early') v += .34 * Math.exp(-((x - 2) ** 2) / 30) + .1 * sigmoid(x / 4);
      if (cat === 'efficiency') e -= .3 * sigmoid(x / 7);
      if (cat === 'decay') e -= .22 * sigmoid(x / 18) + .0004 * Math.max(0, x);
      if (cat === 'multi') { v += .18 * sigmoid(x / 22); e -= .12 * sigmoid(x / 22); }
    }
    out.t.push(t); out.v.push(v); out.e.push(Math.max(.05, e));
    run.events.forEach((h, s) => {
      ns[s] = ns[s] * .78 + (rng() - .5) * .03;
      out.s[s].push(.5 + ns[s] + (h === null ? 0 : run.dirs[s] * .16 * sigmoid((t - h) / 2.5)));
    });
  }
  return run.series = out;
}
const valueAt = (series, key, hour) => {
  const arr = key.startsWith('s') ? series.s[+key[1]] : series[key];
  const idx = Math.max(0, Math.min(POINTS - 1, Math.round(hour / series.t[POINTS - 1] * (POINTS - 1))));
  return arr[idx];
};

// ---------- state ----------
const datasets = {A: makeDataset('A'), B: makeDataset('B')};
const state = {key: 'A', stand: 'all', cats: new Set(Object.keys(CATS)), selected: null, view: null, scrub: 0, spin: !matchMedia('(prefers-reduced-motion: reduce)').matches};
const $ = s => document.querySelector(s);
const runs = () => datasets[state.key];
const visible = () => runs().filter(r => state.cats.has(r.cat) && (state.stand === 'all' || r.stand === state.stand));
const tip = $('#tip');
const showTip = (e, html) => { tip.hidden = false; tip.innerHTML = html; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; };
const hideTip = () => tip.hidden = true;
const runTip = r => `<b>${r.id}</b><br>${CATS[r.cat].label}<br>${fmt(r.duration)} h · stand ${r.stand}${r.breach !== null ? `<br>first breach ${fmt(r.breach)} h` : ''}`;

function setupCanvas(canvas) {
  const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  return {ctx, w, h};
}

// ---------- KPIs, legend, matrix ----------
function renderKpis() {
  const list = visible(), failed = list.filter(r => r.breach !== null);
  const durations = list.map(r => r.duration).sort((a, b) => a - b);
  const median = durations.length ? durations[Math.floor(durations.length / 2)] : 0;
  const withEvent = failed.filter(r => r.eventHour !== null);
  const meanGap = withEvent.length ? withEvent.reduce((s, r) => s + r.gap, 0) / withEvent.length : 0;
  $('#kpis').innerHTML = [
    ['VISIBLE RUNS', list.length, `of ${runs().length} synthetic runs`],
    ['NO BREACH', list.length - failed.length, list.length ? `${fmt((list.length - failed.length) / list.length * 100, 0)}% of visible` : '—'],
    ['REACHED AN OUTCOME', failed.length, 'criteria withheld'],
    ['MEDIAN DURATION', `${fmt(median, 0)} h`, `longest ${fmt(durations.at(-1) || 0, 0)} h`],
    ['MEAN EVENT → OUTCOME', `${fmt(meanGap, 1)} h`, 'across visible outcomes']
  ].map(([a, b, c]) => `<div><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`).join('');
}
function renderLegend() {
  const all = runs();
  $('#legend').innerHTML = Object.entries(CATS).map(([k, c]) => `<button type="button" data-cat="${k}" aria-pressed="${state.cats.has(k)}" style="--c:${c.color}"><i></i>${c.label}<b>${all.filter(r => r.cat === k).length}</b></button>`).join('');
  $('#legend').querySelectorAll('button').forEach(b => b.onclick = () => {
    const k = b.dataset.cat;
    if (state.cats.has(k) && state.cats.size > 1) state.cats.delete(k); else state.cats.add(k);
    refresh();
  });
}
function renderMatrix() {
  const host = $('#matrix');
  if (host.dataset.key !== state.key) {
    host.dataset.key = state.key;
    host.innerHTML = runs().map(r => `<button type="button" role="option" aria-selected="false" data-id="${r.id}" aria-label="${r.id}, ${CATS[r.cat].label}" style="--c:${CATS[r.cat].color}"></button>`).join('');
    host.querySelectorAll('button').forEach(b => {
      const r = runs().find(x => x.id === b.dataset.id);
      b.onclick = () => select(r);
      b.onmousemove = e => showTip(e, runTip(r));
      b.onmouseleave = hideTip;
    });
  }
  const ids = new Set(visible().map(r => r.id));
  host.querySelectorAll('button').forEach(b => {
    b.classList.toggle('off', !ids.has(b.dataset.id));
    b.setAttribute('aria-selected', String(state.selected && b.dataset.id === state.selected.id));
  });
  $('#matrix-count').textContent = `${ids.size} / ${runs().length}`;
}

// ---------- 3D run space ----------
const space = {canvas: $('#space'), yaw: .7, pitch: .38, drag: null, projected: []};
function renderSpace() {
  const {ctx, w, h} = setupCanvas(space.canvas);
  const list = visible(), maxDur = 850, maxGap = 50;
  const cy = Math.cos(space.yaw), sy = Math.sin(space.yaw), cp = Math.cos(space.pitch), sp = Math.sin(space.pitch);
  const scale = Math.min(w, h) * .36;
  const project = (x, y, z) => {
    const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    const f = 3.2 / (3.2 + z2);
    return [w / 2 + x1 * scale * f, h / 2 - y1 * scale * f, z2, f];
  };
  // cube frame
  ctx.lineWidth = 1;
  const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z])));
  corners.forEach(a => corners.forEach(b => {
    if (a.filter((v, i) => v !== b[i]).length !== 1 || a.join() > b.join()) return;
    const p = project(...a), q = project(...b);
    ctx.strokeStyle = '#ffffff16'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
  }));
  // floor grid
  for (let i = -1; i <= 1; i += .5) {
    const a = project(i, -1, -1), b = project(i, -1, 1), c = project(-1, -1, i), d = project(1, -1, i);
    ctx.strokeStyle = '#ff5b1f26'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
  }
  ctx.font = '9px SFMono-Regular,monospace'; ctx.fillStyle = '#8e95a1';
  [['DURATION →', 1.15, -1, -1], ['FIRST EVENT ↑', -1, 1.12, -1], ['GAP TO OUTCOME →', -1, -1, 1.2]].forEach(([t, ...p]) => { const q = project(...p); ctx.fillText(t, q[0] - 30, q[1]); });
  space.projected = list.map(r => {
    const x = r.duration / maxDur * 2 - 1;
    const y = (r.eventHour ?? 0) / 600 * 2 - 1;
    const z = r.gap === null ? -1 : r.gap / maxGap * 2 - 1;
    return [r, ...project(x, y, z)];
  }).sort((a, b) => b[3] - a[3]);
  space.projected.forEach(([r, px, py, , f]) => {
    const sel = state.selected && r.id === state.selected.id, rad = (sel ? 6 : 3.2) * f;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2);
    if (r.breach === null) { ctx.strokeStyle = CATS[r.cat].color; ctx.lineWidth = 1.2; ctx.stroke(); }
    else { ctx.fillStyle = CATS[r.cat].color; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1; }
    if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, rad + 5, 0, Math.PI * 2); ctx.stroke(); }
  });
}
function nearestInSpace(e) {
  const box = space.canvas.getBoundingClientRect(), x = e.clientX - box.left, y = e.clientY - box.top;
  let best = null, dist = 14;
  space.projected.forEach(([r, px, py]) => { const d = Math.hypot(px - x, py - y); if (d < dist) { dist = d; best = r; } });
  return best;
}
space.canvas.addEventListener('pointerdown', e => { space.drag = {x: e.clientX, y: e.clientY, yaw: space.yaw, pitch: space.pitch, moved: false}; space.canvas.setPointerCapture(e.pointerId); });
space.canvas.addEventListener('pointermove', e => {
  if (space.drag) {
    const dx = e.clientX - space.drag.x, dy = e.clientY - space.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) space.drag.moved = true;
    space.yaw = space.drag.yaw + dx * .008; space.pitch = Math.max(-1.2, Math.min(1.2, space.drag.pitch + dy * .006));
    renderSpace(); return;
  }
  const r = nearestInSpace(e); r ? showTip(e, runTip(r)) : hideTip();
});
space.canvas.addEventListener('pointerup', e => { if (space.drag && !space.drag.moved) { const r = nearestInSpace(e); if (r) select(r); } space.drag = null; });
space.canvas.addEventListener('pointerleave', hideTip);
$('#spin').onclick = () => { state.spin = !state.spin; $('#spin').setAttribute('aria-pressed', String(state.spin)); $('#spin').textContent = `Auto-rotate ${state.spin ? 'on' : 'off'}`; };
let spaceVisible = true;
new IntersectionObserver(e => spaceVisible = e[0].isIntersecting).observe(space.canvas);
(function loop() { requestAnimationFrame(loop); if (state.spin && spaceVisible && !space.drag && !document.hidden) { space.yaw += .0035; renderSpace(); } })();

// ---------- telemetry chart ----------
const chart = {canvas: $('#series'), pad: {l: 48, r: 18, t: 18, b: 34}, hover: null, drag: null};
function renderSeries() {
  const run = state.selected; if (!run) return;
  const s = seriesFor(run), {ctx, w, h} = setupCanvas(chart.canvas), {l, r, t, b} = chart.pad;
  const [h0, h1] = state.view || [0, run.duration];
  const X = hr => l + (hr - h0) / (h1 - h0) * (w - l - r), Y = v => t + (1 - v) * (h - t - b);
  ctx.save(); ctx.beginPath(); ctx.rect(l, t, w - l - r, h - t - b); ctx.clip();
  if (run.breach !== null) { ctx.fillStyle = '#ff3d3d1c'; ctx.fillRect(X(run.breach), t, w, h - t - b); }
  ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const y = t + i * (h - t - b) / 4; ctx.beginPath(); ctx.moveTo(l, y); ctx.lineTo(w - r, y); ctx.stroke(); }
  [['v', '#e9e9e4'], ['e', '#7fa7c9']].forEach(([k, c]) => {
    ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.beginPath();
    s.t.forEach((hr, i) => { const x = X(hr), y = Y(s[k][i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  });
  if (run.breach !== null) { ctx.setLineDash([4, 5]); ctx.strokeStyle = '#ff3d3d'; ctx.beginPath(); ctx.moveTo(X(run.breach), t); ctx.lineTo(X(run.breach), h - b); ctx.stroke(); ctx.setLineDash([]); }
  run.events.forEach((hr, i) => { if (hr === null) return; const x = X(hr); ctx.fillStyle = SIGNAL_COLORS[i]; ctx.beginPath(); ctx.moveTo(x, h - b - 10); ctx.lineTo(x - 5, h - b); ctx.lineTo(x + 5, h - b); ctx.fill(); });
  ctx.strokeStyle = '#ff5b1f99'; ctx.beginPath(); ctx.moveTo(X(state.scrub), t); ctx.lineTo(X(state.scrub), h - b); ctx.stroke();
  if (chart.drag) { ctx.fillStyle = '#ff5b1f33'; ctx.fillRect(Math.min(chart.drag.x0, chart.drag.x1), t, Math.abs(chart.drag.x1 - chart.drag.x0), h - t - b); }
  if (chart.hover !== null) { ctx.strokeStyle = '#ffffff55'; ctx.beginPath(); ctx.moveTo(X(chart.hover), t); ctx.lineTo(X(chart.hover), h - b); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = '#8e95a1'; ctx.font = '9px SFMono-Regular,monospace';
  for (let i = 0; i <= 5; i++) { const hr = h0 + (h1 - h0) * i / 5; ctx.fillText(`${fmt(hr, 0)}h`, X(hr) - 10, h - 12); }
  ['1.0', '0.5', '0.0'].forEach((v, i) => ctx.fillText(v, 14, t + i * (h - t - b) / 2 + 3));
  ctx.save(); ctx.translate(10, h / 2 + 40); ctx.rotate(-Math.PI / 2); ctx.fillText('NORMALIZED INDEX', 0, 0); ctx.restore();
}
const hourFromEvent = e => {
  const box = chart.canvas.getBoundingClientRect(), {l, r} = chart.pad, run = state.selected;
  const [h0, h1] = state.view || [0, run.duration];
  return Math.max(h0, Math.min(h1, h0 + (e.clientX - box.left - l) / (box.width - l - r) * (h1 - h0)));
};
chart.canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; const x = e.clientX - chart.canvas.getBoundingClientRect().left; chart.drag = {x0: x, x1: x, h0: hourFromEvent(e)}; });
chart.canvas.addEventListener('pointermove', e => {
  if (!state.selected) return;
  const hr = hourFromEvent(e), s = seriesFor(state.selected);
  if (chart.drag) chart.drag.x1 = e.clientX - chart.canvas.getBoundingClientRect().left;
  chart.hover = hr;
  const ro = $('#readout');
  ro.style.opacity = 1;
  ro.innerHTML = `${fmt(hr)} h<br><span style="color:#e9e9e4">VOLTAGE IDX ${fmt(valueAt(s, 'v', hr), 3)}</span><br><span style="color:#7fa7c9">EFFICIENCY IDX ${fmt(valueAt(s, 'e', hr), 3)}</span>`;
  renderSeries();
});
addEventListener('pointerup', e => {
  if (!chart.drag) return;
  const d = chart.drag; chart.drag = null;
  if (Math.abs(d.x1 - d.x0) > 8) { const h1 = hourFromEvent(e); state.view = [Math.min(d.h0, h1), Math.max(d.h0, h1)]; }
  renderSeries();
});
chart.canvas.addEventListener('pointerleave', () => { chart.hover = null; $('#readout').style.opacity = 0; renderSeries(); });
$('#reset-zoom').onclick = () => { state.view = null; renderSeries(); };
$('#jump').onclick = () => {
  const r = state.selected; if (r.breach === null) return;
  state.view = [Math.max(0, r.breach - 40), Math.min(r.duration, r.breach + 40)];
  setScrub(r.breach); renderSeries();
};
const step = dir => { const list = visible(); if (!list.length) return; const i = list.findIndex(r => r === state.selected); select(list[(i + dir + list.length) % list.length]); };
$('#prev-run').onclick = () => step(-1);
$('#next-run').onclick = () => step(1);

// ---------- run detail, milestones, lanes ----------
function renderRun() {
  const r = state.selected, c = CATS[r.cat];
  $('#run-title').textContent = r.id;
  const alert = $('#alert');
  alert.style.setProperty('--c', c.color);
  alert.innerHTML = r.breach === null
    ? `<b>No breach recorded across ${fmt(r.duration)} h.</b> ${r.eventHour !== null ? `${SIGNALS[r.first]} still shifted at ${fmt(r.eventHour)} h, which is why an event alone is not a warning.` : 'No signal events were recorded.'}<span class="mono">OUTCOME · ${c.label.toUpperCase()}</span>`
    : `<b>${c.label}: first breach at ${fmt(r.breach)} h.</b> ${SIGNALS[r.first]} shifted ${fmt(r.gap)} h earlier. Criterion values are withheld in this public edition.<span class="mono">STAGE · ${r.breach < 24 ? 'EARLY LIFE' : r.breach < 200 ? 'MID-RUN' : 'EXTENDED RUN'} · STAND ${r.stand}</span>`;
  $('#jump').disabled = r.breach === null; $('#jump').style.opacity = r.breach === null ? .35 : 1;
  $('#meta').innerHTML = [['DURATION', `${fmt(r.duration)} h`], ['FIRST BREACH', r.breach === null ? '—' : `${fmt(r.breach)} h`], ['FIRST SIGNAL', r.first === null ? '—' : SIGNALS[r.first]], ['STAND', r.stand], ['ELECTRODE LOT', r.lot], ['CATALYST LOT', r.catalyst]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('#scrub').max = r.duration.toFixed(1);
  setScrub(r.breach ?? r.duration);
  renderLanes();
}
function setScrub(hour) {
  state.scrub = Math.max(0, Math.min(state.selected.duration, hour));
  $('#scrub').value = state.scrub;
  $('#scrub-out').textContent = `${fmt(state.scrub)} h`;
  renderMiles(); renderSeries();
}
$('#scrub').addEventListener('input', e => setScrub(+e.target.value));
function renderMiles() {
  const r = state.selected, s = seriesFor(r), base = valueAt(s, 'v', 8), baseE = valueAt(s, 'e', 8);
  $('#miles').innerHTML = MILESTONES.map(m => {
    if (m > r.duration) return `<div class="wait"><span>${m} H</span><strong>Beyond run</strong><p>Run ended at ${fmt(r.duration, 0)} h</p></div>`;
    if (m > state.scrub) return `<div class="wait"><span>${m} H</span><strong>Not reached yet</strong><p>Scrub forward</p></div>`;
    const after = r.breach !== null && m >= r.breach;
    return `<div class="${after ? 'after' : 'ok'}"><span>${m} H</span><strong>${after ? 'After first breach' : 'Within criteria'}</strong><p>ΔV idx ${fmt(valueAt(s, 'v', m) - base, 3)}<br>ΔE idx ${fmt(valueAt(s, 'e', m) - baseE, 3)}</p></div>`;
  }).join('');
}
function renderLanes() {
  const r = state.selected, W = 640, L = 96, R = 20, X = hr => L + hr / r.duration * (W - L - R);
  const rows = SIGNALS.map((name, i) => {
    const y = 40 + i * 46, hr = r.events[i];
    return `<text x="0" y="${y + 4}" fill="#aeb4bd" font-size="11">${name}</text><path d="M${L} ${y}H${W - R}" stroke="#262a33"/>` +
      (hr === null ? `<text x="${W - R}" y="${y + 4}" text-anchor="end" fill="#5d636d" font-size="10" font-family="monospace">no shift</text>`
        : `<circle cx="${X(hr)}" cy="${y}" r="${i === r.first ? 8 : 5}" fill="${SIGNAL_COLORS[i]}"${i === r.first ? '' : ' opacity=".7"'}/><text x="${X(hr)}" y="${y - 13}" text-anchor="middle" fill="#cfd4db" font-size="10" font-family="monospace">${fmt(hr)}h${i === r.first ? ' · FIRST' : ''}</text>`);
  }).join('');
  const oy = 178;
  const outcome = r.breach === null
    ? `<text x="${L}" y="${oy + 4}" fill="#8e95a1" font-size="11">No outcome within ${fmt(r.duration, 0)} h</text>`
    : `<path d="M${X(r.breach)} 22V${oy}" stroke="#ff3d3d" stroke-dasharray="3 5"/><rect x="${X(r.breach) - 6}" y="${oy - 6}" width="12" height="12" fill="#ff3d3d" transform="rotate(45 ${X(r.breach)} ${oy})"/>` +
      (r.eventHour !== null ? `<path d="M${X(r.eventHour)} ${oy + 22}H${X(r.breach)}" stroke="#ff5b1f" stroke-width="2"/><text x="${(X(r.eventHour) + X(r.breach)) / 2}" y="${oy + 38}" text-anchor="middle" fill="#ff5b1f" font-size="10" font-family="monospace">${fmt(r.gap)} h</text>` : '');
  $('#lanes').innerHTML = rows + `<text x="0" y="${oy + 4}" fill="#ff3d3d" font-size="11">Outcome</text><path d="M${L} ${oy}H${W - R}" stroke="#262a33"/>` + outcome;
  $('#gap').textContent = r.gap === null ? '—' : `${fmt(r.gap)} h`;
  $('#gap-copy').textContent = r.gap === null
    ? 'This run has no outcome to measure against. Runs like it keep the analysis honest, because signals also move in runs that never breach.'
    : `Between the first signal event and the first breach. It sets a review window. It does not show that ${SIGNALS[r.first]} caused the outcome.`;
}

// ---------- aggregates ----------
function renderAggregates() {
  const out = visible().filter(r => r.breach !== null && r.eventHour !== null);
  const counts = SIGNALS.map((_, i) => out.filter(r => r.first === i).length), max = Math.max(1, ...counts);
  $('#first-bars').innerHTML = SIGNALS.map((name, i) => `<div><span>${name} first</span><i style="width:${counts[i] / max * 100}%;background:linear-gradient(90deg,${SIGNAL_COLORS[i]},#ff5b1f)"></i><b>${counts[i]}</b></div>`).join('');
  const bins = Array(10).fill(0); out.forEach(r => bins[Math.min(9, Math.floor(r.gap / 5))]++);
  const bm = Math.max(1, ...bins), W = 640, H = 170, bw = (W - 40) / 10;
  $('#hist').innerHTML = bins.map((n, i) => { const bh = n / bm * 120; return `<rect x="${20 + i * bw + 3}" y="${140 - bh}" width="${bw - 6}" height="${bh}" fill="#ff5b1f" opacity="${.45 + n / bm * .55}"><title>${i * 5}–${i * 5 + 5} h: ${n} runs</title></rect><text x="${20 + i * bw + bw / 2}" y="160" text-anchor="middle" fill="#8e95a1" font-size="10" font-family="monospace">${i * 5}</text>${n ? `<text x="${20 + i * bw + bw / 2}" y="${134 - bh}" text-anchor="middle" fill="#cfd4db" font-size="10" font-family="monospace">${n}</text>` : ''}`; }).join('') + `<path d="M20 140H${W - 20}" stroke="#3a3f4a"/>`;
  renderNear(visible().filter(r => r.eventHour !== null));
}
function renderNear(list) {
  const offsets = Array.from({length: 25}, (_, i) => (i - 12) * 2);
  const panels = [['v', 'VOLTAGE INDEX', '#e9e9e4'], ['e', 'EFFICIENCY INDEX', '#7fa7c9'], ['first', 'FIRST-MOVING SIGNAL', '#ff5b1f']];
  $('#near-n').textContent = `n = ${list.length} runs`;
  $('#near').innerHTML = panels.map(([key, label, color]) => {
    const means = offsets.map(o => {
      let sum = 0, n = 0;
      list.forEach(r => {
        const s = seriesFor(r), k = key === 'first' ? `s${r.first}` : key, at = r.eventHour + o;
        if (at < 0 || at > r.duration) return;
        const dir = key === 'first' ? r.dirs[r.first] : 1;
        sum += (valueAt(s, k, at) - valueAt(s, k, Math.max(0, r.eventHour - 24))) * dir; n++;
      });
      return n ? sum / n : 0;
    });
    const ext = Math.max(.02, ...means.map(Math.abs)), W = 300, H = 120, X = i => 10 + i / 24 * (W - 20), Y = v => H / 2 - v / ext * (H / 2 - 12);
    const path = means.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
    return `<figure><figcaption><span>${label}</span><span>Δ ${means.at(-1) >= 0 ? '+' : ''}${fmt(means.at(-1), 3)}</span></figcaption><svg viewBox="0 0 ${W} ${H + 18}"><path d="M10 ${H / 2}H${W - 10}" stroke="#262a33"/><path d="M${W / 2} 6V${H - 4}" stroke="#ff5b1f55" stroke-dasharray="3 4"/><path d="${path} L${X(24)} ${H / 2} L${X(0)} ${H / 2}Z" fill="${color}" opacity=".12"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2"/><text x="10" y="${H + 14}" fill="#8e95a1" font-size="9" font-family="monospace">−24h</text><text x="${W / 2}" y="${H + 14}" text-anchor="middle" fill="#ff5b1f" font-size="9" font-family="monospace">FIRST EVENT</text><text x="${W - 10}" y="${H + 14}" text-anchor="end" fill="#8e95a1" font-size="9" font-family="monospace">+24h</text></svg></figure>`;
  }).join('');
}

// ---------- orchestration ----------
function select(r) {
  state.selected = r; state.view = null;
  renderRun(); renderMatrix(); renderSpace();
}
function refresh() {
  renderLegend(); renderKpis(); renderMatrix(); renderAggregates();
  const list = visible();
  if (!state.selected || !list.includes(state.selected)) select(list.find(r => r.breach !== null && r.eventHour !== null) || list[0]);
  else renderSpace();
}
document.querySelectorAll('[data-dataset]').forEach(b => b.onclick = () => {
  state.key = b.dataset.dataset;
  document.querySelectorAll('[data-dataset]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
  state.selected = null; refresh();
});
$('#stand').onchange = e => { state.stand = e.target.value; refresh(); };
$('#export').onclick = () => {
  const rows = [['run_id', 'outcome_category', 'stand', 'electrode_lot', 'catalyst_lot', 'duration_h', 'first_signal', 'first_event_h', 'first_breach_h', 'gap_h']]
    .concat(visible().map(r => [r.id, CATS[r.cat].label, r.stand, r.lot, r.catalyst, fmt(r.duration), r.first === null ? '' : SIGNALS[r.first], r.eventHour === null ? '' : fmt(r.eventHour), r.breach === null ? '' : fmt(r.breach), r.gap === null ? '' : fmt(r.gap)]));
  const blob = new Blob(['# Synthetic public demo data. Not Oxylus experimental data.\n' + rows.map(r => r.join(',')).join('\n')], {type: 'text/csv'});
  const a = Object.assign(document.createElement('a'), {href: URL.createObjectURL(blob), download: `oxylus-synthetic-formulation-${state.key}.csv`});
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
addEventListener('resize', () => { renderSpace(); renderSeries(); });
refresh();
})();
