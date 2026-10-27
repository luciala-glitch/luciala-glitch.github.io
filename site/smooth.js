// Inertial scrolling (Lenis) for mouse and trackpad. Touch devices and reduced-motion users keep native scrolling.
(() => {
  if (!window.Lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({lerp: .085, smoothWheel: true});
  window.__lenis = lenis;
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // In-page anchors glide instead of jumping; keyboard focus still moves to the target.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const hash = a.getAttribute('href');
    e.preventDefault();
    if (hash === '#') { lenis.scrollTo(0, {duration: 1.6}); return; }
    const target = document.querySelector(hash);
    if (!target) return;
    lenis.scrollTo(target, {offset: -82, duration: 1.4});
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    history.replaceState(null, '', hash);
  });
})();
