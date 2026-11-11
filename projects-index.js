(function(){
  "use strict";
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function $(s, el){ return (el || document).querySelector(s); }
  function $$(s, el){ return [].slice.call((el || document).querySelectorAll(s)); }

  /* same order, accents and particle forms as the home page and case studies */
  var ORDER = ['silverado', 'fablab', 'gear', 'northern', 'oxylus'];
  var LOOK = {
    silverado:{ shape:1, accent:'#ffb36b', img:'assets/hl/center-trailer.webp', title:'The right signal. At the right moment.' },
    fablab:{ shape:2, accent:'#7fe0c3', img:'assets/hl/phone-0.webp', title:'Design the moment before.' },
    gear:{ shape:3, accent:'#9cc3ff', img:'assets/hl/gear-portfolio.webp', title:'Clarity across complexity.' },
    northern:{ shape:4, accent:'#f2dcc0', img:'assets/p19-0.webp', title:'Question the measurement.' },
    oxylus:{ shape:5, accent:'#ff7a59', img:null, title:'See the sequence, not just the result.' }
  };
  var BASE = { shape:0, accent:'#b9a7ff' };

  /* Oxylus has no screenshot in the public set: draw its signals instead */
  function signalArt(){
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300"><rect width="480" height="300" fill="#0b0e15"/>';
    for (var g = 0; g <= 10; g++) s += '<line x1="' + (24 + g * 43) + '" y1="20" x2="' + (24 + g * 43) + '" y2="280" stroke="#ffffff" stroke-opacity=".06"/>';
    [[70, 300, .9], [150, 250, -.8], [230, 360, .7]].forEach(function(l, i){
      var d = '';
      for (var x = 24; x <= 456; x += 6){ var k = Math.max(0, x - l[1]) / (456 - l[1]); var y = l[0] + Math.sin(x / 23 + i * 2) * 8 - l[2] * k * k * 60; d += (x === 24 ? 'M' : 'L') + x + ' ' + y.toFixed(1); }
      s += '<path d="' + d + '" fill="none" stroke="' + (i === 1 ? '#ff7a59' : '#e8edf6') + '" stroke-width="2"/><circle cx="' + l[1] + '" cy="' + (l[0] + Math.sin(l[1] / 23 + i * 2) * 8).toFixed(1) + '" r="5" fill="#ff7a59"/>';
    });
    s += '<line x1="456" y1="20" x2="456" y2="280" stroke="#e8edf6" stroke-dasharray="4 5" stroke-opacity=".6"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  var ALL = typeof projects !== 'undefined' ? projects : [];
  var list = ORDER.map(function(id){ var p = ALL.filter(function(x){ return x.id === id; })[0]; var l = LOOK[id]; return p && { p:p, l:l, img:l.img || signalArt() }; }).filter(Boolean);

  var host = $('#list');
  host.innerHTML = list.map(function(o, i){
    var p = o.p;
    return '<a class="pj-row" href="work.html?id=' + p.id + '" data-i="' + i + '" data-f="' + p.filter + '" style="--c:' + o.l.accent + '">' +
      '<span class="no">0' + (i + 1) + '</span>' +
      '<span class="main"><span class="thumb-m" style="background-image:url(&quot;' + o.img + '&quot;)"><i>0' + (i + 1) + ' / ' + p.year + '</i></span>' +
        '<span class="nm">' + p.name + '</span><span class="tl">' + o.l.title + '</span>' +
        '<span class="tags lbl">' + p.tags.map(function(t){ return '<span>' + t + '</span>'; }).join('') + '</span></span>' +
      '<span class="ct lbl"><b>' + p.category + '</b>' + p.role + '</span>' +
      '<span class="yr lbl">' + p.year + '</span>' +
      '<span class="ar" aria-hidden="true">↗</span></a>';
  }).join('');
  var rows = $$('.pj-row', host);

  /* particle form behind the page; it becomes the hovered project's form */
  var field = null;
  try {
    field = window.LLField.create({ canvas:$('.pj-field'), shape:BASE.shape, accent:BASE.accent, size:[140, 320],
      layout:function(hw, hh, portrait){
        return portrait ? { scale:Math.min(hw * .8 / .72, hh * .3 / .72), x:0, y:hh * .45 }
                        : { scale:Math.min(1.25, hh * .66 / .72, hw * .34 / .72), x:hw * .52, y:hh * .08 };
      } });
  } catch (err){ if (window.console) console.warn('Particle field disabled:', err); }
  var current = -1, backT = 0;
  function focus(i){
    clearTimeout(backT);
    if (i === current) return;
    current = i;
    var l = i < 0 ? BASE : list[i].l;
    root.style.setProperty('--accent', l.accent);
    if (field) field.morph(l.shape, l.accent, i >= 0);
  }

  /* hover: dim the others, show a preview that trails the cursor */
  var peek = $('.pj-peek'), pkImg = $('.pk-img'), pkMeta = $('.pk-meta');
  var mx = -999, my = -999, px = -999, py = -999, showing = false;
  rows.forEach(function(r, i){
    r.addEventListener('pointerenter', function(e){
      if (host.classList.contains('grid') || e.pointerType !== 'mouse'){ focus(i); return; }
      rows.forEach(function(x){ x.classList.toggle('hot', x === r); });
      host.classList.add('dim');
      pkImg.style.backgroundImage = 'url("' + list[i].img + '")';
      pkMeta.innerHTML = list[i].p.metrics.map(function(m){ return '<div><b>' + m[0] + '</b><span>' + m[1] + '</span></div>'; }).join('');
      if (!showing){ px = e.clientX; py = e.clientY; }
      peek.classList.add('on'); showing = true;
      focus(i);
    });
    r.addEventListener('focus', function(){ focus(i); });
  });
  host.addEventListener('pointerleave', function(){
    rows.forEach(function(x){ x.classList.remove('hot'); });
    host.classList.remove('dim'); peek.classList.remove('on'); showing = false;
    backT = setTimeout(function(){ focus(-1); }, 900);
  });
  addEventListener('pointermove', function(e){ mx = e.clientX; my = e.clientY; }, { passive:true });
  (function follow(){
    px += (mx - px) * (RM ? 1 : .14); py += (my - py) * (RM ? 1 : .14);
    if (showing){
      var w = peek.offsetWidth, x = px + 28, y = py - peek.offsetHeight / 2;
      if (x + w > innerWidth - 16) x = px - w - 28;
      y = Math.max(80, Math.min(innerHeight - peek.offsetHeight - 16, y));
      peek.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }
    requestAnimationFrame(follow);
  })();

  /* filters and layout */
  var status = $('.pj-status');
  $$('.pj-filters button').forEach(function(b){
    b.addEventListener('click', function(){
      $$('.pj-filters button').forEach(function(x){ x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.dataset.f, n = 0;
      rows.forEach(function(r){ var show = f === 'all' || r.dataset.f.indexOf(f) >= 0; r.hidden = !show; if (show) n++; });
      status.textContent = n + ' of ' + rows.length + ' projects';
    });
  });
  $$('.pj-views button').forEach(function(b){
    b.addEventListener('click', function(){
      $$('.pj-views button').forEach(function(x){ x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      host.classList.toggle('grid', b.dataset.v === 'grid');
      peek.classList.remove('on'); showing = false; host.classList.remove('dim');
    });
  });

  /* rows settle in on load, staggered */
  rows.forEach(function(r, i){ r.style.animationDelay = (600 + i * 80) + 'ms'; });
  var meter = $('.w-meter');
  addEventListener('scroll', function(){
    var max = document.documentElement.scrollHeight - innerHeight;
    meter.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
  }, { passive:true });
})();
