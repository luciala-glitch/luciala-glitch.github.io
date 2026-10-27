// Cinematic layer: intro, hero line reveal, 3D particle fields, pinned strengths sequence, demo theater, reveals, tilt, index preview.
(() => {
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const body = document.body;

// ---------- intro curtain (once per session) ----------
const seen = true;
if (body.classList.contains('portfolio-home') && !seen && !reduced) {
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<i class="bar top"></i><i class="bar bottom"></i><div class="curtain-copy"><span>LUCIA LIAO</span><b>CALIBRATING · RESEARCH · INTERFACE · CODE</b><em>00</em></div>';
  body.append(curtain);
  const counter = curtain.querySelector('em'), start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / 700);
    counter.textContent = String(Math.round(p * 100)).padStart(2, '0');
    if (p < 1) requestAnimationFrame(tick);
    else { curtain.classList.add('open'); body.classList.add('is-ready'); setTimeout(() => curtain.remove(), 1100); }
  };
  requestAnimationFrame(tick);
  curtain.addEventListener('click', () => { curtain.classList.add('open'); body.classList.add('is-ready'); });
} else body.classList.add('is-ready');

// ---------- hero headline: lines rise out of a mask ----------
const heroTitle = document.querySelector('.portfolio-hero h1');
if (heroTitle && !reduced) {
  heroTitle.innerHTML = heroTitle.innerHTML.split(/<br\s*\/?>/i).map((line, i) => `<span class="line"><span style="--i:${i}">${line}</span></span>`).join('');
  heroTitle.classList.add('split');
}

// ---------- particle field ----------
const N = 1400;
const fib = i => { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.399963; return [Math.cos(t) * r, y, Math.sin(t) * r]; };
const SHAPES = {
  sphere: i => fib(i),
  rings: i => { const ring = i % 3, a = i / N * Math.PI * 2 * 7, r = [1, .72, .44][ring], tilt = [0, 1.05, 2.1][ring]; const x = Math.cos(a) * r, z = Math.sin(a) * r; return [x, z * Math.sin(tilt) * .9, z * Math.cos(tilt)]; },
  helix: i => { const strand = i % 2, t = (i / N) * Math.PI * 7, y = (i / N) * 2.4 - 1.2; const a = t + strand * Math.PI; if (i % 9 === 0) { const s = ((i * 7) % 10) / 10 * 2 - 1; return [Math.cos(t) * .55 * s, y, Math.sin(t) * .55 * s]; } return [Math.cos(a) * .55, y, Math.sin(a) * .55]; },
  lattice: i => { const n = 11, x = i % n, y = Math.floor(i / n) % n, z = Math.floor(i / n / n) % n; return [x / (n - 1) * 1.5 - .75, y / (n - 1) * 1.5 - .75, z / (n - 1) * 1.5 - .75]; },
  wave: i => { const n = 40, x = (i % n) / (n - 1) * 2.4 - 1.2, z = Math.floor(i / n) / (N / n) * 2.4 - 1.2; return [x, Math.sin(x * 3) * .18 + Math.cos(z * 2.5) * .16 - .1, z]; },
  torus: i => { const u = i / N * Math.PI * 2 * 1, v = (i * 37 % N) / N * Math.PI * 2; const r = 1 + .32 * Math.cos(3 * u); return [(r * .7 + .26 * Math.cos(v)) * Math.cos(u), .26 * Math.sin(v) + .22 * Math.sin(3 * u), (r * .7 + .26 * Math.cos(v)) * Math.sin(u)]; }
};
const PALETTE = ['#ff5b1f', '#8b91a0', '#0c0e11', '#0c0e11'];

class Field {
  constructor(canvas, opts) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.o = opts;
    this.pts = Array.from({length: N}, (_, i) => ({p: SHAPES[opts.shapes[0]](i), from: null, c: opts.colorFor(i)}));
    this.target = 0; this.morphStart = 0; this.rot = 0; this.mx = 0; this.my = 0; this.visible = true;
    new ResizeObserver(() => this.resize()).observe(canvas); this.resize();
    new IntersectionObserver(e => this.visible = e[0].isIntersecting).observe(canvas);
  }
  resize() { const d = Math.min(devicePixelRatio || 1, 1.5); this.w = this.canvas.clientWidth; this.h = this.canvas.clientHeight; this.canvas.width = this.w * d; this.canvas.height = this.h * d; this.ctx.setTransform(d, 0, 0, d, 0, 0); this.draw(performance.now()); }
  morph(index) {
    if (index === this.target) return;
    this.target = index; this.morphStart = performance.now();
    const fn = SHAPES[this.o.shapes[index]];
    this.pts.forEach((pt, i) => { pt.from = pt.p.slice(); pt.to = fn(i); });
  }
  draw(now) {
    const {ctx, w, h, o} = this; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = Math.min(1, (now - this.morphStart) / 1400), e = k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
    const yaw = this.rot + this.mx * .6, pitch = .32 + this.my * .4, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scale = Math.min(w, h) * o.scale, cx = w * o.cx, cyy = h * o.cy;
    for (const pt of this.pts) {
      if (pt.from) { pt.p = pt.from.map((v, j) => v + (pt.to[j] - v) * e); if (k >= 1) pt.from = null; }
      const [x, y, z] = pt.p;
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const f = 3 / (3 + z2), size = Math.max(.4, (1.5 - z2 * .6) * o.dot);
      ctx.globalAlpha = Math.max(.08, Math.min(1, (.62 - z2 * .38) * o.alpha));
      ctx.fillStyle = pt.c;
      ctx.fillRect(cx + x1 * scale * f, cyy - y1 * scale * f, size, size);
    }
    ctx.globalAlpha = 1;
  }
  start() {
    const loop = now => {
      requestAnimationFrame(loop);
      if (!this.visible || document.hidden) return;
      if (!reduced) this.rot += this.o.speed;
      this.draw(now);
    };
    requestAnimationFrame(loop);
  }
}

const heroCanvas = document.querySelector('#field');
if (heroCanvas) {
  const field = new Field(heroCanvas, {shapes: ['sphere', 'torus', 'helix', 'lattice'], cx: .5, cy: .5, scale: .36, dot: 1.6, alpha: 1, speed: .0022,
    colorFor: i => i % 11 === 0 ? PALETTE[2] : i % 5 === 0 ? PALETTE[1] : PALETTE[0]});
  const labels = ['OBSERVE', 'CONNECT', 'SEQUENCE', 'BUILD'], label = document.querySelector('#field-label');
  let i = 0;
  if (!reduced) setInterval(() => { if (document.hidden) return; i = (i + 1) % 4; field.morph(i); if (label) label.textContent = `${String(i + 1).padStart(2, '0')} / ${labels[i]}`; }, 4200);
  heroCanvas.closest('section').addEventListener('pointermove', e => { field.mx = e.clientX / innerWidth - .5; field.my = e.clientY / innerHeight - .5; });
  field.start();
}

// ---------- pinned strengths sequence ----------
const strengths = document.querySelector('.strengths');
if (strengths) {
  const items = [...strengths.querySelectorAll('.strength')];
  const canvas = strengths.querySelector('#strength-field');
  const field = canvas && new Field(canvas, {shapes: ['rings', 'wave', 'lattice', 'helix'], cx: .5, cy: .5, scale: .38, dot: 1.7, alpha: 1.15, speed: .003,
    colorFor: i => i % 4 === 0 ? '#6f7bff' : i % 3 === 0 ? '#ff5b1f' : '#e9ebf0'});
  field?.start();
  const bar = strengths.querySelector('.strength-progress i'), count = strengths.querySelector('.strength-count');
  const setStep = idx => {
    items.forEach((el, j) => el.classList.toggle('active', j === idx));
    field?.morph(idx);
    if (count) count.textContent = `0${idx + 1}`;
  };
  setStep(0);
  const onScroll = () => {
    if (innerWidth <= 900) return;
    const box = strengths.getBoundingClientRect(), span = box.height - innerHeight;
    const p = Math.max(0, Math.min(1, -box.top / span));
    if (bar) bar.style.transform = `scaleX(${p})`;
    setStep(Math.min(items.length - 1, Math.floor(p * items.length * .999)));
  };
  let queued = false;
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; onScroll(); }); } }, {passive: true}); onScroll();
  items.forEach((el, j) => el.addEventListener('mouseenter', () => innerWidth <= 900 && setStep(j)));
  strengths.addEventListener('pointermove', e => { field.mx = e.clientX / innerWidth - .5; field.my = e.clientY / innerHeight - .5; });
}

// ---------- scroll progress + scene HUD ----------
const progress = document.createElement('div');
progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true');
body.append(progress);
const hud = document.querySelector('.scene-hud');
const scenes = [...document.querySelectorAll('[data-scene]')];
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  if (hud) {
    let current = scenes[0];
    scenes.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .5) current = s; });
    if (current && hud.dataset.scene !== current.dataset.scene) { hud.dataset.scene = current.dataset.scene; hud.querySelector('b').textContent = current.dataset.scene; hud.classList.remove('flip'); void hud.offsetWidth; hud.classList.add('flip'); }
    hud.classList.toggle('dark', !!current && current.dataset.tone === 'dark');
    hud.classList.toggle('idle', current === scenes[0]);
  }
};
let scrollQueued = false;
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(() => { scrollQueued = false; onScroll(); }); } }, {passive: true}); onScroll();

// ---------- headline reveals ----------
const revealTargets = document.querySelectorAll('main h2, .case-page .story-row, .case-page .metrics, .steps article');
revealTargets.forEach(el => el.classList.add('cine'));
const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px'});
revealTargets.forEach(el => io.observe(el));
// Fast jumps (anchor links, flick scrolls) can carry an element past the viewport between observer ticks.
const sweep = () => revealTargets.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight * .92) el.classList.add('in'); });
addEventListener('scroll', () => requestAnimationFrame(sweep), {passive: true});

// ---------- demo theater: open prototypes inside the case page ----------
const caseHost = document.querySelector('#case');
if (caseHost) {
  const theater = document.createElement('div');
  theater.className = 'theater'; theater.hidden = true;
  theater.setAttribute('role', 'dialog'); theater.setAttribute('aria-modal', 'true'); theater.setAttribute('aria-label', 'Interactive prototype');
  theater.innerHTML = '<div class="theater-bar"><button type="button" class="theater-back">← Back to case study <kbd>Esc</kbd></button><span class="theater-title"></span><a class="theater-new" target="_blank" rel="noopener">Open in new tab ↗</a></div><div class="theater-stage"><div class="theater-loading">LOADING PROTOTYPE</div></div>';
  body.append(theater);
  const stage = theater.querySelector('.theater-stage'), back = theater.querySelector('.theater-back');
  let opener = null, pushed = false;
  const open = (href, label) => {
    opener = document.activeElement;
    stage.querySelector('iframe')?.remove();
    const frame = document.createElement('iframe');
    frame.src = href; frame.title = label;
    frame.addEventListener('load', () => {
      theater.classList.add('loaded');
      // A demo's own "back to case study" link should close the theater, not load the case inside it.
      try { if (!frame.contentWindow.location.pathname.includes('/demos/')) close(false, true); } catch {}
    });
    stage.append(frame);
    theater.querySelector('.theater-title').textContent = label;
    theater.querySelector('.theater-new').href = href;
    theater.classList.remove('loaded'); theater.hidden = false;
    requestAnimationFrame(() => theater.classList.add('on'));
    body.classList.add('theater-open'); window.__lenis?.stop();
    history.pushState({theater: true}, '', '#prototype'); pushed = true;
    back.focus();
  };
  const close = (fromHistory, frameNavigated) => {
    if (theater.hidden) return;
    theater.classList.remove('on'); body.classList.remove('theater-open'); window.__lenis?.start();
    setTimeout(() => { theater.hidden = true; stage.querySelector('iframe')?.remove(); }, 450);
    // After an in-frame navigation, back() would step the iframe instead, so just clean the URL.
    if (pushed && !fromHistory) frameNavigated ? history.replaceState(null, '', location.pathname + location.search) : history.back();
    pushed = false; opener?.focus();
  };
  back.addEventListener('click', () => close(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(false); });
  addEventListener('popstate', () => close(true));
  caseHost.addEventListener('click', e => {
    const link = e.target.closest('a[href^="demos/"]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    const name = caseHost.querySelector('.case-meta div')?.textContent.replace('PROJECT', '').trim() || 'Prototype';
    open(link.getAttribute('href'), `${name} · Interactive prototype`);
  });
  if (location.hash === '#prototype') history.replaceState(null, '', location.pathname + location.search);
}

// ---------- project card tilt ----------
const bindTilt = () => document.querySelectorAll('.project-art').forEach(art => {
  if (art.dataset.tilt) return; art.dataset.tilt = '1';
  art.addEventListener('pointermove', e => {
    if (!finePointer || reduced) return;
    const b = art.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    art.style.setProperty('--ry', `${x * 7}deg`); art.style.setProperty('--rx', `${-y * 7}deg`);
  });
  art.addEventListener('pointerleave', () => { art.style.setProperty('--ry', '0deg'); art.style.setProperty('--rx', '0deg'); });
});
bindTilt();

// ---------- index rows: floating preview follows the pointer ----------
const index = document.querySelector('#projects');
if (index && finePointer && !reduced) {
  const preview = document.createElement('div');
  preview.className = 'index-preview'; preview.setAttribute('aria-hidden', 'true');
  body.append(preview);
  let x = 0, y = 0, px = 0, py = 0, active = false;
  index.addEventListener('pointerover', e => {
    const row = e.target.closest('.project'); if (!row) return;
    preview.innerHTML = row.querySelector('.project-art').innerHTML;
    preview.className = `index-preview on ${[...row.classList].find(c => c.startsWith('project-')) || ''}`;
    active = true;
  });
  index.addEventListener('pointerleave', () => { preview.classList.remove('on'); active = false; });
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
  (function follow() { px += (x - px) * .14; py += (y - py) * .14; if (active) preview.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%) rotate(${(x - px) * .04}deg)`; requestAnimationFrame(follow); })();
}

})();
