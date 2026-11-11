(function(){
  "use strict";
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function $(s, el){ return (el || document).querySelector(s); }
  function $$(s, el){ return [].slice.call((el || document).querySelectorAll(s)); }

  /* ---------------------------------------------------------------
     CONTENT — one chapter per project; each has its own particle form
  ---------------------------------------------------------------- */
  var CHAPTERS = [
    { id:'intro', name:'INTRO', shape:0, accent:'#b9a7ff',
      eyebrow:'UX research · product design · prototyping',
      h:['Research, interface', 'and the code between.'],
      p:'I work where the evidence is messy and the interface has to be clear — from manufacturing systems and dental measurement studies to an in-vehicle cockpit.',
      cta:['Selected work', 'classic.html#highlights'], cta2:['Email me', 'mailto:luciala@umich.edu'] },
    { id:'silverado', name:'SILVERADO', shape:1, accent:'#ffb36b',
      eyebrow:'01 / Silverado RST 1500 · Automotive HMI', cat:'AUTOMOTIVE HMI',
      h:['Step inside', 'the cockpit.'],
      p:'A context-aware truck interface concept, designed with Ashita Nichanametla. The cluster and center display follow the driver through a guided towing flow.',
      cta:['Open case study', 'work.html?id=silverado'], cta2:['Try the prototype', 'demos/gm.html'],
      img:'assets/hl/center-trailer.webp',
      stats:[['5','driving contexts'],['2','screens linked'],['GM','leadership review']] },
    { id:'fablab', name:'FABLAB', shape:2, accent:'#7fe0c3',
      eyebrow:'02 / FABLab · Service & mobile UX', cat:'SERVICE + MOBILE',
      h:['Design the', 'moment before.'],
      p:'A calmer preparation journey for a university fabrication lab: find a machine, check what it requires, and arrive with training done.',
      cta:['Try the prototype', 'demos/fablab.html'], cta2:['Case study', 'work.html?id=fablab'],
      img:'assets/hl/phone-0.webp',
      stats:[['3','preparation steps'],['QOC','decision framework'],['1','mobile prototype']] },
    { id:'gear', name:'GEAR', shape:3, accent:'#9cc3ff',
      eyebrow:'03 / Zhongqing Gear · Enterprise UX', cat:'ENTERPRISE UX',
      h:['One decision.', 'Eight views.'],
      p:'A research-led dashboard where priorities, risk, and evidence stay linked to the selected project. Client codes and specifications are masked.',
      cta:['Open case study', 'work.html?id=gear'], cta2:['Try the prototype', 'demos/gear.html'],
      img:'assets/hl/gear-portfolio.webp',
      stats:[['8','linked views'],['4','stakeholder interviews'],['3','test sessions']] },
    { id:'northern', name:'NORTHERN', shape:4, accent:'#f2dcc0',
      eyebrow:'04 / Northern · UX research', cat:'UX RESEARCH',
      h:['Question the', 'measurement.'],
      p:'90 blinded readings. The averages held steady, and 8 of 45 repeat comparisons still changed stage. A research demonstration, not clinical validation.',
      cta:['Open case study', 'work.html?id=northern'], cta2:['Try the tool', 'demos/northern.html'],
      img:'assets/p19-0.webp',
      stats:[['90','blinded readings'],['15','teeth'],['8/45','changed stage']] },
    { id:'oxylus', name:'OXYLUS', shape:5, accent:'#ff7a59',
      eyebrow:'05 / Oxylus Energy · Data & systems', cat:'DATA + SYSTEMS',
      h:['See the sequence,', 'not just the result.'],
      p:'330 synthetic runs you can rotate, filter, and open: which signal moved first, and how long before the outcome.',
      cta:['Open case study', 'work.html?id=oxylus'], cta2:['Try the explorer', 'demos/oxylus.html'],
      img:null,
      stats:[['330','synthetic runs'],['7','linked views'],['0','company data']] }
  ];
  var TOTAL = CHAPTERS.length - 1;

  /* build the rail */
  var rail = $('.index');
  CHAPTERS.forEach(function(c, i){
    var li = document.createElement('li');
    li.innerHTML = '<button class="lbl" type="button"><span class="num">' + (i < 10 ? '0' : '') + i + '</span><span class="t">' + c.name + '</span></button>';
    rail.appendChild(li);
  });

  /* ---------------------------------------------------------------
     DECODE LABELS — resolve left-to-right behind a band of letters
  ---------------------------------------------------------------- */
  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', DUR = 400;
  function labels(){ return $$('.t'); }
  function reserveOne(el){ el.style.width = ''; el.style.width = Math.ceil(el.getBoundingClientRect().width * 100) / 100 + 'px'; }
  function reserve(){ var ls = labels(); ls.forEach(function(el){ if (!el.dataset.text) el.dataset.text = el.textContent; el.textContent = el.dataset.text; el.style.width = ''; });
    var w = ls.map(function(el){ return el.getBoundingClientRect().width; });
    ls.forEach(function(el, i){ el.style.width = Math.ceil(w[i] * 100) / 100 + 'px'; }); }
  function settle(el){
    if (el._raf){ cancelAnimationFrame(el._raf); el._raf = 0; }
    if (el._t){ clearTimeout(el._t); el._t = 0; }
    if (el.dataset.text != null) el.textContent = el.dataset.text;
  }
  function decode(el){
    if (!el.dataset.text) el.dataset.text = el.textContent;
    settle(el);
    if (RM) return;
    var text = el.dataset.text, n = text.length, t0 = performance.now(), last = 0, rand = [];
    function roll(){ for (var i = 0; i < n; i++) rand[i] = CH.charAt((Math.random() * 26) | 0); }
    roll();
    function step(now){
      var p = Math.min(1, (now - t0) / DUR), front = p * n, out = '';
      if (now - last > 45){ roll(); last = now; }
      for (var i = 0; i < n; i++){
        var c = text.charAt(i);
        if (i < front) out += c;
        else if (i < front + 3.6) out += (c === ' ' ? ' ' : rand[i]);
        else break;
      }
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(step); else settle(el);
    }
    el._raf = requestAnimationFrame(step);
    el._t = setTimeout(function(){ settle(el); }, DUR + 500);
  }
  document.addEventListener('pointerover', function(e){
    var a = e.target.closest && e.target.closest('a, button');
    if (!a || a.contains(e.relatedTarget)) return;
    var t = a.querySelector('.t'); if (t) decode(t);
  });

  /* ---------------------------------------------------------------
     CHAPTER UI
  ---------------------------------------------------------------- */
  var hero = $('.hero'), eyebrow = $('.eyebrow'), h1a = $('.h1a'), h1b = $('.h1b'), blurb = $('.blurb');
  var cta = $('.cta'), ctaT = $('.cta .t'), cta2 = $('.cta-2'), cta2T = $('.cta-2 .t');
  var card = $('.card'), thumb = $('.thumb'), img = $('.thumb img'), stats = $('.stats');
  var count = $('.card-count'), cat = $('.card-cat');
  var current = -1, swapT = 0, cardT = 0;

  function setLabel(el, txt){ el.dataset.text = txt.toUpperCase(); el.textContent = el.dataset.text; reserveOne(el); }
  function fillCopy(c){
    eyebrow.textContent = c.eyebrow;
    h1a.textContent = c.h[0];
    h1b.textContent = c.h[1];
    blurb.textContent = c.p;
    cta.href = c.cta[1]; setLabel(ctaT, c.cta[0]);
    if (c.cta2){ cta2.hidden = false; cta2.href = c.cta2[1]; setLabel(cta2T, c.cta2[0]); } else cta2.hidden = true;
  }
  function fillCard(c, i){
    if (!c.stats){ card.classList.add('off'); return; }
    count.textContent = (i < 10 ? '0' : '') + i + ' / 0' + TOTAL;
    cat.textContent = c.cat;
    stats.innerHTML = c.stats.map(function(s){ return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');
    thumb.classList.toggle('empty', !c.img);
    if (c.img){ img.src = c.img; img.alt = c.name + ' project preview'; }
    card.classList.remove('off');
  }

  function go(i, fromUser){
    i = Math.max(0, Math.min(TOTAL, i));
    if (i === current) return;
    var first = current < 0;
    current = i;
    var c = CHAPTERS[i];
    $$('.index li').forEach(function(li, k){
      li.classList.toggle('on', k === i);
      var b = li.querySelector('button');
      if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    root.style.setProperty('--accent', c.accent);
    if (fromUser){ var lt = $$('.index li')[i].querySelector('.t'); decode(lt); }
    try { history.replaceState(null, '', i ? '#' + c.id : location.pathname + location.search); } catch(e){}
    if (field) field.morph(c.shape, c.accent, !first);

    if (first){ fillCopy(c); fillCard(c, i); return; }
    clearTimeout(swapT); clearTimeout(cardT);
    hero.classList.add('swapping');
    card.classList.add('swap'); thumb.classList.add('swap');
    swapT = setTimeout(function(){
      fillCopy(c);
      void hero.offsetWidth;
      hero.classList.remove('swapping');
      decode(ctaT); if (!cta2.hidden) decode(cta2T);
    }, RM ? 0 : 500);
    cardT = setTimeout(function(){
      fillCard(c, i);
      card.classList.remove('swap');
      var done = function(){ thumb.classList.remove('swap'); };
      if (!c.img || img.complete) requestAnimationFrame(done); else { img.onload = done; img.onerror = done; }
    }, RM ? 0 : 380);
  }

  $$('.index button').forEach(function(b, i){ b.addEventListener('click', function(){ go(i, true); }); });
  $('.scroll').addEventListener('click', function(){ go(current >= TOTAL ? 0 : current + 1, true); });

  /* wheel, keys and swipe step through chapters */
  var lockUntil = 0;
  function stepBy(d){
    var now = performance.now();
    if (now < lockUntil) return;
    lockUntil = now + 1000;
    go(current + d, true);
  }
  addEventListener('wheel', function(e){ if (Math.abs(e.deltaY) > 14) stepBy(e.deltaY > 0 ? 1 : -1); }, { passive:true });
  addEventListener('keydown', function(e){
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); stepBy(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); stepBy(-1); }
  });
  var ty0 = null;
  addEventListener('touchstart', function(e){ ty0 = e.touches[0].clientY; }, { passive:true });
  addEventListener('touchend', function(e){
    if (ty0 == null) return;
    var dy = ty0 - e.changedTouches[0].clientY; ty0 = null;
    if (Math.abs(dy) > 50) stepBy(dy > 0 ? 1 : -1);
  }, { passive:true });


  var field = null;
  try { field = window.LLField.create({ canvas:$('#field') }); root.dataset.gl = 'ok'; }
  catch (err){ root.dataset.gl = 'fail'; if (window.console) console.warn('Particle field disabled:', err); }

  /* ---------------------------------------------------------------
     BOOT
  ---------------------------------------------------------------- */
  var startId = (location.hash || '').slice(1);
  var startIdx = 0;
  CHAPTERS.forEach(function(c, i){ if (c.id === startId) startIdx = i; });
  go(startIdx, false);

  function boot(){
    reserve();
    if (RM) return;
    function at(sel, t0, step){ $$(sel).forEach(function(el, i){ setTimeout(function(){ decode(el); }, t0 + i * (step || 0)); }); }
    at('.enter .t', 330); at('.talk-pill .t', 390); at('.links .t', 360, 45);
    at('.index li.on .t', 660); at('.index li:not(.on) .t', 720, 55);
    at('.cta .t', 900); at('.cta-2 .t', 960); at('.dock .t', 1000, 60);
    setTimeout(function(){ root.classList.remove('anim'); }, 2200);
    setTimeout(function(){ labels().forEach(settle); }, 2600);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else addEventListener('load', boot);
  var rt;
  addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(reserve, 160); });
})();
