// "Instrument" identity: live dimension lines, side ruler, cursor readout, figure labels, registration marks.
(() => {
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const pad = (n, w = 4) => String(Math.max(0, Math.round(n))).padStart(w, '0');

// ---------- live dimension lines over accent words ----------
const accents = [...document.querySelectorAll('.portfolio-hero h1 em, .work-heading h2 em, .about h2 em, .contact h2 em')];
accents.forEach(em => em.classList.add('measure'));
const measure = () => accents.forEach(em => { em.dataset.w = `W ${em.getBoundingClientRect().width.toFixed(1)} PX`; });
new ResizeObserver(measure).observe(document.documentElement);
document.fonts?.ready.then(measure);
measure();
const showMeasures = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { measure(); e.target.classList.add('on'); showMeasures.unobserve(e.target); } }), {rootMargin: '0px 0px -15% 0px'});
// The hero headline animates out of clipped lines; let it settle before drawing above it.
const heroTitle = document.querySelector('.portfolio-hero h1');
const settle = () => { heroTitle?.classList.add('settled'); accents.forEach(em => showMeasures.observe(em)); };
if (heroTitle) {
  const wait = () => document.body.classList.contains('is-ready') ? setTimeout(settle, reduced ? 0 : 1500) : setTimeout(wait, 120);
  wait();
} else settle();

// ---------- hero: coordinates + live cursor readout ----------
const meta = document.querySelector('.hero-meta span:last-child');
if (meta) { meta.classList.add('coords'); meta.textContent = 'ANN ARBOR, MI · 42.2808° N, 83.7430° W'; }
const foot = document.querySelector('.hero-foot span:last-child');
if (foot) {
  foot.innerHTML = '<span class="readout">X 0000 · Y 0000</span> · SCROLL ↓';
  const out = foot.querySelector('.readout');
  if (fine) addEventListener('pointermove', e => { out.textContent = `X ${pad(e.clientX)} · Y ${pad(e.clientY + scrollY)}`; }, {passive: true});
}

// ---------- registration marks + figure labels ----------
const mark = (el, dark) => { el.classList.add('marked'); if (dark) el.classList.add('on-dark'); };
document.querySelectorAll('.case-hero-media').forEach((el, i) => {
  mark(el, !el.classList.contains('northern') && !el.classList.contains('fablab'));
  el.dataset.fig = `FIG. 01 — ${document.querySelector('.case-meta div')?.textContent.replace('PROJECT', '').trim() || 'Cover'}`;
});
document.querySelectorAll('.case-gallery figure').forEach((el, i) => { mark(el); el.dataset.fig = `FIG. ${String(i + 2).padStart(2, '0')} — Detail`; });
document.querySelectorAll('.code-console, .code-proof').forEach(el => mark(el, true));
document.querySelectorAll('.about-monogram').forEach(el => mark(el, true));
// cinema.js rewrites the index preview's class on every hover; re-apply the marks after each change.
const preview = document.querySelector('.index-preview');
if (preview) new MutationObserver(() => {
  if (!preview.classList.contains('marked')) preview.classList.add('marked');
  const dark = !preview.classList.contains('project-northern') && !preview.classList.contains('project-fablab');
  if (preview.classList.contains('on-dark') !== dark) preview.classList.toggle('on-dark', dark);
}).observe(preview, {attributes: true, attributeFilter: ['class']});

// ---------- side ruler: reading position along the whole page ----------
const scenes = [...document.querySelectorAll('[data-scene]')];
if (scenes.length && innerWidth > 1100) {
  const ruler = document.createElement('div');
  ruler.className = 'ruler'; ruler.setAttribute('aria-hidden', 'true');
  ruler.innerHTML = Array.from({length: 101}, (_, i) => `<i class="${i % 10 ? '' : 'major'}" style="top:${i}%"></i>`).join('') + '<div class="ruler-mark"><span>000</span></div>';
  document.body.append(ruler); document.body.classList.add('has-ruler');
  const markEl = ruler.querySelector('.ruler-mark'), label = markEl.querySelector('span');
  const buttons = scenes.map(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.tabIndex = -1; b.textContent = s.dataset.scene.slice(0, 2);
    b.title = s.dataset.scene;
    b.onclick = () => window.__lenis ? window.__lenis.scrollTo(s, {offset: -82, duration: 1.4}) : s.scrollIntoView({behavior: 'smooth'});
    ruler.append(b); return b;
  });
  const layout = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scenes.forEach((s, i) => { buttons[i].style.top = `${Math.min(98, s.offsetTop / max * 100)}%`; });
  };
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
    markEl.style.transform = `translateY(${p * ruler.clientHeight}px)`;
    label.textContent = pad(p * 1000, 3);
    let current = 0;
    scenes.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .5) current = i; });
    buttons.forEach((b, i) => b.classList.toggle('on', i === current));
    ruler.classList.toggle('dark', scenes[current]?.dataset.tone === 'dark' || scenes[current]?.id === 'contact');
  };
  let queued = false;
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } }, {passive: true});
  addEventListener('resize', () => { layout(); update(); });
  new ResizeObserver(() => { layout(); update(); }).observe(document.body);
  layout(); update();
}
})();
