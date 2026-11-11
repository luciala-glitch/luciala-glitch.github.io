/* Silverado cockpit — the team's Figma concept rebuilt as a live, clickable
   HTML/SVG cockpit: driver display, center display, steering-wheel controls
   (option 2 layout) and the physical button bar. Scroll moves through six
   driving contexts; anything can also be operated by hand.
   window.LLCockpit(host, { ticks, stickProgress, near, RM }) */
(function(){
  "use strict";

  var IC = {
    pin:'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 8a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
    wifi:'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
    bt:'M7 7l10 10-5 4V3l5 4L7 17',
    grid:'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
    sun:'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5',
    bat:'M3 8h15v8H3zM21 11v2M5 10h9v4H5z',
    fan:'M12 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M12 10.5C11 7 12 3 15 3s3 4-1.5 7.5M13.5 12c3.5-1 7.5 0 7.5 3s-4 3-7.5-1.5M12 13.5c1 3.5 0 7.5-3 7.5s-3-4 1.5-7.5M10.5 12C7 13 3 12 3 9s4-3 7.5 1.5',
    car:'M4 16v-4l2-5h12l2 5v4zM4 16v2h3v-2M17 16v2h3v-2M7.5 13h.01M16.5 13h.01M6 12h12',
    map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
    home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    music:'M9 18V5l11-2v13M6 15a3 3 0 1 0 0 6a3 3 0 1 0 0-6M17 13a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
    cam:'M3 8h4l2-3h6l2 3h4v11H3zM12 9.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7',
    phone:'M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
    info:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 11v6M12 7.5h.01',
    gear:'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
    lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
    unlock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 7.5-2',
    cloud:'M7 18h10a4 4 0 0 0 0-8a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z',
    prev:'M18 6v12L9 12zM6 6v12', next:'M6 6v12l9-6zM18 6v12', pause:'M9 6v12M15 6v12', play:'M8 5v14l11-7z',
    shuf:'M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3',
    rep:'M4 12V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 12v3a3 3 0 0 1-3 3H4M7 21l-3-3 3-3',
    minus:'M5 12h14', plus:'M12 5v14M5 12h14',
    target:'M12 5a7 7 0 1 0 0 14a7 7 0 1 0 0-14M12 2v4M12 18v4M2 12h4M18 12h4',
    layers:'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    turn:'M6 21V12a4 4 0 0 1 4-4h8M14 4l4 4-4 4',
    warn:'M12 3l10 18H2zM12 10v5M12 18h.01',
    ok:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M8 12l3 3 5-6',
    seat:'M9 3c-1.5 4-1.5 9 0 12h6l2 6M9 15l-2 6M8 9h4',
    seatheat:'M9 3c-1.5 4-1.5 9 0 12h6l2 6M9 15l-2 6M15 3c-1 1.5 1 2.5 0 4M18 3c-1 1.5 1 2.5 0 4',
    defF:'M3 18c2-9 16-9 18 0zM9 9c-1 2 1 3 0 5M12 8c-1 2 1 3 0 5M15 9c-1 2 1 3 0 5',
    defR:'M4 6h16v12H4zM9 9c-1 2 1 3 0 5M12 9c-1 2 1 3 0 5M15 9c-1 2 1 3 0 5',
    haz:'M12 3l9.5 17h-19zM12 9l4.5 8h-9z',
    recirc:'M4 14c0-5 4-8 9-8h5M15 3l3 3-3 3M20 10c0 5-4 8-9 8H6M9 21l-3-3 3-3',
    power:'M12 3v8M6.5 6.5a8 8 0 1 0 11 0',
    mic:'M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3',
    wheel:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3.5 12h6l2.5 2.5 2.5-2.5h6M12 14.5V21',
    wind:'M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8',
    truck:'M2 15v-4l2-3h6v3h8l3 2v2zM6 17.5a1.6 1.6 0 1 0 0 .1M17 17.5a1.6 1.6 0 1 0 0 .1',
    trailer:'M1 14v-3l1.5-2.5H7v2.5h3M10 9h11v6H10zM4.5 16.5a1.4 1.4 0 1 0 0 .1M15.5 16.5a1.4 1.4 0 1 0 0 .1M7 14h3',
    offroad:'M2 15v-4l2-3h6v3h8l3 2v2zM6 17.5a1.6 1.6 0 1 0 0 .1M17 17.5a1.6 1.6 0 1 0 0 .1M4 6l3-3 3 3 2-2 3 3',
    eco:'M2 16v-4l2-3h6v3h8l3 2v2zM6 18.5a1.6 1.6 0 1 0 0 .1M17 18.5a1.6 1.6 0 1 0 0 .1M14 7c0-3 3-4 6-4 0 3-1 6-5 6',
    ventF:'M4 12h6M4 8h4M4 16h4M14 6c3 2 3 10 0 12M18 9c1.5 1 1.5 5 0 6',
    ventD:'M8 4c-1 4-1 8 2 11l3 6M5 18h6M15 8l4 4-4 4',
    hang:'M3 14c5-5 13-5 18 0l-2 3-4-1v-3a12 12 0 0 0-6 0v3l-4 1z',
    back:'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
    cross:'M12 6v12M6 12h12',
    rest:'M4 11h11v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM15 12h2a2 2 0 0 1 0 4h-2M17 3a4 4 0 1 1 0 .01M17 4.5V6l1 1',
    wc:'M7 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M17 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M5 9h4l.5 5H8v6H6v-6H4.5zM15 9h4l1.5 7H19v4h-4v-4h-1.5zM12 3v18',
    food:'M6 3v7a2 2 0 0 0 4 0V3M8 3v18M15 3c-2 2-2 7 0 9v9M15 3c2 2 2 7 0 9',
    fuel:'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16zM4 11h10M14 9h3l2 2v7a1.5 1.5 0 0 1-3 0v-3h-2',
    ev:'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16zM9 6l-2 4h4l-2 4M14 9h3l2 2v7a1.5 1.5 0 0 1-3 0v-3h-2',
    paw:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9 14c0-2 1.5-3 3-3s3 1 3 3-1.5 2.5-3 2.5-3-.5-3-2.5M8.5 9.5h.01M11 8h.01M13 8h.01M15.5 9.5h.01',
    nopaw:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9 14c0-2 1.5-3 3-3s3 1 3 3-1.5 2.5-3 2.5-3-.5-3-2.5M8.5 9.5h.01M11 8h.01M13 8h.01M15.5 9.5h.01M5.6 5.6l12.8 12.8',
    chev:'M9 6l6 6-6 6',
    snow:'M12 2v20M4 7l16 10M20 7L4 17M9 3l3 3 3-3M9 21l3-3 3 3',
    tent:'M12 4L3 20h18zM12 4v16M9 20l3-6 3 6',
    case:'M3 8h18v12H3zM8 8V5h8v3M3 13h18',
    mount:'M3 20l6-11 4 6 2-3 6 8z',
    bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
    bed:'M3 18V8M21 18v-6a3 3 0 0 0-3-3H10v6M3 15h18M6 12h1',
    speak:'M4 9h4l5-4v14l-5-4H4zM17 8l2-2M17 12h3M17 16l2 2'
  };
  function I(n, cls){ return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + IC[n] + '"/></svg>'; }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function ramp(p, a, b){ if (b <= a) return p >= b ? 1 : 0; return smooth(clamp((p - a) / (b - a), 0, 1)); }
  function rng(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* ---------------- static art, built once ---------------- */
  function gaugeSVG(){
    var s = '<svg class="cl-gauge" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="ckBlue" x1="0" x2="1"><stop offset="0" stop-color="#3b6fe0"/><stop offset="1" stop-color="#9dbdf6"/></linearGradient></defs>';
    var cx = 110, cy = 110, N = 54;
    for (var k = 0; k <= N; k++){
      var t = k / N, a = (135 + 270 * t) * Math.PI / 180, major = k % 6 === 0;
      var r1 = 96, r2 = major ? 80 : 86;
      var col = t < .34 ? 'url(#ckBlue)' : t > .78 ? '#e0524f' : '#e8ecf3';
      s += '<line data-t="' + t.toFixed(3) + '" x1="' + (cx + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (cx + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(a)).toFixed(1) + '" stroke="' + col + '" stroke-width="' + (major ? 2.6 : 2) + '"/>';
      if (major){ var rl = 68; s += '<text x="' + (cx + rl * Math.cos(a)).toFixed(1) + '" y="' + (cy + rl * Math.sin(a) + 3).toFixed(1) + '" fill="#cfd6e2" font-size="9" text-anchor="middle" font-family="Nunito Sans,sans-serif">' + (k / 6) + '</text>'; }
    }
    return s + '</svg>';
  }
  function scaleSVG(kind){
    var s = '<svg class="cl-scale ' + kind + '" viewBox="0 0 150 18" aria-hidden="true"><g stroke="#aeb7c6" stroke-width=".8">';
    for (var i = 0; i <= 40; i++){ var x = 14 + i * 3.3; s += '<line x1="' + x + '" y1="' + (i % 5 ? 13 : 10) + '" x2="' + x + '" y2="16"' + ((kind === 't' && i > 30) || (kind === 'f' && i > 36) ? ' stroke="#e0524f"' : '') + '/>'; }
    s += '</g>';
    if (kind === 't') s += '<text x="14" y="7" font-size="6" fill="#5a8dee">140</text><text x="72" y="7" font-size="6" fill="#cfd6e2">250</text><text x="125" y="7" font-size="6" fill="#e0524f">360</text><path d="M78 18l3-4 3 4z" fill="#e7ecf4"/>';
    else s += '<text x="2" y="16" font-size="9" fill="#e7ecf4">F</text><text x="146" y="16" font-size="9" fill="#e0524f" text-anchor="end">E</text><path d="M58 18l3-4 3 4z" fill="#e7ecf4"/>';
    return s + '</svg>';
  }
  var CITY = (function(){
    var R = rng(11), W = 640, H = 420, s = '<svg class="city" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="' + W + '" height="' + H + '" fill="#2a2f37"/>';
    var xs = [0, 90, 190, 270, 380, 470, 560, 640], ys = [0, 70, 150, 230, 300, 380, 420];
    for (var i = 0; i < xs.length - 1; i++) for (var j = 0; j < ys.length - 1; j++){
      var x0 = xs[i] + 8, x1 = xs[i + 1] - 8, y0 = ys[j] + 8, y1 = ys[j + 1] - 8;
      if (i === 4 && j === 2){ s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="#2d4537"/>'; continue; }
      for (var b = 0; b < 7; b++){ var bw = 12 + R() * 22, bh = 10 + R() * 18, bx = x0 + R() * Math.max(1, x1 - x0 - bw), by = y0 + R() * Math.max(1, y1 - y0 - bh);
        s += '<rect x="' + bx.toFixed(0) + '" y="' + by.toFixed(0) + '" width="' + bw.toFixed(0) + '" height="' + bh.toFixed(0) + '" fill="#3a404a" stroke="#2f343c"/>'; }
    }
    s += '<g stroke="#4b525d" stroke-width="5">';
    xs.forEach(function(x){ s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>'; });
    ys.forEach(function(y){ s += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>'; });
    s += '</g><g fill="#c9d0db" font-size="11" font-family="Nunito Sans,sans-serif"><text x="420" y="64">W Huron St</text><text x="420" y="144">W Washington St</text><text x="470" y="224">W Liberty St</text><text x="400" y="294">W Jefferson St</text>' +
      '<text transform="translate(282 150) rotate(90)">S 7th St</text></g>';
    s += '<line x1="276" y1="0" x2="276" y2="' + H + '" stroke="#3d7bff" stroke-width="9" opacity=".35"/><line x1="276" y1="0" x2="276" y2="' + H + '" stroke="#4f8cff" stroke-width="5"/>';
    return s + '</svg>';
  })();
  function camSVG(kind){
    var s = '<svg viewBox="0 0 160 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ckSky' + kind + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd5dc"/><stop offset="1" stop-color="#a3abb5"/></linearGradient></defs>' +
      '<rect width="160" height="70" fill="url(#ckSky' + kind + ')"/><rect y="62" width="160" height="10" fill="#7d8b6e"/><polygon points="-40,180 200,180 104,64 56,64" fill="#5a5e65"/>';
    s += '<g stroke="#f1f3f6" stroke-width="2.4" stroke-dasharray="10 12"><line x1="80" y1="66" x2="40" y2="180"/><line x1="80" y1="66" x2="122" y2="180"/></g>';
    if (kind === 'L' || kind === 'R'){
      var m = kind === 'R' ? 'transform="translate(160 0) scale(-1 1)"' : '';
      s += '<g ' + m + '><path d="M-6 120 L40 96 L80 100 L86 150 L-6 168z" fill="#71767e"/><path d="M8 112 L40 99 L64 101 L66 118 L8 124z" fill="#3b3f46"/><circle cx="20" cy="164" r="12" fill="#222"/>' +
        '<path d="M126 70 L160 60 L160 180 L120 180z" fill="#e9ebee"/><path d="M130 86 L156 78 L156 120 L132 124z" fill="#b8bdc4"/></g>';
    } else if (kind === 'H'){
      s += '<g stroke="#2a2c30" stroke-width="3" fill="none"><path d="M40 70 L120 70 L132 150 L28 150z"/><line x1="80" y1="150" x2="80" y2="178"/><path d="M50 90 L110 90M46 110 L114 110M42 130 L118 130"/></g>' +
        '<g stroke="#3a3c40" stroke-width="2" fill="none"><circle cx="62" cy="96" r="13"/><circle cx="96" cy="96" r="13"/><path d="M62 96 L80 84 L96 96"/></g><path d="M70 160 L90 160 L86 178 L74 178z" fill="#9aa0a8"/><rect x="0" y="170" width="160" height="10" fill="#2d3035"/>';
    } else {
      s += '<path d="M66 96 L94 96 L98 120 L62 120z" fill="#8a9099"/><path d="M69 99 L91 99 L92 108 L68 108z" fill="#3b3f46"/><rect x="0" y="166" width="160" height="14" fill="#2d3035"/><path d="M30 166 L48 150 L112 150 L130 166" stroke="#2d3035" stroke-width="4" fill="none"/>';
    }
    return s + '</svg>';
  }
  function laneSVG(kind){
    var s = '<svg viewBox="0 0 282 368" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="282" height="368" fill="#23272f"/>';
    var lanes = [30, 80, 130, 180, 230];
    s += '<rect x="' + lanes[2] + '" y="0" width="50" height="368" fill="#3d7bff" opacity=".22"/><line x1="130" y1="0" x2="130" y2="368" stroke="#4f8cff" stroke-width="2.5"/><line x1="180" y1="0" x2="180" y2="368" stroke="#4f8cff" stroke-width="2.5"/>';
    s += '<g stroke="#9aa3b0" stroke-width="1.4" stroke-dasharray="12 14">';
    [80, 230].forEach(function(x){ s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="368"/>'; });
    s += '</g><line x1="30" y1="0" x2="30" y2="368" stroke="#c9d0db" stroke-width="2"/><line x1="280" y1="0" x2="280" y2="368" stroke="#c9d0db" stroke-width="2"/>';
    var R = rng(kind === 'wind' ? 5 : 3);
    function car(x, y, c, w, h){ w = w || 22; h = h || 38; return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="6" fill="' + (c || '#5d636e') + '"/><rect x="' + (-w / 2 + 3) + '" y="' + (-h / 2 + 7) + '" width="' + (w - 6) + '" height="9" rx="2" fill="#2c3038"/></g>'; }
    [[55, 40], [55, 150], [55, 290], [105, 90], [105, 230], [205, 60], [205, 200], [255, 120], [255, 300], [155, 40]].forEach(function(p){ s += car(p[0], p[1] + R() * 20); });
    s += car(155, 210, '#eef1f5', 26, 52);
    if (kind === 'siren'){
      s += '<g transform="translate(155 320)"><rect x="-13" y="-24" width="26" height="48" rx="5" fill="#f4f6f8"/><path d="M-5 0h10M0 -5v10" stroke="#e0524f" stroke-width="3"/>' +
        '<rect class="siren-l" x="-12" y="-26" width="10" height="5" rx="2" fill="#ff3b3b"/><rect class="siren-r" x="2" y="-26" width="10" height="5" rx="2" fill="#3b7bff"/><circle class="siren-l" cx="0" cy="-24" r="22" fill="#3b7bff" opacity=".18"/></g>';
      s += '<path class="dash-arrow" d="M160 182 C160 140 205 136 205 70" stroke="#8fb3ff" stroke-width="2.5" fill="none"/><path d="M198 74 L205 60 L212 74z" fill="#8fb3ff"/>';
    } else {
      s += '<g class="wind" stroke="#9ed2ff" stroke-width="1.6" fill="none" opacity=".85">';
      for (var i = 0; i < 9; i++){ var y = 20 + i * 38; s += '<path style="animation-delay:-' + (i * .27).toFixed(2) + 's" d="M-10 ' + y + ' C 80 ' + (y - 20) + ', 160 ' + (y + 26) + ', 300 ' + (y - 10) + '"/>'; }
      s += '</g>';
    }
    return s + '</svg>';
  }
  function wavesSVG(){
    var s = '<svg class="waves" viewBox="0 0 640 392" preserveAspectRatio="none" aria-hidden="true">';
    for (var i = 0; i < 18; i++){
      var d = 'M0 ' + (240 + i * 2), k = i / 18;
      for (var x = 0; x <= 640; x += 16){ d += ' L' + x + ' ' + (220 + Math.sin(x / 70 + i * .25) * (40 + i * 2) + Math.sin(x / 23 + i) * 6 + i * 2).toFixed(1); }
      s += '<path d="' + d + '" fill="none" stroke="' + (k < .5 ? '#2fd1c5' : '#8a5cff') + '" stroke-width="1" opacity="' + (.15 + k * .35).toFixed(2) + '"/>';
    }
    return s + '</svg>';
  }
  function truckTop(mode){
    var dots = { cabin:[[42, 70], [58, 70], [42, 95], [58, 95], [50, 82]], outside:[[38, 150], [62, 150], [50, 168]], front:[[40, 52], [60, 52]], rear:[[40, 118], [60, 118], [50, 150]] }[mode] || [];
    var s = '<svg viewBox="0 0 100 190" aria-hidden="true"><defs><radialGradient id="ckGlow"><stop offset="0" stop-color="#8a5cff" stop-opacity=".55"/><stop offset="1" stop-color="#8a5cff" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="50" cy="' + (mode === 'outside' ? 150 : mode === 'front' ? 60 : mode === 'rear' ? 130 : 85) + '" rx="46" ry="46" fill="url(#ckGlow)"/>' +
      '<g fill="none" stroke="#c9d0db" stroke-width="1.2"><rect x="24" y="10" width="52" height="170" rx="14"/><path d="M28 40h44M30 60h40M28 108h44M30 112v64M70 112v64M24 30l-6 4M76 30l6 4"/><rect x="34" y="64" width="12" height="16" rx="3"/><rect x="54" y="64" width="12" height="16" rx="3"/><rect x="34" y="86" width="32" height="14" rx="3"/></g>';
    dots.forEach(function(d){ s += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="3.2" fill="#6ea0ff"/><circle cx="' + d[0] + '" cy="' + d[1] + '" r="6" fill="none" stroke="#6ea0ff" opacity=".5"/>'; });
    return s + '</svg>';
  }
  function chassisSVG(h){
    return '<svg viewBox="0 0 120 240" style="height:' + h + 'px" aria-hidden="true"><g fill="none" stroke="#c9d0db" stroke-width="1.3"><rect x="22" y="8" width="76" height="224" rx="16"/><path d="M60 40v170M34 52h52M34 186h52"/><rect x="48" y="80" width="24" height="40" rx="4"/></g>' +
      '<g stroke="#6ea0ff" stroke-width="2.4"><path d="M60 46v150M30 52h60M30 186h60"/></g>' +
      '<g fill="#d8dde5"><rect x="12" y="34" width="16" height="36" rx="5"/><rect x="92" y="34" width="16" height="36" rx="5"/><rect x="12" y="168" width="16" height="36" rx="5"/><rect x="92" y="168" width="16" height="36" rx="5"/></g></svg>';
  }
  function wheelSVG(){
    return '<svg class="wheel" viewBox="0 0 460 460" aria-hidden="true"><defs>' +
      '<radialGradient id="ckHub" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2b2e34"/><stop offset="1" stop-color="#121316"/></radialGradient>' +
      '<linearGradient id="ckRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2f35"/><stop offset=".5" stop-color="#16181c"/><stop offset="1" stop-color="#0d0e10"/></linearGradient>' +
      '<pattern id="ckTex" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="6" height="6" fill="#1a1c20"/><rect width="3" height="6" fill="#202328"/></pattern></defs>' +
      '<circle cx="230" cy="230" r="200" fill="none" stroke="url(#ckRim)" stroke-width="40"/><circle cx="230" cy="230" r="219" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>' +
      '<path d="M44 196 C90 170 150 168 180 178 L180 262 C150 280 110 286 70 300 C56 270 46 236 44 196z" fill="url(#ckTex)" stroke="#2c2f35"/>' +
      '<path d="M416 196 C370 170 310 168 280 178 L280 262 C310 280 350 286 390 300 C404 270 414 236 416 196z" fill="url(#ckTex)" stroke="#2c2f35"/>' +
      '<path d="M70 300 C110 330 150 360 190 372 L270 372 C310 360 350 330 390 300" fill="none" stroke="#17191d" stroke-width="22"/>' +
      '<rect x="160" y="160" width="140" height="150" rx="34" fill="url(#ckHub)" stroke="#2f3238"/>' +
      '<g transform="translate(230 232) scale(1.25)" fill="#1d1f24" stroke="#4a4e56" stroke-width="1.4"><path d="M-46 -8 L-16 -8 L-12 -17 L12 -17 L16 -8 L46 -8 L40 8 L16 8 L12 17 L-12 17 L-16 8 L-40 8 Z"/></g>' +
      '<rect x="222" y="372" width="16" height="70" fill="#121316"/><circle cx="230" cy="18" r="4" fill="#ff3b3b"/></svg>';
  }


  /* ---------------- Silverado Mobile Companion ----------------
     The phone app from the same concept. What you press here is
     mirrored in the cockpit above (lock state, climate, hazard,
     drive mode, outside speakers). */
  function truckTopSVG(){
    return '<svg class="co-truck" viewBox="0 0 120 270" aria-hidden="true"><defs>' +
      '<linearGradient id="coBody" x1="0" x2="1"><stop offset="0" stop-color="#c9ced4"/><stop offset=".5" stop-color="#f4f6f8"/><stop offset="1" stop-color="#c9ced4"/></linearGradient>' +
      '<radialGradient id="coHead"><stop offset="0" stop-color="#bfe9ff" stop-opacity=".9"/><stop offset="1" stop-color="#bfe9ff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="coBed"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient></defs>' +
      '<g class="co-head"><ellipse cx="38" cy="4" rx="26" ry="22" fill="url(#coHead)"/><ellipse cx="82" cy="4" rx="26" ry="22" fill="url(#coHead)"/></g>' +
      '<ellipse cx="60" cy="140" rx="58" ry="132" fill="#000" opacity=".35"/>' +
      '<path d="M26 26 C26 12 40 8 60 8 C80 8 94 12 94 26 L98 128 L22 128z" fill="url(#coBody)"/>' +
      '<path d="M30 30 C34 22 86 22 90 30 L86 44 L34 44z" fill="#e4e8ec" stroke="#b9bfc6" stroke-width=".6"/>' +
      '<path d="M32 50 C40 46 80 46 88 50 L86 66 L34 66z" fill="#6f7882"/>' +
      '<rect x="34" y="68" width="52" height="44" rx="6" fill="#dfe3e7"/><path d="M34 112 L86 112 L88 124 L32 124z" fill="#7d8690"/>' +
      '<path d="M20 60 L12 58 L12 66 L20 68z M100 60 L108 58 L108 66 L100 68z" fill="#d7dbe0"/>' +
      '<rect x="20" y="130" width="80" height="112" rx="4" fill="url(#coBody)"/><rect x="28" y="136" width="64" height="100" rx="2" fill="#cdd2d8"/>' +
      '<g stroke="#bfc5cc" stroke-width="1.2">' + [150, 166, 182, 198, 214].map(function(y){ return '<line x1="30" y1="' + y + '" x2="90" y2="' + y + '"/>'; }).join('') + '</g>' +
      '<ellipse class="co-bedlight" cx="60" cy="186" rx="34" ry="52" fill="url(#coBed)"/>' +
      '<rect class="co-gate" x="22" y="240" width="76" height="9" rx="2" fill="#e6e9ec" stroke="#b9bfc6" stroke-width=".6"/>' +
      '<g class="co-flash"><rect x="14" y="4" width="92" height="250" rx="24" fill="none" stroke="#ffb36b" stroke-width="4"/></g></svg>';
  }
  window.LLCompanion = function(host, ck){
    var st = { locked:true, running:false, climate:false, panic:false, gate:false, head:true, bed:false, mode:'Normal' };
    var MODES = [['Tow Mode', 'trailer'], ['Off-Road', 'mount'], ['Winter', 'snow'], ['Camping', 'tent'], ['Work', 'case']];
    var DOCK = [['head', 'bulb', 'Head Lights'], ['bed', 'bed', 'Bed Lights'], ['gate', 'truck', 'Tailgate'], ['speak', 'speak', 'Speakers'], ['cam', 'cam', 'Camera']];
    var stars = ''; var R = rng(9); for (var i = 0; i < 34; i++) stars += '<i style="left:' + (R() * 100).toFixed(1) + '%;top:' + (R() * 100).toFixed(1) + '%;opacity:' + (.3 + R() * .6).toFixed(2) + '"></i>';
    host.innerHTML = '<section class="co"><div class="co-copy">' +
        '<span class="lbl">Off the road · mobile companion</span><h3>The truck, <em>in your pocket.</em></h3>' +
        '<p>The same truck from a phone: lock state, fuel, drive mode and range at a glance; unlock, remote start, climate and panic arranged around the truck itself; quick modes for towing, off-road, winter, camping and work.</p>' +
        '<p class="co-try">Try it — what you press on the phone reaches the cockpit above.</p><p class="co-sync lbl"><i></i><span>Linked to the cockpit</span></p></div>' +
      '<div class="co-phone"><div class="co-scr"><div class="co-app">' +
        '<div class="co-stars">' + stars + '</div><div class="co-arc"></div>' +
        '<div class="co-time"><span>9:41</span><span class="co-island"></span><span>' + I('wifi') + I('bat') + '</span></div>' +
        '<svg class="co-bowtie" viewBox="-50 -20 100 40" aria-hidden="true"><defs><linearGradient id="coGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe38a"/><stop offset=".5" stop-color="#d9a92c"/><stop offset="1" stop-color="#a87814"/></linearGradient></defs><path d="M-46 -8 L-16 -8 L-12 -17 L12 -17 L16 -8 L46 -8 L40 8 L16 8 L12 17 L-12 17 L-16 8 L-40 8 Z" fill="url(#coGold)" stroke="#e8e8e8" stroke-width="2.4"/></svg>' +
        '<h4>Silverado RST 1500</h4><p class="co-brand">CHEVROLET</p>' +
        '<div class="co-chips"><span data-c="lock"></span><span>' + I('fuel') + '78%</span><span data-c="mode"></span><span>' + I('ev') + '312 mi</span></div>' +
        '<div class="co-stage">' + truckTopSVG() +
          '<button class="co-act" data-a="locked" style="left:22px;top:6px"></button>' +
          '<button class="co-act" data-a="running" style="right:22px;top:6px"></button>' +
          '<button class="co-act" data-a="climate" style="left:16px;top:150px"></button>' +
          '<button class="co-act" data-a="panic" style="right:16px;top:144px"></button>' +
          '<button class="co-act" data-a="gate" style="left:50%;margin-left:-40px;top:232px"></button></div>' +
        '<p class="co-upd">Last updated 2 min ago<br><a>Vehicle parked at: 1200 S Main St</a></p>' +
        '<h5>Quick Modes</h5><div class="co-modes">' + MODES.map(function(m){ return '<button data-m="' + m[0] + '">' + I(m[1]) + '<span>' + m[0] + '</span></button>'; }).join('') + '</div>' +
        '<div class="co-dock">' + DOCK.map(function(d){ return '<button data-d="' + d[0] + '">' + I(d[1]) + '<span>' + d[2] + '</span></button>'; }).join('') + '</div>' +
        '<div class="co-sheet"><div class="co-sheet-h"><b>Rear camera</b><button data-d="camclose">Done</button></div><div class="cam">' + camSVG('H') + '<span>HITCH</span></div></div>' +
        '<div class="co-toast"></div>' +
      '</div></div></div></section>';
    var app = host.querySelector('.co-app'), toastEl = host.querySelector('.co-toast'), sync = host.querySelector('.co-sync span'), syncDot = host.querySelector('.co-sync'), tT = 0, sT = 0;
    function say(txt){ toastEl.textContent = txt; toastEl.classList.add('on'); clearTimeout(tT); tT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
    function synced(txt){ if (!ck) return; sync.textContent = 'Cockpit: ' + txt; syncDot.classList.add('on'); clearTimeout(sT); sT = setTimeout(function(){ syncDot.classList.remove('on'); }, 2200); }
    var ACT = { locked:[['unlock', 'Unlock'], ['lock', 'Lock']], running:[['play', 'Remote Start'], ['power', 'Stop Engine']], climate:[['wind', 'Climate Start'], ['wind', 'Climate On']], panic:[['warn', 'Panic'], ['warn', 'Stop Panic']], gate:[['truck', 'Tailgate'], ['truck', 'Close Tailgate']] };
    function render(){
      host.querySelector('[data-c=lock]').innerHTML = I(st.locked ? 'lock' : 'unlock') + (st.locked ? 'Locked' : 'Unlocked');
      host.querySelector('[data-c=mode]').innerHTML = '<svg class="i" viewBox="0 0 24 24" style="color:#5fd39a"><path d="M4 16a8 8 0 0 1 16 0M12 16l4-5"/></svg>' + st.mode;
      [].forEach.call(host.querySelectorAll('.co-act'), function(b){
        var k = b.dataset.a, on = k === 'locked' ? !st.locked : st[k], a = ACT[k][on ? 1 : 0];
        b.innerHTML = '<span class="ring">' + I(a[0]) + '</span><span class="t">' + a[1] + '</span>';
        b.classList.toggle('on', !!on); b.classList.toggle('bad', k === 'panic' && st.panic);
      });
      [].forEach.call(host.querySelectorAll('.co-modes button'), function(b){ b.classList.toggle('on', b.dataset.m === st.mode); });
      [].forEach.call(host.querySelectorAll('.co-dock button'), function(b){ var d = b.dataset.d; b.classList.toggle('on', d === 'head' ? st.head : d === 'bed' ? st.bed : d === 'gate' ? st.gate : d === 'speak' ? !!st.speak : false); });
      app.classList.toggle('head-on', st.head); app.classList.toggle('bed-on', st.bed); app.classList.toggle('gate-open', st.gate); app.classList.toggle('panic-on', st.panic);
    }
    host.addEventListener('click', function(e){
      var b = e.target.closest('[data-a],[data-m],[data-d]'); if (!b) return;
      var d = b.dataset;
      if (d.a){
        if (d.a === 'locked'){ st.locked = !st.locked; say(st.locked ? 'Doors locked' : 'Doors unlocked');
          if (ck) ck.update(function(c){ c.locked = st.locked; c.screen = 'home'; c.popup = null; }); synced(st.locked ? 'doors locked' : 'doors unlocked'); }
        else if (d.a === 'running'){ st.running = !st.running; say(st.running ? 'Engine started · 10 min' : 'Engine off'); synced(st.running ? 'remote start' : 'engine off'); if (ck) ck.toast(I('power') + (st.running ? 'Remote start from phone' : 'Engine off')); }
        else if (d.a === 'climate'){ st.climate = !st.climate; say(st.climate ? 'Cabin to 72°' : 'Climate off');
          if (ck) ck.update(function(c){ c.off = !st.climate; if (st.climate){ c.fan = 4; c.tl = 72; c.tr = 72; c.ac = true; } c.screen = 'climate'; }); synced(st.climate ? 'climate on, 72°' : 'climate off'); }
        else if (d.a === 'panic'){ st.panic = !st.panic; say(st.panic ? 'Panic alarm on' : 'Panic alarm off');
          if (ck) ck.update(function(c){ c.hazard = st.panic; }); synced(st.panic ? 'hazard lights flashing' : 'hazard off'); }
        else if (d.a === 'gate'){ st.gate = !st.gate; say(st.gate ? 'Tailgate open' : 'Tailgate closed');
          if (ck && st.gate) ck.update(function(c){ c.screen = 'music'; if (c.sound !== 'outside') c.popup = 'tailgate'; }); synced(st.gate ? 'tailgate open — Outside Mode suggested' : 'tailgate closed'); }
      } else if (d.m){
        st.mode = st.mode === d.m ? 'Normal' : d.m; say(st.mode === 'Normal' ? 'Normal mode' : st.mode + ' on');
        if (ck && (d.m === 'Tow Mode' || d.m === 'Off-Road' || st.mode === 'Normal')) ck.update(function(c){
          var m = st.mode === 'Tow Mode' ? 'Tow' : st.mode === 'Off-Road' ? 'Off-Road' : 'Normal';
          c.drive = m; c.mode = m === 'Tow' ? 'TOW MODE' : m; c.left = m === 'Tow' ? 'trailer' : null; c.screen = 'drive'; });
        if (d.m === 'Tow Mode' || d.m === 'Off-Road' || st.mode === 'Normal') synced(st.mode === 'Tow Mode' ? 'tow mode' : st.mode === 'Off-Road' ? 'off-road mode' : 'normal mode');
      } else if (d.d){
        if (d.d === 'head'){ st.head = !st.head; say('Head lights ' + (st.head ? 'on' : 'off')); }
        else if (d.d === 'bed'){ st.bed = !st.bed; say('Bed lights ' + (st.bed ? 'on' : 'off')); }
        else if (d.d === 'gate'){ st.gate = !st.gate; say(st.gate ? 'Tailgate open' : 'Tailgate closed');
          if (ck && st.gate) ck.update(function(c){ c.screen = 'music'; if (c.sound !== 'outside') c.popup = 'tailgate'; }); synced(st.gate ? 'tailgate open — Outside Mode suggested' : 'tailgate closed'); }
        else if (d.d === 'speak'){ st.speak = !st.speak; say('Outside speakers ' + (st.speak ? 'on' : 'off'));
          if (ck) ck.update(function(c){ c.sound = st.speak ? 'outside' : 'cabin'; c.screen = 'music'; }); synced(st.speak ? 'outside speakers' : 'cabin audio'); }
        else if (d.d === 'cam'){ app.classList.add('sheet-on'); }
        else if (d.d === 'camclose'){ app.classList.remove('sheet-on'); }
      }
      render();
    });
    var scr = host.querySelector('.co-scr');
    function fit(){ app.style.transform = 'scale(' + (scr.clientWidth / 390).toFixed(4) + ')'; }
    fit(); addEventListener('resize', fit);
    render();
  };

  /* ---------------- mount ---------------- */
  window.LLCockpit = function(host, api){
    var RM = api.RM;
    var CTX = [
      { tab:'Hitch up', kick:'01 · Before the drive', h:['A trailer,', 'recognized.'],
        p:'Mark connects the trailer. The towing interface comes up on its own — connection status, tire pressure, tow mode — so he can check everything and go.',
        set:{ screen:'drive', left:'trailer', right:'nav', mode:'TOW MODE', gear:'P', speed:0, chip:null, milestone:false, popup:null, panel:null, drive:'Tow', trailerCard:true } },
      { tab:'Head out', kick:'02 · During the drive', h:['Six places', 'that never move.'],
        p:'Navigation to the lake house, music for the family. The same six destinations sit in the bottom bar on every screen, so nothing has to be hunted for while moving.',
        set:{ screen:'music', left:'trailer', right:'nav', mode:'TOW MODE', gear:'D', speed:62, chip:null, popup:null, panel:null, trailerCard:false } },
      { tab:'Siren', kick:'03 · A siren behind', h:['Say what', 'to do next.'],
        p:'The family is talking and music is playing — a siren is easy to miss. The alert names the action: pull over to the right shoulder when safe, with the cameras showing the lanes beside the trailer.',
        set:{ screen:'camera', left:'power', right:'emergency', mode:'TOW MODE', gear:'D', speed:78, chip:null, popup:null } },
      { tab:'Crosswind', kick:'04 · Crosswind', h:['Explain', 'the assist.'],
        p:'A strong gust: the cluster warns, and the center display shows which systems are helping — chassis control and steering assist — instead of acting silently.',
        set:{ screen:'stability', left:'power', right:'nav', mode:'TOW MODE', gear:'D', speed:78, chip:'wind', popup:null } },
      { tab:'Fatigue', kick:'05 · Signs of fatigue', h:['Show the cost', 'of a rest.'],
        p:'Later in the trip, signs of fatigue. Instead of only continuing the route, the system offers a recovery route to a rest area with fuel five minutes ahead, and states the detour up front: +3 min.',
        set:{ screen:'map', nav:'huron', left:'trailer', right:'nav', mode:'TOW MODE', gear:'D', speed:60, chip:null, popup:'recovery', panel:null } },
      { tab:'Lake house', kick:'06 · Arriving at the lake house', h:['Take the music', 'outside.'],
        p:'Parked, the family unloads bikes and gear. With the tailgate open, the system suggests Outside Mode so the music plays for the activity by the lake.',
        set:{ screen:'music', left:'psi', right:'trip', mode:'Normal', gear:'P', speed:0, chip:null, milestone:false, popup:'tailgate', panel:null, sound:'cabin' } }
    ];
    var st = { nav:'exit', screen:'home', left:null, right:'nav', mode:'Normal', gear:'D', speed:62, chip:null, milestone:false, popup:null, panel:null, stop:-1,
      drive:'Normal', wd:'AUTO', trailerCard:false, lane:true, acc:true, hazard:false, view:0, vol:14, muted:false, playing:true, sound:'cabin', locked:true,
      fan:3, ac:true, auto:false, off:false, recirc:false, fdef:false, rdef:false, seatL:false, seatR:false, tl:72, tr:75 };
    var shownSpeed = st.speed, ctx = -1, lastScreen = '', toastT = 0;

    host.innerHTML = '<div class="ck"><div class="ck-stick">' +
      '<div class="ck-head"><div class="ck-copy">' + CTX.map(function(c){ return '<div class="ck-panel"><span class="lbl">' + c.kick + '</span><h3>' + c.h[0] + ' <em>' + c.h[1] + '</em></h3><p>' + c.p + '</p></div>'; }).join('') + '</div>' +
      '<nav class="ck-tabs lbl" aria-label="Driving contexts">' + CTX.map(function(c, i){ return '<button type="button">0' + (i + 1) + ' ' + c.tab + '</button>'; }).join('') + '</nav></div>' +
      '<div class="ck-area"><div class="ck-canvas">' +
        '<svg class="ck-dash" viewBox="0 0 1240 520" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ckDash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f2b"/><stop offset="1" stop-color="#05070b" stop-opacity="0"/></linearGradient></defs><path d="M0 120 C300 40 900 40 1240 110 L1240 520 L0 520z" fill="url(#ckDash)"/><path d="M0 120 C300 40 900 40 1240 110" fill="none" stroke="rgba(255,255,255,.08)"/></svg>' +
        '<div class="cl"><div class="cl-in"></div></div>' +
        '<div class="sw">' + wheelSVG() +
          '<button class="sw-ctl" data-w="acc" style="left:68px;top:194px;width:37px;height:26px;border-radius:6px 4px 4px 10px">ACC</button>' +
          '<button class="sw-ctl sw-roll" data-w="view" style="left:110px;top:186px;width:20px;height:40px" aria-label="Drive mode and view scroll"></button>' +
          '<button class="sw-ctl" data-w="lane" style="left:135px;top:194px;width:37px;height:26px;border-radius:4px">LANE</button>' +
          '<button class="sw-ctl" data-w="home" style="left:248px;top:194px;width:37px;height:26px;border-radius:4px">' + I('home') + '</button>' +
          '<button class="sw-ctl sw-roll" data-w="vol" style="left:290px;top:186px;width:20px;height:40px" aria-label="Volume roller"></button>' +
          '<button class="sw-ctl" data-w="voice" style="left:316px;top:194px;width:37px;height:26px;border-radius:4px 6px 10px 4px">' + I('mic') + '</button>' +
          '<div class="sw-tip"></div></div>' +
        '<div class="cd"><div class="cd-in"><div class="cd-status"></div><div class="cd-body"></div><nav class="cd-nav"></nav><div class="cd-toast"></div></div></div>' +
        '<div class="pb"></div>' +
        '<p class="ck-hint">Try it — tap the screen, the buttons below it, or the wheel controls</p>' +
      '</div></div>' +
      '<div class="ck-foot"><i class="ck-meter"></i><span>Scroll to ride along with Mark · six moments</span><span>Figma concept by Lucia Liao &amp; Ashita Nichanametla, rebuilt in code · proposed behavior, not deployed capability</span></div>' +
    '</div></div>';

    var sec = host.querySelector('.ck'), area = host.querySelector('.ck-area'), canvas = host.querySelector('.ck-canvas');
    var panels = [].slice.call(host.querySelectorAll('.ck-panel')), tabs = [].slice.call(host.querySelectorAll('.ck-tabs button')), meter = host.querySelector('.ck-meter');
    var clIn = host.querySelector('.cl-in'), cd = host.querySelector('.cd-in'), cdBody = host.querySelector('.cd-body'), cdNav = host.querySelector('.cd-nav'), cdStatus = host.querySelector('.cd-status'), toast = host.querySelector('.cd-toast');
    var pb = host.querySelector('.pb'), tip = host.querySelector('.sw-tip');

    /* ---------- driver display ---------- */
    clIn.innerHTML = '<svg class="cl-curve" viewBox="0 0 720 270" aria-hidden="true"><path d="M0 226 C200 226 250 206 360 206 C470 206 520 226 720 226" fill="none" stroke="rgba(255,255,255,.22)"/><path d="M0 150 C120 150 200 160 250 200M720 150 C600 150 520 160 470 200" fill="none" stroke="rgba(255,255,255,.05)"/></svg>' +
      gaugeSVG() + '<div class="cl-speed"><span>62</span><small>mph</small></div><div class="cl-gear">D</div>' +
      '<div class="cl-limit">SPEED<br>LIMIT<b>70</b></div><div class="cl-lane">' + I('car') + '</div>' +
      '<div class="cl-acc">' + I('car') + '<span>85</span></div>' +
      '<div class="cl-follow"><i class="car"></i><i></i><i></i><i></i><i></i><i class="car"></i></div>' +
      '<div class="cl-box l"></div><div class="cl-box r"></div>' +
      '<div class="cl-bottom">' + scaleSVG('t') + '<div class="cl-mode">Normal</div><div class="cl-odo">8241 mi</div>' + scaleSVG('f') + '</div>' +
      '<div class="cl-chip"></div>' +
      '<svg class="cl-haz l" viewBox="0 0 16 14"><path d="M0 7l8-7v4h8v6H8v4z" fill="currentColor"/></svg><svg class="cl-haz r" viewBox="0 0 16 14"><path d="M0 7l8-7v4h8v6H8v4z" fill="currentColor"/></svg>';
    var clSpeed = clIn.querySelector('.cl-speed span'), ticksEls = [].slice.call(clIn.querySelectorAll('.cl-gauge line'));
    var boxL = clIn.querySelector('.cl-box.l'), boxR = clIn.querySelector('.cl-box.r'), chip = clIn.querySelector('.cl-chip');
    function leftBox(k){
      if (k === 'trailer') return '<div class="cl-row"><h6>Trailer</h6><span style="color:#5fd39a;font-size:12px">' + I('trailer') + ' Connected</span></div><h6 style="margin-top:8px">Stability</h6><div class="cl-radar"><i></i></div><div class="cl-row" style="margin-top:6px"><h6>Guidance</h6><span style="font-size:10px">Risk-adjusted</span></div>';
      if (k === 'power') return ['Power train load', 'Oil temp', 'Trans temp'].map(function(n, i){ return '<h6>' + n + '</h6><div class="cl-bar" style="--v:' + [58, 46, 50][i] + '%">L<span></span>H</div>'; }).join('');
      if (k === 'psi') return '<div class="cl-row"><h6>PSI <small style="font-size:7px">°F</small></h6></div><div class="cl-psi">' + chassisSVG(118) +
        '<span style="left:0;top:14px">35<small>60</small></span><span style="right:0;top:14px">34<small>60</small></span><span style="left:0;top:78px">35<small>62</small></span><span style="right:0;top:78px">35<small>62</small></span></div>';
      return '';
    }
    function rightBox(k){
      if (k === 'nav') return '<div class="cl-nav"><div class="cl-row"><b>1.1 mi</b><span class="arr">' + I('turn') + '</span></div><hr><div class="cl-row"><span class="cl-shield">75</span><div><p>Take Exit 45B</p><p>toward I-75 South</p></div></div>' + (st.mode === 'TOW MODE' ? '<p class="hint">Use wider turn path</p>' : '') + '</div>';
      if (k === 'emergency') return '<div class="cl-emg"><h6>Emergency vehicle ahead</h6><i class="siren"></i><p>Right shoulder</p><b>0.5 mi</b><hr style="border:0;border-top:1px solid rgba(255,255,255,.15);margin:10px -12px"><p style="font-size:13px;margin:0">Reduce speed</p><p style="font-size:8.5px;color:#aab4c3;margin-top:2px">ACC limited</p></div>';
      if (k === 'trip') return '<div class="cl-trip"><h6 style="font-size:14px;text-transform:none;letter-spacing:0;color:#fff">Trip A</h6><hr style="border:0;border-top:1px solid rgba(255,255,255,.15);margin:10px -12px"><div class="cl-row"><b>458<small> mi</small></b><b style="font-size:20px">27.5<small> mpg</small></b></div><p style="margin:10px 0 0;font-size:13px">7h 12m</p></div>';
      return '';
    }
    var lastL = 'x', lastR = 'x', lastMode = '';
    function renderCluster(){
      var L = st.view === 1 ? 'trailer' : st.view === 2 ? 'power' : st.left;
      if (L !== lastL){ boxL.classList.add('hide'); setTimeout(function(){ boxL.innerHTML = leftBox(L); boxL.classList.toggle('hide', !L); }, lastL === 'x' ? 0 : 200); lastL = L; }
      if (st.right + st.mode !== lastR){ boxR.innerHTML = rightBox(st.right); lastR = st.right + st.mode; }
      clIn.querySelector('.cl-gear').textContent = st.gear;
      clIn.querySelector('.cl-mode').textContent = st.mode;
      clIn.querySelector('.cl-lane').classList.toggle('off', !st.lane);
      clIn.querySelector('.cl-acc').classList.toggle('off', !st.acc);
      clIn.classList.toggle('haz-on', st.hazard);
      clIn.classList.toggle('chip-on', !!st.chip);
      var c = st.chip;
      chip.className = 'cl-chip' + (c ? ' on ' + c : '');
      if (c === 'wind') chip.innerHTML = I('wind') + ' Gust Wind Warning';
      else if (c === 'acc') chip.innerHTML = '<span style="color:#5fd39a;font-size:15px;display:flex">' + I('wheel') + '</span> Hold <span class="k">OK</span> to engage';
    }

    /* ---------- center display ---------- */
    cdStatus.innerHTML = I('pin') + I('wifi') + I('bt') + '<span class="mid"><span>' + I('music') + 'MEDIA</span><span>↑ MAPS</span><span style="font-size:14px">' + I('grid') + '</span><span style="font-size:12px;letter-spacing:0">' + I('sun') + ' 74°F</span></span><span class="tm">12:47</span>' + I('bat');
    var NAV = [['climate', 'fan'], ['drive', 'car'], ['map', 'map'], ['home', 'home'], ['music', 'music'], ['camera', 'cam']];
    cdNav.innerHTML = NAV.map(function(n){ return '<button type="button" data-nav="' + n[0] + '" aria-label="' + n[0] + '">' + I(n[1]) + '</button>'; }).join('');
    function navKey(s){ return s === 'stability' ? 'map' : s; }
    function mapView(extra){
      return '<div class="mp">' + CITY +
        (st.nav === 'huron'
          ? '<div class="mp-turn">' + I('turn') + '<div><b>In 0.5 mi</b><small>W Huron St</small></div></div>'
          : '<div class="mp-turn">' + I('turn') + '<div><b>1.1 mi</b><small>Take Exit 45B</small></div></div>') +
        '<div class="mp-speed"><div class="cl-limit">SPEED<br>LIMIT<b>' + (st.nav === 'huron' ? 55 : 70) + '</b></div><b>' + Math.round(st.speed) + '<small>mph</small></b></div>' +
        (st.nav === 'huron'
          ? '<div class="mp-eta"><div>' + (st.panel === 'chosen' ? '4:50' : '4:47') + '<small>arrival</small></div><div>' + (st.panel === 'chosen' ? '3h 48' : '3h 45') + '<small>min</small></div><div>1.4<small>mi</small></div></div>'
          : '<div class="mp-eta"><div>2:47<small>arrival</small></div><div>56<small>min</small></div><div>60<small>mi</small></div></div>') +
        '<div class="mp-zoom"><span>' + I('minus') + '</span><span>' + I('plus') + '</span><span>' + I('target') + '</span><span>' + I('layers') + '</span></div>' +
        '<div class="mp-puck">' + I('play') + '</div>' + (extra || '') + '</div>';
    }
    var STOPS = [['Lakeview Travel Center', '5 min', '+3 min detour', '●○○', true, ['wc', 'food', 'fuel', 'ev'], 'paw'],
                 ['Pine Ridge Rest Area', '16 min', '+9 min detour', '●●●', false, ['wc', 'fuel'], 'nopaw'],
                 ['North Creek Service Plaza', '20 min', '+8 min detour', '●●○', false, ['wc'], 'paw']];
    function screenHTML(){
      var s = st.screen;
      if (s === 'home'){
        var conf = '';
        if (st.milestone && !RM){ var R = rng(4), cols = ['#f2c14e', '#6ea0ff', '#e7ecf4', '#c79a52', '#8a5cff']; conf = '<div class="confetti">'; for (var i = 0; i < 26; i++) conf += '<i style="left:' + (R() * 100).toFixed(1) + '%;background:' + cols[i % 5] + ';animation-duration:' + (2.6 + R() * 2.4).toFixed(2) + 's;animation-delay:-' + (R() * 4).toFixed(2) + 's"></i>'; conf += '</div>'; }
        return (st.milestone ? '<div class="milestone"><span class="badge">10K</span>Mileage Milestone Unlocked<em>10,000 total miles reached</em></div>' + conf : '') +
          '<div class="hm-tiles pn">' + [['map', 'pin', 'Maps'], ['music', 'music', 'Audio'], ['home', 'phone', 'Phone'], ['drive', 'car', 'Drive mode'], ['home', 'info', 'Assistant'], ['home', 'gear', 'Settings']].map(function(t){ return '<button class="tb" data-nav="' + t[0] + '"' + (t[2] === 'Phone' || t[2] === 'Assistant' || t[2] === 'Settings' ? ' data-toast="' + t[2] + '"' : '') + '>' + I(t[1]) + t[2] + '</button>'; }).join('') + '</div>' +
          '<div class="hm-right" style="' + (st.milestone ? 'top:44px' : '') + '"><div class="hm-time">12:47</div><div class="hm-greet">Good Afternoon</div><img class="hm-truck" src="assets/gm/truck.png" alt="" draggable="false">' +
          '<div class="hm-cards"><div class="pn">65°F<small>Outdoors</small></div><div class="pn">' + I('cloud') + '<small>Cloudy</small></div><button class="tb hm-lock" data-act="lock"><span class="' + (st.locked ? 'on' : '') + '">' + I('lock') + '</span><span class="' + (st.locked ? '' : 'on') + '">' + I('unlock') + '</span></button></div>' +
          '<div class="mini-player pn"><span class="disc"></span><div class="t">Blinding Lights<small>The Weeknd</small></div><button class="pbtn">' + I('prev') + '</button><button class="pbtn big" data-act="play">' + I(st.playing ? 'pause' : 'play') + '</button><button class="pbtn">' + I('next') + '</button></div></div>';
      }
      if (s === 'climate'){
        var f = st.off ? 0 : st.fan, dur = (1.6 - f * .18).toFixed(2) + 's';
        var flowL = '', flowR = '';
        if (!st.off){
          for (var k = 0; k < 3; k++){ flowL += '<path style="animation-duration:' + dur + '" d="M' + (150 + k * 14) + ' 168 C ' + (130 + k * 10) + ' 120, ' + (90 + k * 8) + ' 110, ' + (70 + k * 12) + ' 160" stroke="#6ea0ff" stroke-width="5" fill="none" opacity=".85"/>';
            flowR += '<path style="animation-duration:' + dur + '" d="M' + (410 - k * 14) + ' 168 C ' + (440 - k * 10) + ' 118, ' + (480 - k * 8) + ' 112, ' + (500 - k * 12) + ' 160" stroke="#e9c79b" stroke-width="5" fill="none" opacity=".85"/>'; }
        }
        return '<div class="' + (st.off ? 'cm-off' : '') + '"><div class="cm-view"><svg viewBox="0 0 612 236" preserveAspectRatio="none" aria-hidden="true">' +
          '<path d="M60 0 L552 0 L600 90 L12 90z" fill="#e6eaee" opacity=".55"/>' + (st.fdef ? '<path d="M60 0 L552 0 L600 90 L12 90z" fill="#ffd9a8" opacity=".35"/>' : '') +
          '<path d="M0 96 C200 70 412 70 612 96 L612 236 L0 236z" fill="#2c3037"/><path d="M0 96 C200 70 412 70 612 96" stroke="#4a4f58" stroke-width="2" fill="none"/>' +
          '<circle cx="150" cy="150" r="54" fill="none" stroke="#15171b" stroke-width="12"/><rect x="128" y="138" width="44" height="26" rx="8" fill="#15171b"/>' +
          '<rect x="250" y="104" width="112" height="62" rx="6" fill="#15171b" stroke="#3a3f47"/><rect x="200" y="182" width="212" height="54" fill="#22252b"/>' +
          '<g class="cm-flow">' + flowL + flowR + '</g></svg>' +
          '<div class="cm-temp l" style="--h:' + ((st.tl - 60) / 25 * 100).toFixed(0) + '%"><span>HI</span><i></i><b>' + st.tl + '°</b><span>LO</span></div>' +
          '<div class="cm-temp r" style="--h:' + ((st.tr - 60) / 25 * 100).toFixed(0) + '%"><span>HI</span><i></i><b>' + st.tr + '°</b><span>LO</span></div></div>' +
          '<div class="cm-ctrl"><div class="cm-vents pn"><button class="tb on">' + I('ventF') + '</button><button class="tb' + (st.fdef ? ' on' : '') + '" data-act="fdef">' + I('defF') + '</button><button class="tb">' + I('ventD') + '</button><button class="tb' + (st.rdef ? ' on' : '') + '" data-act="rdef">' + I('defR') + '</button></div>' +
          '<div class="cm-mid pn"><div class="cm-fan" style="--f:' + (f / 7 * 100).toFixed(0) + '%"><i></i><button data-act="fan-">−</button><span>' + I('fan') + '</span><button data-act="fan+">+</button></div>' +
          '<div class="cm-row"><button class="tb' + (st.seatL ? ' on' : '') + '" data-act="seatL">' + I('seatheat') + '</button><button class="tb' + (st.auto ? ' on' : '') + '" data-act="auto">AUTO</button><button class="tb pw' + (st.off ? '' : ' on') + '" data-act="off">' + I('power') + '</button><button class="tb' + (st.ac ? ' on' : '') + '" data-act="ac">A/C</button><button class="tb' + (st.seatR ? ' on' : '') + '" data-act="seatR">' + I('seatheat') + '</button></div></div>' +
          '<div class="cm-aq pn">Air Quality<svg viewBox="0 0 66 66"><circle cx="33" cy="33" r="27" fill="none" stroke="#3a4252" stroke-width="3"/><circle cx="33" cy="33" r="27" fill="none" stroke="#5fd39a" stroke-width="3" stroke-dasharray="40 200" transform="rotate(130 33 33)"/><text x="33" y="40" text-anchor="middle" fill="#fff" font-size="20" font-family="Nunito Sans,sans-serif">17</text></svg></div></div></div>';
      }
      if (s === 'drive'){
        return '<div class="dm-l"><div class="dm-modes pn">' + [['Normal', 'truck'], ['Off-Road', 'offroad'], ['Eco', 'eco'], ['Tow', 'trailer']].map(function(m){ return '<button class="tb' + (st.drive === m[0] ? ' on' : '') + '" data-drive="' + m[0] + '">' + I(m[1]) + m[0] + '</button>'; }).join('') + '</div>' +
          '<div class="dm-sub pn"><label>Rear Differential Lock</label><div class="dm-lock">' + I('unlock') + '<i></i>' + I('lock') + '</div><div class="dm-ride"><span class="mut" style="font-size:10px">Ride Height</span><button>−</button><span>Normal</span><button>+</button></div></div>' +
          (st.trailerCard ? '<div class="dm-trailer pn"><b>Trailer detected</b><span style="font-size:30px;color:#d8dee8;display:flex">' + I('trailer') + '</span><button class="tb" data-act="profile">view profile</button><a data-act="skip">Skip for now</a></div>' : '') + '</div>' +
          '<div class="dm-r pn"><div class="dm-wd">' + [['AUTO', ''], ['4WD', 'High'], ['4WD', 'Low'], ['2WD', '']].map(function(w){ var k = w[0] + w[1]; return '<button class="tb' + (st.wd === k ? ' on' : '') + '" data-wd="' + k + '">' + w[0] + (w[1] ? '<small>' + w[1] + '</small>' : '') + '</button>'; }).join('') + '</div>' +
          '<div class="mut" style="font-size:11px;margin-top:10px">Rear Priority</div><div class="dm-chassis">' + chassisSVG(250) + '<span style="left:30px;top:30px">35 psi</span><span style="right:30px;top:30px">35 psi</span><span style="left:30px;top:190px">35 psi</span><span style="right:30px;top:190px">35 psi</span></div></div>';
      }
      if (s === 'map'){
        var extra = '';
        if (st.popup === 'recovery') extra = '<div class="pop"><h5>' + I('rest') + '<span>Coordinated Recovery Plan<br>Switch to recovery route?</span></h5><p>Rest area ahead in: <b>5 min</b><br>Fuel stop included<br><b>Detour +3 min</b><br>Fuel on arrival: <b>34 mi</b></p><div class="row"><button class="tb pri" data-act="accept">Accept Route</button><button class="tb" data-act="more">More Option</button></div></div>';
        if (st.panel === 'stops' || st.panel === 'chosen') extra = '<div class="stops"><h5>Choose a Recovery Stop</h5>' + STOPS.map(function(o, i){ return '<button class="stop' + (o[4] ? ' rec' : '') + (st.stop === i ? ' sel' : '') + '" data-stop="' + i + '">' + (o[4] ? '<small>Recommended</small>' : '') +
          '<span class="st-top"><b>' + o[0] + '</b><span class="st-am">' + o[5].map(function(a){ return I(a); }).join('') + '</span></span>' +
          '<span class="st-body">' + o[1] + '<br>' + o[2] + '<br>Crowd: ' + o[3] + '</span><span class="st-pet' + (o[6] === 'nopaw' ? ' no' : '') + '">' + I(o[6]) + '</span><span class="st-go">' + I('chev') + '</span></button>'; }).join('') + '<button class="tb stay" data-act="stay">Stay On Current Route ›</button></div>';
        return mapView(extra);
      }
      if (s === 'camera'){
        return '<div class="sp-l">' + laneSVG('siren') + '<div class="alert"><b>Ambulance 500 m behind</b><p>Pull over to right shoulder<br>immediately when safe</p></div></div>' +
          '<div class="cams"><div class="cam">' + camSVG('L') + '<span>LEFT</span></div><div class="cam">' + camSVG('R') + '<span>RIGHT</span></div><div class="cam">' + camSVG('H') + '<span>HITCH</span></div><div class="cam">' + camSVG('B') + '<span>REAR</span></div></div>';
      }
      if (s === 'stability'){
        return '<div class="sp-l"><div class="stab"><img src="assets/gm/truck.png" alt="" draggable="false"><svg viewBox="0 0 282 170" aria-hidden="true"><path d="M70 64 L70 30 L100 30" stroke="#5fd39a" fill="none"/><path d="M160 120 L160 140 L190 140" stroke="#5fd39a" fill="none"/></svg><span style="left:104px;top:22px">Chassis Control Active</span><span style="left:150px;top:146px">Steering Assist Active</span></div>' +
          '<div style="position:absolute;left:0;right:0;bottom:0;height:54%;overflow:hidden">' + laneSVG('wind') + '<div class="alert warn"><b>' + I('warn') + ' Strong crosswind detected</b><p>Stability Assist active</p></div></div></div>' +
          '<div class="sp-r">' + mapView('') + '</div>';
      }
      if (s === 'music'){
        var tg = st.popup === 'tailgate' ? '<div class="pop tg"><h5><img src="assets/gm/truck.png" alt="" style="width:54px;margin:-4px 0"><span>Tailgate open: Switch to<br>Outside Mode?</span></h5><p style="margin-top:6px">Optimized audio for tailgating</p><div class="row"><button class="tb pri" data-act="outside">Activate</button><button class="tb" data-act="dismiss">Dismiss</button></div></div>' : '';
        return '<div class="mu">' + wavesSVG() + tg +
          '<div class="mu-l"><div class="pn"><h6>UP NEXT</h6>' + [['Blinding Lights', 'The Weeknd'], ['Save Your Tears', 'The Weeknd'], ['Starboy', 'The Weeknd']].map(function(t){ return '<div class="mu-song"><span class="disc"></span><div>' + t[0] + '<small>' + t[1] + '</small></div></div>'; }).join('') + '</div>' +
          '<div class="pn"><h6>MEDIA SOURCE</h6><div class="mu-src"><span class="on">Spotify Music</span><span>SiriusXM</span><span>FM Radio</span><span>Bluetooth</span><span>USB</span></div></div></div>' +
          '<div class="mu-c"><div class="mu-art' + (st.playing && !RM ? ' spin' : '') + '"></div><h4>Blinding Lights</h4><div class="mut">The Weeknd</div><div class="mu-chips">SOURCE: SPOTIFY · ' + st.sound.toUpperCase() + ' · IMMERSIVE</div>' +
          '<div class="mu-ctrl"><button class="pbtn">' + I('shuf') + '</button><button class="pbtn">' + I('prev') + '</button><button class="pbtn big" data-act="play">' + I(st.playing ? 'pause' : 'play') + '</button><button class="pbtn">' + I('next') + '</button><button class="pbtn">' + I('rep') + '</button></div></div>' +
          '<div class="mu-r pn"><h6>SURROUND SOUND</h6>' + truckTop(st.sound) + '<p>' + st.sound.charAt(0).toUpperCase() + st.sound.slice(1) + ' Mode Enabled<br>4 Passengers Detected</p><div class="mu-modes">' + ['cabin', 'outside', 'front', 'rear'].map(function(m){ return '<button class="tb' + (st.sound === m ? ' on' : '') + '" data-sound="' + m + '">' + m.toUpperCase() + '</button>'; }).join('') + '</div></div></div>';
      }
      return '';
    }
    function renderScreen(){
      var key = st.screen;
      cdBody.innerHTML = '<div class="cd-screen' + (st.screen === 'home' && st.milestone ? ' ms' : '') + '"' + (key === lastScreen ? ' style="animation:none"' : '') + '>' + screenHTML() + '</div>';
      lastScreen = key;
      [].forEach.call(cdNav.children, function(b){ b.classList.toggle('on', b.dataset.nav === navKey(st.screen)); });
    }
    function showToast(html){
      toast.innerHTML = html; toast.classList.add('on');
      clearTimeout(toastT); toastT = setTimeout(function(){ toast.classList.remove('on'); }, 1700);
    }
    function volToast(){ showToast(I(st.muted ? 'minus' : 'music') + (st.muted ? 'Muted' : 'Volume ' + st.vol) + '<i class="vol" style="--v:' + (st.muted ? 0 : st.vol / 30 * 100) + '%"></i>'); }

    /* ---------- physical button bar ---------- */
    var KEYS = [['seatL', 'seatheat', 'Heating<br>Seat'], ['fan-', 'fan', 'Fan −'], ['fan+', 'fan', 'Fan +'], ['fdef', 'defF', 'Front<br>Defrost'], ['rdef', 'defR', 'Rear<br>Defrost'],
      ['haz', 'haz', 'Hazard'], ['auto', null, 'AUTO'], ['off', 'power', 'Climate<br>OFF'], ['ac', null, 'A/C'], ['recirc', 'recirc', 'Recircu-<br>lation'], ['seatR', 'seatheat', 'Heating<br>Seat']];
    pb.innerHTML = '<button class="pb-knob" data-knob="vol" aria-label="Volume knob"><span>VOLUME</span></button>' +
      KEYS.map(function(k){ return '<button class="pb-key' + (k[0] === 'haz' ? ' haz' : '') + '" data-key="' + k[0] + '">' + (k[1] ? I(k[1]) : '<b style="font-size:10px">' + k[2] + '</b>') + (k[1] ? '<span>' + k[2] + '</span>' : '') + '</button>'; }).join('') +
      '<button class="pb-knob" data-knob="temp" aria-label="Temperature knob"><span>TEMP</span></button>';
    function renderBar(){
      [].forEach.call(pb.querySelectorAll('.pb-key'), function(b){
        var k = b.dataset.key, on = { seatL:st.seatL, seatR:st.seatR, fdef:st.fdef, rdef:st.rdef, haz:st.hazard, auto:st.auto, off:st.off, ac:st.ac && !st.off, recirc:st.recirc }[k];
        b.classList.toggle('on', !!on);
      });
      pb.querySelector('[data-knob=vol]').style.setProperty('--r', (st.vol * 9 - 135) + 'deg');
      pb.querySelector('[data-knob=temp]').style.setProperty('--r', ((st.tl - 72) * 12) + 'deg');
      [].forEach.call(host.querySelectorAll('.sw-ctl'), function(b){ var w = b.dataset.w; b.classList.toggle('on', (w === 'acc' && st.acc) || (w === 'lane' && st.lane)); });
    }
    function render(){ renderCluster(); renderScreen(); renderBar(); }

    /* ---------- actions ---------- */
    function climate(act){
      if (act === 'fan+'){ st.off = false; st.auto = false; st.fan = Math.min(7, st.fan + 1); }
      else if (act === 'fan-'){ st.auto = false; st.fan = Math.max(1, st.fan - 1); }
      else if (act === 'off') st.off = !st.off;
      else if (act === 'auto'){ st.auto = !st.auto; st.off = false; if (st.auto) st.fan = 3; }
      else if (act === 'ac'){ st.ac = !st.ac; st.off = false; }
      else st[act] = !st[act];
      if (st.screen !== 'climate') st.screen = 'climate';
      render();
      var label = { 'fan+':'Fan ' + st.fan, 'fan-':'Fan ' + st.fan, off:st.off ? 'Climate off' : 'Climate on', auto:'Auto ' + (st.auto ? 'on' : 'off'), ac:'A/C ' + (st.ac ? 'on' : 'off'),
        fdef:'Front defrost ' + (st.fdef ? 'on' : 'off'), rdef:'Rear defrost ' + (st.rdef ? 'on' : 'off'), recirc:'Recirculation ' + (st.recirc ? 'on' : 'off'), seatL:'Driver seat heat ' + (st.seatL ? 'on' : 'off'), seatR:'Passenger seat heat ' + (st.seatR ? 'on' : 'off') }[act];
      if (label) showToast(I(act.indexOf('seat') === 0 ? 'seatheat' : act.indexOf('def') > 0 ? 'defF' : 'fan') + label);
    }
    host.addEventListener('click', function(e){
      var t = e.target.closest('[data-nav],[data-act],[data-drive],[data-wd],[data-stop],[data-sound],[data-key],[data-w],[data-knob],.ck-tabs button');
      if (!t || !host.contains(t)) return;
      var d = t.dataset;
      if (t.parentNode.classList && t.parentNode.classList.contains('ck-tabs')){ goCtx(tabs.indexOf(t)); return; }
      if (d.toast){ showToast(I('info') + d.toast + ' — not part of this concept'); return; }
      if (d.nav){ st.screen = d.nav; if (d.nav !== 'map'){ st.popup = null; } render(); return; }
      if (d.drive){ st.drive = d.drive; st.mode = d.drive === 'Tow' ? 'TOW MODE' : d.drive; st.left = d.drive === 'Tow' ? 'trailer' : null; render(); showToast(I('car') + d.drive + ' mode'); return; }
      if (d.wd){ st.wd = d.wd; render(); return; }
      if (d.sound){ st.sound = d.sound; render(); return; }
      if (d.stop){ st.stop = +d.stop; st.panel = 'chosen'; render(); showToast(I('ok') + 'Route updated · ' + STOPS[+d.stop][2]); return; }
      if (d.key){
        if (d.key === 'haz'){ st.hazard = !st.hazard; render(); showToast(I('haz') + 'Hazard lights ' + (st.hazard ? 'on' : 'off')); return; }
        climate(d.key); return;
      }
      if (d.knob){ if (d.knob === 'vol'){ st.muted = !st.muted; renderBar(); volToast(); } else { st.screen = 'climate'; render(); } return; }
      if (d.w){
        if (d.w === 'acc'){ st.acc = !st.acc; st.chip = st.acc ? 'acc' : null; render(); setTimeout(function(){ if (st.chip === 'acc'){ st.chip = null; renderCluster(); } }, 2600); return; }
        if (d.w === 'lane'){ st.lane = !st.lane; render(); showToast(I('car') + 'Lane assist ' + (st.lane ? 'on' : 'off')); return; }
        if (d.w === 'home'){ st.screen = 'home'; st.popup = null; render(); return; }
        if (d.w === 'voice'){ showToast('<span class="wave"><b></b><b style="animation-delay:-.2s"></b><b style="animation-delay:-.4s"></b><b style="animation-delay:-.1s"></b></span> Listening…'); return; }
        if (d.w === 'view'){ showToast(I('car') + 'Drive assist menu'); return; }
        if (d.w === 'vol'){ st.muted = !st.muted; renderBar(); volToast(); return; }
      }
      var a = d.act;
      if (a === 'lock'){ st.locked = !st.locked; render(); showToast(I(st.locked ? 'lock' : 'unlock') + (st.locked ? 'Doors locked' : 'Doors unlocked')); }
      else if (a === 'play'){ st.playing = !st.playing; render(); }
      else if (a === 'accept' || a === 'more'){ st.popup = null; st.panel = 'stops'; render(); }
      else if (a === 'stay'){ st.panel = null; st.stop = -1; render(); showToast(I('map') + 'Staying on current route'); }
      else if (a === 'profile'){ st.trailerCard = false; st.screen = 'drive'; st.drive = 'Tow'; st.mode = 'TOW MODE'; st.left = 'trailer'; render(); showToast(I('trailer') + 'Weekend Camper profile loaded'); }
      else if (a === 'skip'){ st.trailerCard = false; render(); }
      else if (a === 'outside'){ st.sound = 'outside'; st.popup = null; render(); showToast(I('speak') + 'Outside Mode on'); }
      else if (a === 'dismiss'){ st.popup = null; render(); }
      else if (a) climate(a);
    });
    /* rollers and knobs turn with the wheel or a vertical drag */
    function turn(kind, dir){
      if (kind === 'vol'){ st.muted = false; st.vol = clamp(st.vol + dir, 0, 30); renderBar(); volToast(); }
      else if (kind === 'temp'){ st.tl = clamp(st.tl + dir, 60, 85); st.tr = clamp(st.tr + dir, 60, 85); st.screen = 'climate'; render(); showToast(I('sun') + 'Temperature ' + st.tl + '°'); }
      else if (kind === 'view'){ st.view = (st.view + (dir > 0 ? 1 : 2)) % 3; renderCluster(); showToast(I('car') + ['Normal view', 'Tow View 1', 'Tow View 2'][st.view]); }
    }
    host.addEventListener('wheel', function(e){
      var t = e.target.closest('[data-knob],.sw-roll'); if (!t) return;
      e.preventDefault(); e.stopPropagation();
      var now = performance.now(); if (now - (t._w || 0) < 90) return; t._w = now;
      turn(t.dataset.knob || t.dataset.w, e.deltaY < 0 ? 1 : -1);
    }, { passive:false });
    var drag = null;
    host.addEventListener('pointerdown', function(e){ var t = e.target.closest('[data-knob],.sw-roll'); if (t) drag = { t:t, y:e.clientY, moved:false }; });
    addEventListener('pointermove', function(e){ if (!drag) return; var dy = drag.y - e.clientY; if (Math.abs(dy) > 14){ drag.moved = true; drag.y = e.clientY; turn(drag.t.dataset.knob || drag.t.dataset.w, dy > 0 ? 1 : -1); } });
    addEventListener('pointerup', function(e){ if (drag && drag.moved) e.preventDefault(); setTimeout(function(){ drag = null; }, 0); });
    host.addEventListener('click', function(e){ if (drag && drag.moved) e.stopImmediatePropagation(); }, true);
    /* wheel control tooltips */
    var TIPS = { acc:'ACC on / off', view:'Drive mode / view scroll<br>scroll: Normal · Tow View 1 · Tow View 2', lane:'Distance / Lane Assist toggle', home:'Home / Menu', vol:'Volume<br>rotate: up / down · press: mute', voice:'Voice / Call' };
    [].forEach.call(host.querySelectorAll('.sw-ctl'), function(b){
      b.addEventListener('pointerenter', function(){ tip.innerHTML = TIPS[b.dataset.w]; tip.classList.add('on'); });
      b.addEventListener('pointerleave', function(){ tip.classList.remove('on'); });
    });

    /* ---------- contexts ---------- */
    function applyCtx(i){
      var s = CTX[i].set;
      for (var k in s) st[k] = s[k];
      st.view = 0; st.stop = -1; st.hazard = false;
      if (!s.nav) st.nav = 'exit';
      if (i === 2) st.hazard = false;
      render();
    }
    function goCtx(i){
      var top = sec.getBoundingClientRect().top + scrollY;
      scrollTo({ top:top + (i / 6 + .08) * (sec.offsetHeight - innerHeight), behavior:RM ? 'auto' : 'smooth' });
    }
    function fit(){
      var r = area.getBoundingClientRect();
      var k = Math.min(r.width / 1120, r.height / 620);
      canvas.style.marginLeft = '-560px';
      canvas.style.transform = 'scale(' + k.toFixed(4) + ')';
    }
    fit(); addEventListener('resize', fit);
    applyCtx(0);
    var shown = 0;
    api.ticks.push(function(dt){
      if (!api.near(sec, .2)) return;
      var target = api.stickProgress(sec);
      shown += (target - shown) * (RM ? 1 : 1 - Math.exp(-dt * 7));
      var s = shown, idx = Math.min(5, Math.floor(s * 6));
      if (idx !== ctx){ ctx = idx; applyCtx(idx); tabs.forEach(function(b, j){ b.classList.toggle('on', j === idx); }); }
      for (var i = 0; i < 6; i++){
        var st0 = i / 6, cu = [i ? st0 + .015 : 0, i ? st0 + .045 : 0, st0 + .14, st0 + .165];
        if (i === 5){ cu[2] = 1.1; cu[3] = 1.2; }
        var en = ramp(s, cu[0], cu[1]), lv = ramp(s, cu[2], cu[3]);
        panels[i].style.opacity = en * (1 - lv);
        panels[i].style.transform = 'translate3d(0,' + ((1 - en) * 16 - lv * 16).toFixed(1) + 'px,0)';
      }
      meter.style.transform = 'scaleX(' + s.toFixed(4) + ')';
      /* speed eases toward the context's target and lights the tach to match */
      var prev = Math.round(shownSpeed);
      shownSpeed += (st.speed - shownSpeed) * Math.min(1, dt * 2.5);
      var sp = Math.round(shownSpeed);
      if (sp !== prev || !clSpeed.textContent){
        clSpeed.textContent = sp;
        var lit = clamp(sp / 150 + (st.gear === 'P' ? 0 : .1), 0, 1);
        ticksEls.forEach(function(l){ l.style.opacity = +l.dataset.t <= lit ? 1 : .28; });
      }
    });
    return { state:st, update:function(fn){ fn(st); render(); }, toast:showToast };
  };
})();
