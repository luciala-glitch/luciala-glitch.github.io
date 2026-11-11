(function(){
  "use strict";
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function $(s, el){ return (el || document).querySelector(s); }
  function $$(s, el){ return [].slice.call((el || document).querySelectorAll(s)); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function ramp(p, a, b){ if (b <= a) return p >= b ? 1 : 0; return smooth(clamp((p - a) / (b - a), 0, 1)); }
  function mulberry(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* progress of a tall sticky section: 0 when its top meets the viewport top, 1 when its bottom meets the viewport bottom */
  function stickProgress(el){ var r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  function near(el, margin){ var r = el.getBoundingClientRect(), m = innerHeight * (margin || .5); return r.bottom > -m && r.top < innerHeight + m; }

  /* one frame loop; modules register a tick(dt) */
  var ticks = [];
  var last = performance.now();
  function step(now){
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    for (var i = 0; i < ticks.length; i++){
      try { ticks[i](dt); }
      catch (err){ if (!ticks[i].failed && window.console) console.error(err); ticks[i].failed = true; }
    }
  }
  function loop(now){ requestAnimationFrame(loop); step(now); }
  /* ?frames=timer drives the loop from a timer (for headless capture, where rAF barely fires) */
  var TIMER = /frames=timer/.test(location.search);

  /* ---------------------------------------------------------------
     DATA
  ---------------------------------------------------------------- */
  var ALL = (typeof projects !== 'undefined') ? projects : [];
  var ORDER = ['silverado', 'fablab', 'gear', 'northern', 'oxylus'];
  var CFG = {
    silverado:{ shape:1, accent:'#ffb36b', h:['The right signal.', 'At the right moment.'], device:'wide', sig:function(host){ if (!window.LLCockpit){ sigSilverado(host); return; } var a = document.createElement('div'), b = document.createElement('div'); host.appendChild(a); host.appendChild(b); var ck = window.LLCockpit(a, { ticks:ticks, stickProgress:stickProgress, near:near, RM:RM }); if (window.LLCompanion) window.LLCompanion(b, ck); },
      sigTitle:['Take the', 'driver’s seat.'], sigText:'Mark is driving his wife and two children to the family’s lake house, towing a small trailer of bikes and outdoor gear. The concept is rebuilt here in code — driver display, center display, steering-wheel controls and the physical button bar. Scroll to ride along, or take over and press anything.',
      demoText:'Enter the original cockpit design, then complete a guided towing flow across the center display and instrument cluster. The interactive targets follow the existing Figma prototype.',
      demoCta:'Step inside the experience' },
    fablab:{ shape:2, accent:'#7fe0c3', h:['Design the', 'moment before.'], device:'phone', sig:sigFablab,
      sigTitle:['From paper', 'to prototype.'], sigText:'Paper prototypes tested the flow before any pixels. Scroll, and each sketch is printed into the screen it became.',
      demoText:'My Figma prototype rebuilt as a working app: log in, find a machine, book a slot, pass a safety quiz, and change or cancel a booking.',
      demoCta:'Try the mobile prototype' },
    gear:{ shape:3, accent:'#9cc3ff', h:['Clarity across', 'complexity.'], device:'laptop', sig:sigGear,
      sigTitle:['Every field,', 'traced to its source.'], sigText:'The records already existed — in forms, drawings, quotes, notes and emails. Watch them pass the scanner and come out as fields in one linked view. Hover to slow it; drag to scrub.',
      demoText:'Adapted from my local HTML prototype. Explore linked views, priorities, filters, and project details with demonstration data and fictional owner names.',
      demoCta:'Try the dashboard' },
    northern:{ shape:4, accent:'#f2dcc0', h:['Question the', 'measurement.'], device:'laptop', sig:sigNorthern,
      sigTitle:['Read it', 'again.'], sigText:'Each line is one tooth surface, read twice in blinded rounds. Move from round one to round two: the average barely moves, but some readings cross a stage boundary.',
      demoText:'A browser adaptation of the signed-axis measurement logic in my local research tool. Place landmarks on publicly sourced X-rays, zoom and pan, and use blind mode. Research demonstration only.',
      demoCta:'Try the measurement tool' },
    oxylus:{ shape:5, accent:'#ff7a59', h:['See the sequence,', 'not just the result.'], device:'laptop', sig:sigOxylus,
      sigTitle:['Which signal', 'moved first?'], sigText:'A pass or fail label tells you how a run ended. Scroll the playhead through one synthetic run and watch the order of events assemble before the outcome.',
      demoText:'A public explorer built on the structure of the team dashboard: run directory, 3D run space, telemetry zoom, milestone scrubber, event order, and average change near events. Every run is generated in the browser.',
      demoCta:'Open the explorer' }
  };
  var id = new URLSearchParams(location.search).get('id');
  if (!CFG[id]) id = ORDER[0];
  var p = ALL.filter(function(x){ return x.id === id; })[0];
  var c = CFG[id];
  var idx = ORDER.indexOf(id);
  var num = '0' + (idx + 1);
  root.style.setProperty('--accent', c.accent);
  document.title = p.name + ' — Lucia Liao';

  /* project switcher */
  $('.w-switch').innerHTML = ORDER.map(function(k, i){
    var q = ALL.filter(function(x){ return x.id === k; })[0];
    return '<a href="work.html?id=' + k + '"' + (k === id ? ' aria-current="page"' : '') + '><i></i>0' + (i + 1) + ' ' + q.name.split(/[ \/]/)[0].toUpperCase() + '</a>';
  }).join('');

  /* ---------------------------------------------------------------
     PAGE
  ---------------------------------------------------------------- */
  var next = ALL.filter(function(x){ return x.id === ORDER[(idx + 1) % ORDER.length]; })[0];
  var demoUrl = 'demos/' + p.demo + '.html' + (id === 'oxylus' ? '#explorer' : '');
  var gallery = (p.gallery || []).length > 1 ? p.gallery : null;

  var html = '' +
  '<section class="w-hero">' +
    '<canvas class="w-field" aria-hidden="true"></canvas><div class="veil" aria-hidden="true"></div><div class="w-hero-frame" aria-hidden="true"></div>' +
    '<div class="w-hero-in">' +
      '<p class="eyebrow lbl">' + num + ' / ' + p.category + ' · ' + p.year + '</p>' +
      '<h1 class="w-title"><span class="hrow"><span class="hrise h1a">' + c.h[0] + '</span></span><span class="hrow"><span class="hrise h1b">' + c.h[1] + '</span></span></h1>' +
      '<p class="w-intro">' + p.intro + '</p>' +
      '<div class="w-ctas"><a class="cta lbl" href="#demo"><svg class="ico" viewBox="0 0 7 11" aria-hidden="true"><rect x="0" y="0" width="4" height="5"/><rect x="3" y="4" width="4" height="4"/><rect x="0" y="7" width="4" height="4"/></svg>' + c.demoCta + '</a>' +
      '<a class="cta-2 lbl" href="#story">Read the case ↓</a></div>' +
    '</div>' +
    '<dl class="w-meta"><div><dt>Role</dt><dd>' + p.role + '</dd></div><div><dt>Context</dt><dd>' + p.context + '</dd></div><div><dt>Methods</dt><dd>' + p.tags.join(' · ') + '</dd></div></dl>' +
    '<div class="w-cue lbl" aria-hidden="true"><i></i>SCROLL</div>' +
  '</section>' +
  '<section class="w-metrics rv">' + p.metrics.map(function(m){ return '<div><strong data-count="' + m[0] + '">' + m[0] + '</strong><small class="lbl">' + m[1] + '</small></div>'; }).join('') + '</section>' +
  row('01 / The question', p.question, p.problem, 'story') +
  row('02 / The research', 'Follow the <em>evidence.</em>', p.research) +
  '<section class="w-sig" id="signature"><div class="sig-head rv"><span class="lbl">' + num + ' / In motion</span><div><h2>' + c.sigTitle[0] + ' <em>' + c.sigTitle[1] + '</em></h2><p>' + c.sigText + '</p></div></div><div class="sig-body"></div></section>' +
  row('03 / The decision', 'Make the next step <em>clear.</em>', p.decision) +
  (gallery ? '<section class="w-gallery rv"><span class="lbl">Selected frames · drag →</span><div class="w-strip">' + gallery.map(function(g, i){ return '<figure><img src="assets/' + g + '.webp" alt="' + p.name + ' project detail ' + (i + 1) + '" loading="lazy" draggable="false"><figcaption class="lbl">' + (i < 9 ? '0' : '') + (i + 1) + ' / ' + (gallery.length < 10 ? '0' : '') + gallery.length + '</figcaption></figure>'; }).join('') + '</div></section>' : '') +
  row('04 / What it can claim', 'Honest about the <em>evidence.</em>', p.outcome) +
  '<section class="w-demo" id="demo"><p class="eyebrow lbl rv">Explore the interaction</p><h2 class="rv">Try the <em>thinking.</em></h2><p class="rv">' + c.demoText + '</p>' +
    '<div class="w-ctas rv"><a class="cta lbl" href="' + demoUrl + '" target="_blank" rel="noopener"><svg class="ico" viewBox="0 0 7 11" aria-hidden="true"><rect x="0" y="0" width="4" height="5"/><rect x="3" y="4" width="4" height="4"/><rect x="0" y="7" width="4" height="4"/></svg>Open full screen ↗</a></div>' +
    '<div class="dev-wrap"><div class="dev dev-' + c.device + '"><div class="scr"><div><iframe data-src="' + demoUrl + '" title="' + p.name + ' interactive demonstration" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"></iframe></div></div>' + (c.device !== 'phone' ? '<div class="base"></div>' : '') + '</div></div>' +
  '</section>' +
  '<a class="w-next" href="work.html?id=' + next.id + '" style="--next:' + CFG[next.id].accent + '"><span class="lbl">Next project · 0' + (ORDER.indexOf(next.id) + 1) + ' / 05</span><strong>' + next.name + '</strong><em>' + next.title + '</em><span class="arrow" aria-hidden="true">→</span></a>';

  function row(label, h, text, anchor){
    return '<section class="w-row rv"' + (anchor ? ' id="' + anchor + '"' : '') + '><span class="lbl">' + label + '</span><div><h2>' + h + '</h2><p>' + text + '</p></div></section>';
  }
  $('#work').innerHTML = html;

  /* hero particle form, sitting to the right of the copy */
  try {
    window.LLField.create({ canvas:$('.w-field'), shape:c.shape, accent:c.accent, size:[140, 300],
      layout:function(hw, hh, portrait){
        return portrait ? { scale:Math.min(hw * .78 / .72, hh * .36 / .72), x:0, y:hh * .42 }
                        : { scale:Math.min(1.2, hh * .64 / .72, hw * .36 / .72), x:hw * .3, y:hh * .06 };
      } });
  } catch (err){ if (window.console) console.warn('Particle field disabled:', err); }

  /* scroll meter */
  var meter = $('.w-meter');
  ticks.push(function(){
    var max = document.documentElement.scrollHeight - innerHeight;
    meter.style.transform = 'scaleX(' + (max > 0 ? clamp(scrollY / max, 0, 1) : 0) + ')';
  });

  /* reveal + metric count-up */
  if ('IntersectionObserver' in window && !RM){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(countUp);
      });
    }, { rootMargin:'0px 0px -12% 0px' });
    $$('.rv').forEach(function(el){ io.observe(el); });
  } else $$('.rv').forEach(function(el){ el.classList.add('in'); });
  function countUp(el){
    var v = el.dataset.count;
    if (!/^\d+$/.test(v) || +v < 2) return;
    var n = +v, t0 = performance.now();
    (function f(now){ var k = clamp((now - t0) / 1400, 0, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* gallery drag */
  var strip = $('.w-strip');
  if (strip){
    var dx0 = 0, sl0 = 0, down = false;
    strip.addEventListener('pointerdown', function(e){ if (e.pointerType !== 'mouse') return; down = true; dx0 = e.clientX; sl0 = strip.scrollLeft; strip.classList.add('drag'); strip.setPointerCapture(e.pointerId); });
    strip.addEventListener('pointermove', function(e){ if (down) strip.scrollLeft = sl0 - (e.clientX - dx0); });
    strip.addEventListener('pointerup', function(){ down = false; strip.classList.remove('drag'); });
  }

  /* device: lazy-load the demo, then let it settle flat as it enters */
  var dev = $('.dev'), devWrap = $('.dev-wrap'), frame = $('.dev iframe');
  ticks.push(function(){
    var r = devWrap.getBoundingClientRect();
    if (!frame.src && r.top < innerHeight * 2) frame.src = frame.dataset.src;
    if (r.top > innerHeight * 1.2 || r.bottom < -200) return;
    var k = RM ? 1 : smooth(clamp((innerHeight - r.top) / (innerHeight * .75), 0, 1));
    dev.style.setProperty('--tilt', (20 * (1 - k)).toFixed(2) + 'deg');
    dev.style.setProperty('--dscale', (.9 + .1 * k).toFixed(3));
  });

  /* signature module */
  c.sig($('.sig-body'));
  if (TIMER) setInterval(function(){ step(performance.now()); }, 16); else requestAnimationFrame(loop);

  /* =================================================================
     1. SILVERADO — scroll scrubs the cockpit through four contexts.
     The scroll target is eased rather than snapped, and every panel
     owns a slice of the scroll with a dead zone between neighbours,
     so two panels are never readable at once.
  ================================================================== */
  function sigSilverado(host){
    var S = [
      { bg:'home', cl:'assets/hl/cluster-home.webp', ce:'assets/hl/center-home.webp', tab:'Home', kick:'Context 01 · everyday driving', h:['Six places', 'that never move.'],
        p:'The primary destinations stay fixed, so the driver never has to hunt for them while the truck is moving.' },
      { bg:'detected', cl:'assets/hl/cluster-detected.webp', ce:'assets/hl/center-detected.webp', tab:'Detected', kick:'Context 02 · trailer plugged in', h:['Notice', 'the trailer.'],
        p:'Plugging in a trailer is recognized on the home screen, with a quiet prompt to review its setup instead of a menu the driver has to find.' },
      { bg:'trailer', cl:'assets/hl/cluster-trailer.webp', ce:'assets/hl/center-trailer.webp', tab:'Checks', kick:'Context 03 · before towing', h:['Quiet what', 'has already passed.'],
        p:'Passing checks stay quiet, so the one unresolved item — the trailer brake needs adjustment — is the thing that gets attention.' },
      { bg:'tow', cl:'assets/hl/cluster-tow.webp', ce:'assets/p14-2.webp', tab:'Tow', kick:'Context 04 · ready to tow', h:['Say what', 'to do next.'],
        p:'The warning leads straight to the fix: set the trailer brake gain, then the cluster switches to tow mode for the drive.' }
    ];
    host.innerHTML = '<div class="sv"><div class="sv-stick">' +
      '<div class="sv-bg">' + S.map(function(s){ return '<img src="assets/gm/cockpit-' + s.bg + '.png" alt="" loading="lazy">'; }).join('') + '</div><div class="sv-shade"></div>' +
      '<div class="sv-screens"><figure class="sv-cluster"><figcaption>INSTRUMENT CLUSTER</figcaption>' + S.map(function(s){ return '<img src="' + s.cl + '" alt="Cluster, ' + s.tab + ' context" loading="lazy">'; }).join('') + '</figure>' +
      '<figure class="sv-center"><figcaption>CENTER DISPLAY</figcaption>' + S.map(function(s){ return '<img src="' + s.ce + '" alt="Center display, ' + s.tab + ' context" loading="lazy">'; }).join('') + '</figure></div>' +
      '<nav class="sv-dots lbl" aria-label="Driving contexts">' + S.map(function(s, i){ return '<button type="button">0' + (i + 1) + ' ' + s.tab + '</button>'; }).join('') + '</nav>' +
      S.map(function(s){ return '<div class="sv-panel"><span class="lbl">' + s.kick + '</span><h3>' + s.h[0] + '<em>' + s.h[1] + '</em></h3><p>' + s.p + '</p></div>'; }).join('') +
      '<div class="sv-meter"><i></i></div><div class="sv-foot"><span>Scroll to drive through four contexts</span><span>Figma concept · proposed behavior, not deployed capability</span></div>' +
    '</div></div>';
    var sec = $('.sv', host), bg = $('.sv-bg', host), bgs = $$('.sv-bg img', host), cls = $$('.sv-cluster img', host), ces = $$('.sv-center img', host);
    var panels = $$('.sv-panel', host), dots = $$('.sv-dots button', host), bar = $('.sv-meter i', host), figs = $$('.sv-screens figure', host);
    var CUES = [[0, 0, .19, .23], [.27, .31, .44, .48], [.52, .56, .69, .73], [.77, .81, 1.1, 1.2]];
    var shown = 0;
    dots.forEach(function(b, i){ b.addEventListener('click', function(){
      var top = sec.getBoundingClientRect().top + scrollY;
      scrollTo({ top:top + (i / 4 + .13) * (sec.offsetHeight - innerHeight), behavior:RM ? 'auto' : 'smooth' });
    }); });
    ticks.push(function(dt){
      if (!near(sec, .2)) return;
      var target = stickProgress(sec);
      shown += (target - shown) * (RM ? 1 : 1 - Math.exp(-dt * 7));
      var s = shown;
      for (var i = 0; i < 4; i++){
        var o = (i === 0 ? 1 : ramp(s, i / 4 - .035, i / 4 + .035)) * (i === 3 ? 1 : 1 - ramp(s, (i + 1) / 4 - .035, (i + 1) / 4 + .035));
        bgs[i].style.opacity = o; cls[i].style.opacity = o; ces[i].style.opacity = o;
        var cu = CUES[i], en = ramp(s, cu[0], cu[1]), lv = ramp(s, cu[2], cu[3]);
        panels[i].style.opacity = en * (1 - lv);
        panels[i].style.transform = 'translate3d(0,' + ((1 - en) * 22 - lv * 22).toFixed(1) + 'px,0)';
      }
      var act = Math.min(3, Math.floor(s * 4));
      dots.forEach(function(b, i){ b.classList.toggle('on', i === act); });
      bg.style.transform = 'scale(' + (1.02 + s * .16).toFixed(4) + ')';
      bar.style.transform = 'scaleX(' + s.toFixed(4) + ')';
      figs.forEach(function(f, i){ f.style.transform = 'rotateY(' + (-16 + s * 10).toFixed(2) + 'deg) translateY(' + ((.5 - s) * (i ? 30 : 16)).toFixed(1) + 'px)'; });
    });
  }

  /* =================================================================
     2. FABLAB — a phone modelled in CSS 3D. Each step, a scanner line
     sweeps the screen and prints the paper sketch into the real app.
  ================================================================== */
  function sigFablab(host){
    var S = [
      { h:'Find a machine', p:'Recognizable machine photos instead of model numbers — start from what you can see in the lab.', sk:'sketch-home', rl:'phone-0' },
      { h:'Check what it needs', p:'Materials, usage notes, and the safety training level it requires, before you book a slot.', sk:'sketch-detail', rl:'phone-1' },
      { h:'Arrive trained', p:'Machine-specific training status in one place, so the walk to the lab starts prepared.', sk:'sketch-training', rl:'phone-2' }
    ];
    var layers = ''; for (var i = 0; i < 10; i++) layers += '<i class="ph-layer" style="transform:translateZ(' + (5 - i) + 'px)"></i>';
    host.innerHTML = '<div class="fb"><div class="fb-stick">' +
      '<ol class="fb-steps">' + S.map(function(s, i){ return '<li><span class="lbl">Step 0' + (i + 1) + ' / 03</span><h3>' + s.h + '</h3><p>' + s.p + '</p></li>'; }).join('') + '</ol>' +
      '<div class="fb-stage"><div class="fb-glow"></div><div class="ph">' + layers +
        '<div class="ph-front"><div class="ph-screen">' + S.map(function(s, i){ return '<img class="sk" data-i="' + i + '" src="assets/fab/' + s.sk + '.webp" alt="Paper sketch: ' + s.h + '" loading="lazy"><img class="rl" data-i="' + i + '" src="assets/hl/' + s.rl + '.webp" alt="Prototype screen: ' + s.h + '" loading="lazy">'; }).join('') +
        '<i class="ph-scan"></i></div></div>' +
        '<div class="ph-tag lbl"><span>Paper</span><span>Prototype</span></div>' +
      '</div></div>' +
    '</div></div>';
    var sec = $('.fb', host), stick = $('.fb-stick', host), ph = $('.ph', host), lis = $$('.fb-steps li', host);
    var sks = $$('.sk', host), rls = $$('.rl', host), scan = $('.ph-scan', host), tags = $$('.ph-tag span', host);
    var shown = 0, px = 0, py = 0, tx = 0, ty = 0;
    stick.addEventListener('pointermove', function(e){ if (e.pointerType !== 'mouse') return; tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; });
    stick.addEventListener('pointerleave', function(){ tx = ty = 0; });
    ticks.push(function(dt){
      if (!near(sec, .2)) return;
      var target = stickProgress(sec), k = RM ? 1 : 1 - Math.exp(-dt * 7);
      shown += (target - shown) * k; px += (tx - px) * k * .6; py += (ty - py) * k * .6;
      var seg = clamp(shown * 3, 0, 2.9999), i = Math.floor(seg), local = seg - i;
      var sc = RM ? 1 : ramp(local, .16, .7);
      lis.forEach(function(li, j){ li.classList.toggle('on', j === i); li.style.setProperty('--p', j < i ? 1 : j === i ? local.toFixed(3) : 0); });
      for (var j = 0; j < 3; j++){
        var on = j === i;
        sks[j].style.opacity = on ? 1 : 0;
        rls[j].style.opacity = on ? 1 : 0;
        if (on) rls[j].style.clipPath = 'inset(0 0 ' + ((1 - sc) * 100).toFixed(2) + '% 0)';
      }
      scan.style.top = (sc * 100).toFixed(2) + '%';
      scan.style.opacity = sc > .002 && sc < .998 ? 1 : 0;
      tags[0].classList.toggle('on', sc < .5); tags[1].classList.toggle('on', sc >= .5);
      ph.style.setProperty('--ry', (-26 + shown * 40 + px * 10).toFixed(2) + 'deg');
      ph.style.setProperty('--rx', (9 - shown * 5 - py * 7).toFixed(2) + 'deg');
      ph.style.setProperty('--rz', (-3 + shown * 4).toFixed(2) + 'deg');
    });
  }

  /* =================================================================
     3. GEAR — a belt of source documents drifts left through a
     scanner. Right of the line: the paper as it arrives. At the line:
     it dissolves into dithered particles. Left: the same record as
     fields in one linked view. Hover slows it; drag scrubs with
     inertia; dragging right rebuilds a document from its fields.
  ================================================================== */
  function sigGear(host){
    var M = '<i class="mask">████</i>';
    var DOCS = [
      { n:6, card:'<div class="dk"><div class="dk-h"><b>Customer inquiry</b><span>IQ-24-117</span></div><h4>Input shaft, <em>new inquiry</em></h4><div class="grid"><div><span>Part</span>Input shaft</div><div><span>Customer</span><i class="mask">Customer name</i></div><div><span>Annual volume</span>' + M + ' pcs</div><div><span>Requested by</span>Week 32</div><div><span>Material</span>' + M + '</div><div><span>Received via</span>Sales inbox</div></div></div>',
        code:'<b>project</b>      IQ-24-117 · input shaft\n<b>status</b>       new inquiry\n<b>owner</b>        sales (direct action)\n<b>due</b>          week 32\n<b>volume</b>       ████ (masked)\n<b>source</b>       inquiry form · p.1', meta:'# view: project\n# fields: 6' },
      { n:5, card:'<div class="dk"><div class="dk-h"><b>Drawing</b><span>Rev C · sheet 1</span></div><svg viewBox="0 0 220 74" fill="none" stroke="#1b1c20" stroke-width=".8"><path d="M4 37h212" stroke-dasharray="6 3" stroke-width=".5"/><path d="M14 29h26v-6h40v-5h56v5h36v6h34v16h-34v6h-36v5H80v-5H40v-6H14z"/><path d="M80 18v38M136 18v38" stroke-width=".4"/><path d="M14 64h194M14 61v6M208 61v6" stroke-width=".5"/><text x="96" y="72" font-size="6" fill="#1b1c20" stroke="none" font-family="monospace">L ███</text><path d="M60 10h20M60 7v6M80 7v6" stroke-width=".5"/><text x="58" y="6" font-size="6" fill="#1b1c20" stroke="none" font-family="monospace">Ø ██</text><path d="M196 8l8 0-4-7z" stroke-width=".6"/><text x="198.3" y="7" font-size="4.5" fill="#1b1c20" stroke="none">C</text></svg></div>',
        code:'<b>drawing</b>      rev C (supersedes B)\n<b>features</b>     spline · 2 bearing seats\n<b>tolerance</b>    ███ (masked)\n<b>linked to</b>    IQ-24-117\n<b>source</b>       drawing · sheet 1', meta:'# view: technical\n# fields: 5' },
      { n:7, card:'<div class="dk"><div class="dk-h"><b>quote_v3.xlsx</b><span>Sheet 1</span></div><table><tr><th>Step</th><th>Unit cost</th><th>Note</th></tr><tr><td>Forging</td><td>' + M + '</td><td>supplier</td></tr><tr><td>Machining</td><td>' + M + '</td><td>2 setups</td></tr><tr><td>Heat treatment</td><td>' + M + '</td><td>capacity?</td></tr><tr><td>Grinding</td><td>' + M + '</td><td>—</td></tr><tr><td><b>Total</b></td><td>' + M + '</td><td>below target</td></tr></table></div>',
        code:'<b>cost</b>         4 line items\n<b>price</b>        ████ (masked)\n<b>margin.flag</b>  below target → review\n<b>open.q</b>       heat-treat capacity\n<b>owner</b>        sales manager\n<b>source</b>       quote v3 · rows 4–12', meta:'# view: cost\n# fields: 7' },
      { n:5, card:'<div class="dk"><div class="dk-h"><b>Kickoff notes</b><span>14 Jun</span></div><p class="note">Tech dept — heat-treat capacity tight in August. <s>fine</s> → confirm before replying.<br>Sales owns the reply to the customer.<br>Drawing rev C replaces B; check bearing seats.</p></div>',
        code:'<b>risk.time</b>    heat-treat capacity · Aug\n<b>action</b>       confirm capacity\n<b>owner</b>        technical dept\n<b>reply</b>        sales\n<b>source</b>       kickoff notes · 14 Jun', meta:'# view: actions\n# fields: 5' },
      { n:6, dark:true, card:'<div class="dk dk-dark"><div class="dk-h"><b>Risk log</b><span>IQ-24-117</span></div><table><tr><th>Risk</th><th>Kind</th><th>Level</th></tr><tr><td>Capacity in Aug</td><td>Time</td><td><i class="dot" style="background:#ff6b5b"></i>High</td></tr><tr><td>Spec change (rev C)</td><td>Condition</td><td><i class="dot" style="background:#f2c14e"></i>Medium</td></tr><tr><td>Forging lead time</td><td>Time</td><td><i class="dot" style="background:#f2c14e"></i>Medium</td></tr><tr><td>New customer terms</td><td>Condition</td><td><i class="dot" style="background:#5fd39a"></i>Low</td></tr></table></div>',
        code:'<b>risk.time</b>       ●●○ capacity, lead time\n<b>risk.condition</b>  ●○○ spec change, terms\n<b>priority</b>        #2 of 3 today\n<b>rule</b>            due soon × time risk\n<b>owner</b>           planning\n<b>source</b>          risk log · 4 rows', meta:'# view: risk\n# fields: 6' },
      { n:4, card:'<div class="dk"><div class="dk-h"><b>Email</b><span>18 Jun · 09:12</span></div><h4>Re: forging <em>lead time</em></h4><p class="note" style="font-style:normal;font-family:inherit;font-size:2.1cqw">From: supplier — Lead time for the forging moves from 4 to 6 weeks for orders placed after July 1.</p></div>',
        code:'<b>dependency</b>   forging · supplier\n<b>lead.time</b>    4 → 6 wks\n<b>impact</b>       week-32 date at risk\n<b>source</b>       email · 18 Jun', meta:'# view: supply\n# fields: 4' }
    ];
    var N = DOCS.length;
    host.innerHTML = '<div class="gb"><div class="gb-codes">' + DOCS.map(function(d){ return '<div class="gb-code"><div class="c1">' + d.code + '</div><div class="c2">' + d.meta + '</div></div>'; }).join('') + '</div>' +
      '<div class="gb-cards">' + DOCS.map(function(d){ return '<div class="gb-card"' + (d.dark ? ' style="background:#15171d"' : '') + '>' + d.card + '</div>'; }).join('') + '</div>' +
      '<canvas class="gb-fx" aria-hidden="true"></canvas><div class="gb-scan"><b></b><i></i></div>' +
      '<span class="gb-side l">Linked view</span><span class="gb-side r">Source files</span>' +
      '<div class="gb-badge"><small>Fields traced to source</small><div class="gb-pill"><span class="n">+0</span><span class="r">doc 1 / 6</span></div></div></div>' +
      '<p class="sig-note">Illustrative only: documents, codes and values are fictional. Real client data is masked.</p>';
    var belt = $('.gb', host), cards = $$('.gb-card', host), codes = $$('.gb-code', host), cv = $('.gb-fx', host), ctx = cv.getContext('2d');
    var badgeN = $('.gb-pill .n', host), badgeR = $('.gb-pill .r', host);
    var TOP = 110, W = 0, H = 0, cw = 0, ch = 0, gap = 0, span = 0, period = 0, Lx = 0, dpr = 1;
    var off = 0, vel = 0, hover = 0, hoverT = 0, dragging = false, lastX = 0, lastT = 0;
    var PAL = ['#2f6bff', '#3f7bff', '#5a92ff', '#7aa8ff', '#a9c7ff', '#d6e5ff', '#f2f7ff'];
    function measure(){
      var r = belt.getBoundingClientRect(); W = r.width; H = r.height;
      var cr = cards[0].getBoundingClientRect(); cw = cr.width; ch = cr.height; gap = cw * .1;
      span = cw + gap; period = span * N; Lx = W / 2;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      if (!off) off = W / 2 - .62 * cw;
    }
    measure(); addEventListener('resize', measure);
    function mod(a, n){ return ((a % n) + n) % n; }
    function hash(a, b, c){ var h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177) | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
    belt.addEventListener('pointerenter', function(){ hoverT = 1; });
    belt.addEventListener('pointerleave', function(){ hoverT = 0; });
    belt.addEventListener('pointerdown', function(e){ dragging = true; lastX = e.clientX; lastT = performance.now(); belt.setPointerCapture(e.pointerId); belt.classList.add('drag'); });
    belt.addEventListener('pointermove', function(e){
      if (!dragging) return;
      var now = performance.now(), dx = e.clientX - lastX;
      off += dx; vel = dx / Math.max(8, now - lastT) * 1000 * .8 + vel * .2;
      lastX = e.clientX; lastT = now;
    });
    function up(){ dragging = false; belt.classList.remove('drag'); }
    belt.addEventListener('pointerup', up); belt.addEventListener('pointercancel', up);
    belt.addEventListener('wheel', function(e){ if (Math.abs(e.deltaX) > Math.abs(e.deltaY)){ vel -= e.deltaX * 6; e.preventDefault(); } }, { passive:false });
    var sparks = [], t = 0, crossing = -1, shownN = 0;
    var auto = RM ? 0 : -.06;
    ticks.push(function(dt){
      if (!near(belt, .1)) return;
      t += dt;
      hover += (hoverT - hover) * Math.min(1, dt * 4);
      if (!dragging){ vel += (auto * innerWidth * (1 - .65 * hover) - vel) * (1 - Math.exp(-2.2 * dt)); off += vel * dt; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var cur = -1, prog = 0;
      for (var i = 0; i < N; i++){
        var x = mod(off + i * span + span, period) - span;
        var cut = clamp(Lx - x, 0, cw);
        var card = cards[i], code = codes[i];
        card.style.transform = code.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
        if (cut > 0){
          card.style.clipPath = 'inset(0 0 0 ' + cut.toFixed(1) + 'px round 0 14px 14px 0)';
          var m = 'linear-gradient(90deg,transparent ' + cut.toFixed(1) + 'px,#000 ' + (cut + 26).toFixed(1) + 'px)';
          card.style.webkitMaskImage = card.style.maskImage = m;
          code.style.visibility = 'visible';
          code.style.clipPath = 'inset(0 ' + (cw - cut).toFixed(1) + 'px 0 0)';
        } else {
          card.style.clipPath = card.style.webkitMaskImage = card.style.maskImage = '';
          code.style.visibility = 'hidden';
        }
        if (cut > 0 && cut < cw){ cur = i; prog = cut / cw; }
        if (cut > 0 && x + cw > Lx) drawFx(i, x, cut);
      }
      /* counter */
      if (cur !== crossing && cur >= 0){ crossing = cur; shownN = 0; badgeR.textContent = 'doc ' + (cur + 1) + ' / ' + N; }
      if (cur >= 0){ var target = Math.round(DOCS[cur].n * prog); shownN += (target - shownN) * Math.min(1, dt * 14); badgeN.textContent = '+' + Math.round(shownN) + ' field' + (Math.round(shownN) === 1 ? '' : 's'); }
      /* sparks */
      if (!RM) for (var s = 0; s < 3; s++) if (Math.random() < .7) sparks.push({ x:Lx + Math.random() * 30, y:TOP - 10 + Math.random() * (ch + 20),
        vx:-30 + Math.random() * 70 + vel * .6, vy:(Math.random() - .5) * 50, r:.8 + Math.random() * 1.8, c:PAL[(Math.random() * 7) | 0], life:.3 + Math.random() * .8 });
      for (var k = sparks.length - 1; k >= 0; k--){
        var sp = sparks[k]; sp.life -= dt; if (sp.life <= 0){ sparks.splice(k, 1); continue; }
        sp.x += sp.vx * dt; sp.y += sp.vy * dt;
        ctx.globalAlpha = Math.min(1, sp.life * 2.2); ctx.fillStyle = sp.c; ctx.fillRect(sp.x, sp.y, sp.r, sp.r);
      }
      ctx.globalAlpha = 1;
    });
    function drawFx(ci, x, cut){
      var hw = Math.min(150, x + cw - Lx);
      if (hw > 0){
        var g = ctx.createLinearGradient(Lx, 0, Lx + 150, 0);
        g.addColorStop(0, 'rgba(90,146,255,.4)'); g.addColorStop(1, 'rgba(90,146,255,0)');
        ctx.fillStyle = g; ctx.fillRect(Lx, TOP, hw, ch);
      }
      var R = .3 * cw, cell = 3, rows = Math.ceil(ch / cell);
      var g0 = Math.floor(cut / cell), g1 = Math.ceil((cut + R) / cell), tick9 = Math.floor(t * 9) + 97;
      for (var gx = g0; gx <= g1; gx++){
        var sx = x + gx * cell; if (sx > x + cw) break;
        var d = sx - Lx; if (d < 0 || d > R) continue;
        var pr = Math.pow(1 - d / R, 1.7);
        for (var r = -5; r < rows + 5; r++){
          var inside = r >= 0 && r < rows;
          var fade = inside ? 1 : (r < 0 ? 1 + r / 5 : 1 - (r - rows) / 5);
          var lim = inside ? pr * .92 : pr * .16 * fade;
          if (hash(gx, r, ci) >= lim) continue;
          if (!RM && hash(gx, r, tick9) < .22) continue;
          var h2 = hash(r, gx, ci + 31);
          var col = d < 10 ? PAL[4 + Math.floor(h2 * 3)] : PAL[Math.floor(h2 * h2 * 7)];
          var sz = 1.1 + h2 * 1.7;
          var jx = RM ? 0 : (hash(gx, r, tick9 + 3) - .5) * 1.6, jy = RM ? 0 : (hash(r, gx, tick9 + 5) - .5) * 1.6;
          ctx.fillStyle = col; ctx.fillRect(sx + jx, TOP + r * cell + jy, sz, sz);
        }
      }
    }
  }

  /* =================================================================
     4. NORTHERN — 45 repeat comparisons as dot pairs. Scrub from the
     first reading to the second; the counters update live.
  ================================================================== */
  function sigNorthern(host){
    var B1 = 15, B2 = 33, XMAX = 60, NP = 45;
    function stage(v){ return v < B1 ? 0 : v < B2 ? 1 : 2; }
    /* deterministic illustrative set matching the reported summary */
    var data = null, lastArr = null;
    for (var seed = 1; seed < 20000 && !data; seed++){
      var R = mulberry(seed), arr = [], sum = 0, sq = 0, ch = 0;
      for (var i = 0; i < NP; i++){
        var a = R() < .5 ? (R() < .5 ? B1 : B2) + (R() - .5) * 16 : 6 + R() * 46;
        var u = Math.max(1e-6, R()), v = R(), d = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 5.6;
        a = clamp(a, 4, 54); var b = clamp(a + d, 2, 58); d = b - a;
        arr.push({ a:a, d:d }); sum += d; if (stage(a) !== stage(b)) ch++;
      }
      var mean = sum / NP; arr.forEach(function(o){ sq += (o.d - mean) * (o.d - mean); });
      var sd = Math.sqrt(sq / (NP - 1));
      if (ch === 8 && Math.abs(mean) < .8 && sd * 1.96 > 10.3 && sd * 1.96 < 11.7) data = arr;
      lastArr = arr;
    }
    if (!data) data = lastArr;
    data.sort(function(p1, p2){ return p1.a - p2.a; });
    host.innerHTML = '<div class="nr"><div class="nr-plot"><canvas aria-label="Dot pairs for 45 repeat comparisons"></canvas><div class="nr-tip"></div></div>' +
      '<div class="nr-side"><div class="nr-stat"><strong>45</strong><small class="lbl">Repeat comparisons · 90 readings</small></div>' +
      '<div class="nr-stat"><strong class="hot" data-k="ch">0 / 45</strong><small class="lbl">Changed stage</small></div>' +
      '<div class="nr-stat"><strong data-k="mean">+0.0</strong><small class="lbl">Mean difference (points)</small></div>' +
      '<div class="nr-stat"><strong data-k="loa">±0.0</strong><small class="lbl">Limits of agreement</small></div>' +
      '<div class="nr-ctrl"><div class="lbl"><span>Round 1</span><span>Round 2</span></div><input type="range" min="0" max="1000" value="0" aria-label="Move from reading round one to round two"><button type="button" class="lbl">▶ Read it again</button></div></div></div>' +
      '<p class="sig-note">Illustrative layout generated to match the study’s reported summary — 45 comparisons, 8 stage changes, mean difference under one point, limits about ±11. Not the raw readings. One reader; not clinical validation.</p>';
    var plot = $('.nr-plot', host), cv = $('canvas', plot), ctx = cv.getContext('2d'), tip = $('.nr-tip', host);
    var range = $('input', host), btn = $('button', host);
    var kCh = $('[data-k=ch]', host), kMean = $('[data-k=mean]', host), kLoa = $('[data-k=loa]', host);
    var tval = 0, playing = false, playT0 = 0, started = false, W = 0, H = 0, dpr = 1, hoverRow = -1, dirty = true;
    var PADL = 18, PADR = 18, PADT = 44, PADB = 28;
    function size(){ var r = plot.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; dirty = true; }
    size(); addEventListener('resize', size);
    function X(v){ return PADL + v / XMAX * (W - PADL - PADR); }
    function Y(i){ return PADT + (i + .5) / NP * (H - PADT - PADB); }
    var accent = c.accent;
    function draw(){
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      /* stage bands */
      ctx.fillStyle = 'rgba(255,255,255,.025)'; ctx.fillRect(X(B1), PADT - 10, X(B2) - X(B1), H - PADT - PADB + 20);
      ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.textBaseline = 'middle';
      for (var v = 0; v <= XMAX; v += 10){ ctx.fillStyle = 'rgba(232,238,248,.35)'; ctx.fillText(String(v), X(v) - 6, 16); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(X(v), PADT - 10, 1, H - PADT - PADB + 20); }
      [B1, B2].forEach(function(b){
        ctx.strokeStyle = 'rgba(232,238,248,.45)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(b) + .5, PADT - 14); ctx.lineTo(X(b) + .5, H - PADB + 10); ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.fillStyle = 'rgba(232,238,248,.55)'; ctx.fillText('STAGE BOUNDARY', X(B1) + 6, PADT - 22); ctx.fillText('STAGE BOUNDARY', X(B2) + 6, PADT - 22);
      var ch = 0, sum = 0, sq = 0;
      data.forEach(function(o){ sum += o.d * tval; });
      var mean = sum / NP;
      data.forEach(function(o, i){
        var b = o.a + o.d * tval, moved = stage(o.a) !== stage(b), y = Y(i);
        if (moved) ch++;
        sq += (o.d * tval - mean) * (o.d * tval - mean);
        ctx.strokeStyle = moved ? accent : 'rgba(232,238,248,.35)'; ctx.lineWidth = moved ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(X(o.a), y); ctx.lineTo(X(b), y); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,238,248,.6)'; ctx.beginPath(); ctx.arc(X(o.a), y, 3, 0, 6.283); ctx.stroke();
        ctx.fillStyle = moved ? accent : '#e8edf6'; ctx.beginPath(); ctx.arc(X(b), y, moved ? 4 : 3, 0, 6.283); ctx.fill();
        if (moved){ ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(b), y, 10, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
        if (i === hoverRow){ ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(PADL, y - 5, W - PADL - PADR, 10); }
      });
      var sd = Math.sqrt(sq / (NP - 1));
      kCh.textContent = ch + ' / 45';
      kMean.textContent = (mean >= 0 ? '+' : '−') + Math.abs(mean).toFixed(1);
      kLoa.textContent = '±' + (sd * 1.96).toFixed(1);
      ctx.fillStyle = 'rgba(232,238,248,.4)'; ctx.fillText('○ ROUND 1   ● ROUND 2   (READING, %)', PADL, H - 12);
    }
    function play(){ playing = true; playT0 = performance.now(); tval = 0; }
    btn.addEventListener('click', play);
    range.addEventListener('input', function(){ playing = false; tval = range.value / 1000; dirty = true; });
    plot.addEventListener('pointermove', function(e){
      var r = plot.getBoundingClientRect(), y = e.clientY - r.top;
      var i = Math.round((y - PADT) / (H - PADT - PADB) * NP - .5);
      if (i < 0 || i >= NP){ hoverRow = -1; tip.style.opacity = 0; dirty = true; return; }
      hoverRow = i; dirty = true;
      var o = data[i], b = o.a + o.d;
      tip.innerHTML = 'Round 1 ' + o.a.toFixed(1) + ' · Round 2 ' + b.toFixed(1) + '<br>Δ ' + (o.d >= 0 ? '+' : '−') + Math.abs(o.d).toFixed(1) + ' · ' + (stage(o.a) !== stage(b) ? 'changed stage' : 'same stage');
      tip.style.left = Math.min(W - 220, e.clientX - r.left + 14) + 'px'; tip.style.top = (y + 12) + 'px'; tip.style.opacity = 1;
    });
    plot.addEventListener('pointerleave', function(){ hoverRow = -1; tip.style.opacity = 0; dirty = true; });
    ticks.push(function(){
      if (!near(plot, .1)) return;
      if (!started){ var r = plot.getBoundingClientRect(); if (r.top < innerHeight * .7){ started = true; if (RM){ tval = 1; dirty = true; } else play(); } }
      if (playing){ var k = clamp((performance.now() - playT0) / 2600, 0, 1); tval = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; range.value = Math.round(tval * 1000); dirty = true; if (k >= 1) playing = false; }
      if (dirty){ draw(); dirty = false; }
    });
  }

  /* =================================================================
     5. OXYLUS — a playhead scrubbed by scroll sweeps one synthetic run.
     Each signal's onset is marked as it is passed; the badge counts
     the hours left before the outcome.
  ================================================================== */
  function sigOxylus(host){
    var T = 100, NS = 600;
    var SIG = [
      { name:'Signal A', onset:71, kind:'rise' },
      { name:'Signal B', onset:58, kind:'drift' },
      { name:'Signal C', onset:86, kind:'spike' }
    ];
    var R = mulberry(7);
    SIG.forEach(function(s, si){
      var arr = [], w = 0;
      for (var i = 0; i <= NS; i++){
        var tt = i / NS * T; w = w * .92 + (R() - .5) * .9;
        var base = Math.sin(tt * .21 + si * 2) * .12 + w * .18;
        var k = Math.max(0, tt - s.onset) / (T - s.onset);
        var dev = s.kind === 'rise' ? k * k * 1.3 : s.kind === 'drift' ? -k * 1.1 : (k > 0 ? Math.sin(tt * 2.6) * k * .9 + k * .3 : 0);
        arr.push(base + dev);
      }
      s.v = arr;
    });
    var order = SIG.slice().sort(function(a, b){ return a.onset - b.onset; });
    host.innerHTML = '<div class="ox"><div class="ox-stick"><div class="ox-plot"><canvas aria-label="Three synthetic signals over one run"></canvas><div class="ox-badge"><span class="n">t − 100 h</span><span class="r">to outcome</span></div></div>' +
      '<div class="ox-side"><span class="lbl">Event order</span><ol class="ox-list">' +
      order.map(function(s){ return '<li><b>' + s.name + ' shifts</b><small>t − ' + (T - s.onset) + ' h before outcome</small></li>'; }).join('') +
      '<li><b>Outcome</b><small>end of run</small></li></ol>' +
      '<p>Synthetic, normalized signals generated in the browser. Event order shows a sequence, not a cause.</p></div></div></div>';
    var sec = $('.ox', host), plot = $('.ox-plot', host), cv = $('canvas', plot), ctx = cv.getContext('2d'), badge = $('.ox-badge', host), bn = $('.ox-badge .n', host), lis = $$('.ox-list li', host);
    var W = 0, H = 0, dpr = 1, shown = 0, accent = c.accent;
    function size(){ var r = plot.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; }
    size(); addEventListener('resize', size);
    var PL = 16, PR = 16, PT = 30, PB = 40;
    function X(tt){ return PL + tt / T * (W - PL - PR); }
    ticks.push(function(dt){
      if (!near(sec, .2)) return;
      if (!W) size();
      var target = ramp(stickProgress(sec), .04, .9);
      shown += (target - shown) * (RM ? 1 : 1 - Math.exp(-dt * 6));
      var ph = shown * T, xh = X(ph);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var laneH = (H - PT - PB) / 3;
      ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.textBaseline = 'middle';
      for (var g = 0; g <= 10; g++){ ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(X(g * 10), PT - 8, 1, H - PT - PB + 8); }
      SIG.forEach(function(s, si){
        var y0 = PT + laneH * si + laneH / 2, amp = laneH * .32;
        ctx.fillStyle = 'rgba(232,238,248,.45)'; ctx.fillText(s.name.toUpperCase(), PL + 6, PT + laneH * si + 12);
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(PL, PT + laneH * (si + 1), W - PL - PR, 1);
        for (var pass = 0; pass < 2; pass++){
          ctx.beginPath();
          var lim = pass ? Math.round(ph / T * NS) : NS;
          for (var i = 0; i <= lim; i++){ var x = X(i / NS * T), y = y0 - s.v[i] * amp; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
          ctx.strokeStyle = pass ? (ph > s.onset ? accent : '#e8edf6') : 'rgba(232,238,248,.14)';
          ctx.lineWidth = pass ? 1.6 : 1; ctx.stroke();
        }
        if (ph >= s.onset){
          var ox = X(s.onset);
          ctx.strokeStyle = accent; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(ox + .5, PT + laneH * si + 6); ctx.lineTo(ox + .5, PT + laneH * (si + 1) - 6); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(ox, y0 - s.v[Math.round(s.onset / T * NS)] * amp, 4.5, 0, 6.283); ctx.fill();
          ctx.fillText('MOVED · t − ' + (T - s.onset) + ' h', ox + 8, PT + laneH * si + 12);
        }
      });
      /* outcome marker and the gap before it */
      ctx.strokeStyle = 'rgba(232,238,248,.5)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(T) - .5, PT - 8); ctx.lineTo(X(T) - .5, H - PB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(232,238,248,.6)'; ctx.textAlign = 'right'; ctx.fillText('OUTCOME', X(T) - 6, H - PB + 16); ctx.textAlign = 'left';
      var first = order[0].onset;
      if (ph > first){
        var gx0 = X(first), gx1 = X(Math.min(ph, T)), gy = H - PB + 16;
        ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(gx0, gy - 5); ctx.lineTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.stroke();
        ctx.fillStyle = accent; ctx.fillText('FIRST SHIFT', gx0 - 76, gy);
      }
      /* playhead */
      var grad = ctx.createLinearGradient(xh - 40, 0, xh, 0); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, accent);
      ctx.globalAlpha = .18; ctx.fillStyle = grad; ctx.fillRect(xh - 40, PT - 8, 40, H - PT - PB + 8); ctx.globalAlpha = 1;
      ctx.shadowColor = accent; ctx.shadowBlur = 14; ctx.fillStyle = accent; ctx.fillRect(xh - 1.5, PT - 8, 3, H - PT - PB + 8); ctx.shadowBlur = 0;
      badge.style.left = clamp(xh, 90, W - 90) + 'px';
      bn.textContent = 't − ' + Math.max(0, T - ph).toFixed(0) + ' h';
      order.forEach(function(s, i){ lis[i].classList.toggle('on', ph >= s.onset); });
      lis[3].classList.toggle('on', ph >= T - .5);
    });
  }
})();
