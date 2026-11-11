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
    user:'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8M4 21a8 8 0 0 1 16 0',
    x:'M6 6l12 12M18 6L6 18',
    call:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    micoff:'M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16',
    keypad:'M6 5h.01M12 5h.01M18 5h.01M6 11h.01M12 11h.01M18 11h.01M6 17h.01M12 17h.01M18 17h.01',
    wiper:'M4 18a10 10 0 0 1 16 0M12 18L7 8',
    mirror:'M3 8h10l3 3v5H3zM16 11h5',
    dome:'M5 13a7 7 0 0 1 14 0zM12 16v3M8 17l-1.5 2M16 17l1.5 2',
    headl:'M3 12c0-4 2-6 6-6v12c-4 0-6-2-6-6zM13 8h7M13 12h7M13 16h7',
    child:'M12 3a2 2 0 1 0 0 4a2 2 0 1 0 0-4M7 21v-5l-2-5h14l-2 5v5M10 21v-4h4v4',
    dnd:'M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z',
    hotspot:'M12 12h.01M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8',
    clean:'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
    tailg:'M3 8h18v9H3zM6 8V5h12v3M3 17v2M21 17v2',
    expand:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    shrink:'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
    sun2:'M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2',
    sliders:'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
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
  var DEFS = '<svg class="ck-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    '<filter id="ckGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .35 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="multiply"/></filter>' +
    '<filter id="ckBlurX"><feGaussianBlur stdDeviation="1.4 0"/></filter><filter id="ckSoft"><feGaussianBlur stdDeviation="3"/></filter><filter id="ckGlow"><feGaussianBlur stdDeviation="6"/></filter>' +
    '<linearGradient id="ckSkyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecf0"/><stop offset="1" stop-color="#b8c1ca"/></linearGradient>' +
    '<linearGradient id="ckAsph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a7e85"/><stop offset=".5" stop-color="#5f636a"/><stop offset="1" stop-color="#45484e"/></linearGradient>' +
    '<linearGradient id="ckGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d9a78"/><stop offset="1" stop-color="#6c7a58"/></linearGradient>' +
    '<linearGradient id="ckCarG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa0a8"/><stop offset=".55" stop-color="#6b7078"/><stop offset="1" stop-color="#3f4349"/></linearGradient>' +
    '<linearGradient id="ckWhiteG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9dde2"/><stop offset=".6" stop-color="#f6f7f9"/><stop offset="1" stop-color="#c9ced4"/></linearGradient>' +
    '<linearGradient id="ckGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4048"/><stop offset="1" stop-color="#16181c"/></linearGradient>' +
    '<radialGradient id="ckVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>' +
    '<linearGradient id="ckTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d838d"/><stop offset="1" stop-color="#4a4f57"/></linearGradient>' +
    '<linearGradient id="ckOwn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8ccd2"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#c8ccd2"/></linearGradient>' +
    '<linearGradient id="ckLaneHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7bff" stop-opacity="0"/><stop offset=".35" stop-color="#3d7bff" stop-opacity=".35"/><stop offset="1" stop-color="#3d7bff" stop-opacity=".55"/></linearGradient>' +
    '<linearGradient id="ckFlowB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc2ff" stop-opacity=".1"/><stop offset=".5" stop-color="#6ea0ff" stop-opacity=".75"/><stop offset="1" stop-color="#3b6fe0" stop-opacity=".95"/></linearGradient>' +
    '<linearGradient id="ckFlowW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5dcb8" stop-opacity=".1"/><stop offset=".5" stop-color="#ecc795" stop-opacity=".75"/><stop offset="1" stop-color="#d9a35e" stop-opacity=".95"/></linearGradient>' +
    '<linearGradient id="ckWind" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".55" stop-color="#cfdbe8"/><stop offset="1" stop-color="#a7b6c6"/></linearGradient>' +
    '<linearGradient id="ckDashG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2e35"/><stop offset="1" stop-color="#16181c"/></linearGradient>' +
    '<radialGradient id="ckSpeedGlow"><stop offset="0" stop-color="#6ea0ff" stop-opacity=".22"/><stop offset="1" stop-color="#6ea0ff" stop-opacity="0"/></radialGradient>' +
    '</defs></svg>';

  function mix(a, b, t){ var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), r = (A >> 16) + ((B >> 16) - (A >> 16)) * t, g = (A >> 8 & 255) + ((B >> 8 & 255) - (A >> 8 & 255)) * t, bl = (A & 255) + ((B & 255) - (A & 255)) * t; return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ')'; }
  function gaugeSVG(){
    var s = '<svg class="cl-gauge" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="78" fill="url(#ckSpeedGlow)"/>' +
      '<path d="M41 179 A98 98 0 1 1 179 179" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>';
    var cx = 110, cy = 110, N = 72;
    for (var k = 0; k <= N; k++){
      var t = k / N, a = (135 + 270 * t) * Math.PI / 180, major = k % 8 === 0;
      var r1 = 97, r2 = major ? 80 : (k % 2 ? 88 : 85);
      var col = t < .32 ? mix('#2f63d8', '#b7cdf5', t / .32) : t < .72 ? '#eef1f6' : mix('#f2c4c1', '#e0463f', (t - .72) / .28);
      s += '<line data-t="' + t.toFixed(3) + '" x1="' + (cx + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (cx + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(a)).toFixed(1) + '" stroke="' + col + '" stroke-width="' + (major ? 2.6 : 1.7) + '" stroke-linecap="round"/>';
      if (major){ var rl = 68; s += '<text x="' + (cx + rl * Math.cos(a)).toFixed(1) + '" y="' + (cy + rl * Math.sin(a) + 3).toFixed(1) + '" fill="#cfd6e2" font-size="9" text-anchor="middle" font-family="Nunito Sans,sans-serif">' + (k / 8) + '</text>'; }
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
    var R = rng(11), W = 640, H = 420, s = '<svg class="city" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="' + W + '" height="' + H + '" fill="#23272e"/>';
    var xs = [0, 90, 190, 270, 380, 470, 560, 640], ys = [0, 70, 150, 230, 300, 380, 420], blds = [];
    s += '<g stroke="#3d434d" stroke-width="7">';
    xs.forEach(function(x){ s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>'; });
    ys.forEach(function(y){ s += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>'; });
    s += '</g><g stroke="#4a515c" stroke-width="1" stroke-dasharray="4 6">';
    xs.forEach(function(x){ s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>'; });
    s += '</g>';
    for (var i = 0; i < xs.length - 1; i++) for (var j = 0; j < ys.length - 1; j++){
      var x0 = xs[i] + 10, x1 = xs[i + 1] - 10, y0 = ys[j] + 10, y1 = ys[j + 1] - 10;
      if (i === 4 && j === 2){ s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" rx="3" fill="#2c4636"/><circle cx="' + (x0 + 30) + '" cy="' + (y0 + 26) + '" r="9" fill="#35553f"/><circle cx="' + (x1 - 26) + '" cy="' + (y1 - 20) + '" r="11" fill="#35553f"/>'; continue; }
      for (var b = 0; b < 6; b++){ var bw = 14 + R() * 20, bh = 12 + R() * 16, bx = x0 + R() * Math.max(1, x1 - x0 - bw), by = y0 + 6 + R() * Math.max(1, y1 - y0 - bh - 6); blds.push([bx, by, bw, bh, 3 + R() * 7]); }
    }
    blds.sort(function(a, b){ return a[1] - b[1]; });
    blds.forEach(function(q){
      var x = q[0].toFixed(0), y = q[1].toFixed(0), w = q[2].toFixed(0), h = q[3].toFixed(0), e = q[4];
      s += '<rect x="' + x + '" y="' + (q[1] + 2).toFixed(0) + '" width="' + w + '" height="' + h + '" fill="#1a1d22" opacity=".7"/>' +
        '<path d="M' + x + ' ' + (q[1] + q[3]).toFixed(0) + 'v' + (-e).toFixed(1) + 'h' + w + 'v' + e.toFixed(1) + 'z" fill="#353a43"/>' +
        '<rect x="' + x + '" y="' + (q[1] - e).toFixed(1) + '" width="' + w + '" height="' + h + '" fill="#4a505a" stroke="#565d68" stroke-width=".6"/>';
    });
    s += '<g fill="#c9d0db" font-size="11" font-family="Nunito Sans,sans-serif" paint-order="stroke" stroke="#23272e" stroke-width="3"><text x="420" y="64">W Huron St</text><text x="420" y="144">W Washington St</text><text x="470" y="224">W Liberty St</text><text x="400" y="294">W Jefferson St</text>' +
      '<text transform="translate(283 140) rotate(90)">S 7th St</text></g>';
    s += '<line x1="276" y1="0" x2="276" y2="' + H + '" stroke="#3d7bff" stroke-width="16" opacity=".22" filter="url(#ckSoft)"/><line x1="276" y1="0" x2="276" y2="' + H + '" stroke="#4f8cff" stroke-width="6" stroke-linecap="round"/><line x1="276" y1="0" x2="276" y2="' + H + '" stroke="#9cc0ff" stroke-width="1.4" opacity=".7"/>';
    return s + '</svg>';
  })();
  var camN = 0;
  function camSVG(kind){
    var id = 'ckCam' + (camN++), s = '<svg viewBox="0 0 160 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<mask id="' + id + '"><g class="cam-dash" stroke="#fff" stroke-width="40" stroke-dasharray="14 16"><line x1="80" y1="40" x2="80" y2="200"/></g></mask></defs>';
    s += '<rect width="160" height="72" fill="url(#ckSkyG)"/>' +
      '<path d="M0 60 Q20 50 40 57 T80 54 T120 56 T160 52 V70 H0z" fill="#8f9aa5" opacity=".7"/>' +
      '<path d="M0 64 q6-5 12 0 q5-6 11 0 q6-4 12 0 q6-6 12 0 q5-4 11 0 q6-5 12 0 q6-4 11 0 q6-6 12 0 q5-4 12 0 q6-5 11 0 q6-4 12 0 q6-6 12 0 q5-4 11 0 q6-5 10 0 V72 H0z" fill="#56664a"/>' +
      '<polygon points="0,72 160,72 160,180 0,180" fill="url(#ckGrass)"/>' +
      '<polygon points="-60,180 220,180 98,70 62,70" fill="url(#ckAsph)" filter="url(#ckGrain)"/>' +
      '<polygon points="-60,180 -46,180 63,70 62,70" fill="#eef0f2"/><polygon points="206,180 220,180 98,70 97,70" fill="#eef0f2"/>' +
      '<g mask="url(#' + id + ')"><polygon points="28,180 40,180 81.5,70 80.6,70" fill="#f4f5f6"/><polygon points="120,180 132,180 79.4,70 78.5,70" fill="#f4f5f6"/></g>';
    function car(x, y, sc, flip){
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -sc : sc) + ' ' + sc + ')" filter="url(#ckBlurX)"><ellipse cx="0" cy="22" rx="46" ry="6" fill="#000" opacity=".35"/>' +
        '<path d="M-44 18 L-44 2 Q-40 -8 -26 -10 L-12 -24 Q0 -30 22 -28 L36 -14 Q46 -10 46 2 L46 18z" fill="url(#ckCarG)"/>' +
        '<path d="M-8 -22 L-22 -10 L4 -10 L4 -24z M8 -24 L8 -10 L32 -10 L22 -24z" fill="url(#ckGlass)"/>' +
        '<path d="M-44 4 H46" stroke="rgba(255,255,255,.25)" stroke-width="1"/>' +
        '<circle cx="-26" cy="18" r="9" fill="#18191c"/><circle cx="-26" cy="18" r="4.5" fill="#7a7f87"/><circle cx="28" cy="18" r="9" fill="#18191c"/><circle cx="28" cy="18" r="4.5" fill="#7a7f87"/></g>';
    }
    if (kind === 'L' || kind === 'R'){
      var m = kind === 'R' ? ' transform="translate(160 0) scale(-1 1)"' : '';
      s += '<g' + m + '>' + car(30, 112, .9, false) +
        '<path d="M120 50 L170 30 L170 190 L106 190 Q110 120 120 50z" fill="url(#ckWhiteG)"/>' +
        '<path d="M126 70 L170 58 L170 112 L120 120z" fill="#9ba2ab" opacity=".55"/>' +
        '<path d="M118 132 Q140 128 170 130" stroke="#aab0b8" stroke-width="1.2" fill="none"/>' +
        '<rect x="66" y="0" width="22" height="9" rx="4" fill="#111"/></g>';
    } else if (kind === 'H'){
      s += '<g><path d="M30 84 L130 84 L146 156 L14 156z" fill="#3b3e43" opacity=".35"/>' +
        '<path d="M34 86 L126 86 L140 152 L20 152z" fill="none" stroke="#202226" stroke-width="3"/>' +
        '<g stroke="#2b2d31" stroke-width="1.2" opacity=".85">' + [96, 106, 116, 126, 136, 146].map(function(y){ var k = (y - 86) / 66, l = 34 - 14 * k, r = 126 + 14 * k; return '<line x1="' + l.toFixed(1) + '" y1="' + y + '" x2="' + r.toFixed(1) + '" y2="' + y + '"/>'; }).join('') + '</g>' +
        '<g fill="none" stroke="#1d1f22" stroke-width="2.4"><circle cx="58" cy="104" r="14"/><circle cx="92" cy="104" r="14"/><path d="M58 104 L72 92 L92 104 M72 92 L68 84"/></g>' +
        '<path d="M70 152 L80 172 L90 152" fill="none" stroke="#202226" stroke-width="3"/><path d="M74 160 q-6 8 0 14 q6 6 0 12" stroke="#9aa0a8" stroke-width="1.6" fill="none"/>' +
        '<circle cx="80" cy="172" r="5" fill="#c4c9d0"/><rect x="0" y="170" width="160" height="10" fill="#1b1d21"/></g>';
    } else {
      s += car(80, 104, .38, false) + '<rect x="0" y="168" width="160" height="12" fill="#1b1d21"/><path d="M26 168 L44 150 L116 150 L134 168" stroke="#1b1d21" stroke-width="4" fill="none"/>';
    }
    s += '<rect width="160" height="180" fill="url(#ckVig)"/>';
    return s + '</svg>';
  }
  function laneSVG(kind){
    var s = '<div class="lane3d"><svg viewBox="0 0 282 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="282" height="420" fill="#1f2329"/>';
    s += '<rect x="22" y="0" width="238" height="420" fill="#2a2e35" filter="url(#ckGrain)"/>';
    s += '<rect x="122" y="0" width="46" height="420" fill="url(#ckLaneHi)"/><line x1="122" y1="0" x2="122" y2="420" stroke="#4f8cff" stroke-width="2.5"/><line x1="168" y1="0" x2="168" y2="420" stroke="#4f8cff" stroke-width="2.5"/>';
    s += '<g class="lane-mv" stroke="#a9b1bd" stroke-width="1.6" stroke-dasharray="14 16">';
    [72, 214].forEach(function(x){ s += '<line x1="' + x + '" y1="-30" x2="' + x + '" y2="450"/>'; });
    s += '</g><line x1="24" y1="0" x2="24" y2="420" stroke="#d6dbe2" stroke-width="2"/><line x1="258" y1="0" x2="258" y2="420" stroke="#d6dbe2" stroke-width="2"/>';
    var R = rng(kind === 'wind' ? 5 : 3);
    function car(x, y, body, w, h){
      w = w || 22; h = h || 40;
      return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2 - 1) + '" y="' + (-h / 2 + 3) + '" width="' + (w + 2) + '" height="' + h + '" rx="7" fill="#000" opacity=".45" filter="url(#ckSoft)"/>' +
        '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="6.5" fill="' + (body || 'url(#ckTop)') + '"/>' +
        '<path d="M' + (-w / 2 + 3) + ' ' + (-h / 2 + 9) + ' Q0 ' + (-h / 2 + 5) + ' ' + (w / 2 - 3) + ' ' + (-h / 2 + 9) + ' L' + (w / 2 - 4) + ' ' + (-h / 2 + 15) + ' L' + (-w / 2 + 4) + ' ' + (-h / 2 + 15) + 'z" fill="#1d2025"/>' +
        '<rect x="' + (-w / 2 + 4) + '" y="' + (h / 2 - 9) + '" width="' + (w - 8) + '" height="4" rx="1.5" fill="#1d2025"/>' +
        '<rect x="' + (-w / 2 + 3) + '" y="' + (-h / 2 + 17) + '" width="' + (w - 6) + '" height="' + (h - 28) + '" rx="3" fill="#fff" opacity=".07"/></g>';
    }
    [[48, 30], [48, 150], [48, 300], [96, 90], [96, 250], [192, 50], [192, 200], [236, 120], [236, 320], [145, 30]].forEach(function(p){ s += car(p[0], p[1] + R() * 22); });
    /* Mark's truck with the trailer behind it */
    s += '<g transform="translate(145 168)"><rect x="-15" y="34" width="30" height="46" rx="3" fill="#000" opacity=".4" filter="url(#ckSoft)"/><rect x="-14" y="32" width="28" height="44" rx="3" fill="#4b5058" stroke="#6b717a"/><path d="M-10 38h20M-10 46h20M-10 54h20M-10 62h20" stroke="#5c626b"/><path d="M0 28v6" stroke="#9aa0a8" stroke-width="2"/></g>';
    s += car(145, 152, 'url(#ckOwn)', 26, 54);
    if (kind === 'siren'){
      s += '<g transform="translate(145 300)"><circle class="siren-l" r="34" fill="#3b7bff" opacity=".22" filter="url(#ckGlow)"/><circle class="siren-r" r="30" fill="#ff3b3b" opacity=".22" filter="url(#ckGlow)"/>' +
        '<rect x="-14" y="-26" width="28" height="52" rx="6" fill="#f4f6f8"/><path d="M-5 2h10M0 -3v10" stroke="#e0524f" stroke-width="3"/>' +
        '<rect class="siren-l" x="-12" y="-27" width="10" height="5" rx="2" fill="#ff3b3b"/><rect class="siren-r" x="2" y="-27" width="10" height="5" rx="2" fill="#3b7bff"/></g>';
      s += '<path class="dash-arrow" d="M150 124 C150 80 192 80 192 30" stroke="#8fb3ff" stroke-width="2.5" fill="none"/><path d="M185 34 L192 18 L199 34z" fill="#8fb3ff"/>';
    } else {
      s += '<g class="wind" stroke="#9ed2ff" stroke-width="1.6" fill="none" opacity=".85">';
      for (var i = 0; i < 10; i++){ var y = 20 + i * 40; s += '<path style="animation-delay:-' + (i * .27).toFixed(2) + 's" d="M-10 ' + y + ' C 80 ' + (y - 20) + ', 160 ' + (y + 26) + ', 300 ' + (y - 10) + '"/>'; }
      s += '</g>';
    }
    return s + '</svg></div>';
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
    st.vtab = 'mode'; st.trl = { brake:'adjust', gain:4.5, modal:false };
    st.ctl = { mirrors:false, wipers:0, dome:false, lights:'Auto', gate:false, bed:false };
    st.call = null; st.dial = ''; st.ptab = 'recents';
    st.asst = false; st.asstLog = []; st.asstBusy = false;
    st.cat = 'assist'; st.bright = 80; st.theme = 'Auto'; st.prompts = true; st.chime = 'Med'; st.follow = 3; st.evAlert = true; st.fatigue = true; st.wind = true; st.turnPath = true;
    st.units = 'mi'; st.psiU = 'psi'; st.walkLock = true; st.profile = 'Mark'; st.tprof = 'Weekend Camper';
    st.cc = false; st.wifi = true; st.bt = true; st.hot = false; st.dndOn = false; st.childLock = true; st.clean = false;
    var shownSpeed = st.speed, ctx = -1, lastScreen = '', toastT = 0;

    host.innerHTML = DEFS + '<div class="ck"><div class="ck-stick">' +
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
        '<div class="ck-hint"><button class="ck-full" data-full>' + I('expand') + 'Explore the full system</button><button class="ck-focus" data-focus>' + I('expand') + 'Screen only</button><span>Tap the screen, the buttons below it, or the wheel controls</span></div>' +
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
    cdStatus.innerHTML = '<button class="sb-av" data-sys="profile" aria-label="Driver profile">M</button>' + I('pin') + '<span class="sb-wifi">' + I('wifi') + '</span><span class="sb-bt">' + I('bt') + '</span><span class="mid"><button class="chip" data-nav="music">' + I('music') + 'MEDIA</button><button class="chip" data-nav="map">↑ MAPS</button><button class="sb-grid" data-sys="cc" aria-label="Control center">' + I('grid') + '</button><span class="chip" style="letter-spacing:0;color:#f2c14e">' + I('sun') + '<b style="color:#e7ecf4;font-weight:400">74°F</b></span></span><button class="sb-mic" data-sys="asst" aria-label="Voice assistant">' + I('mic') + '</button><span class="tm">12:47</span>' + I('bat');
    var NAV = [['climate', 'fan'], ['drive', 'car'], ['map', 'map'], ['home', 'home'], ['music', 'music'], ['camera', 'cam']];
    cdNav.innerHTML = NAV.map(function(n){ return '<button type="button" data-nav="' + n[0] + '" aria-label="' + n[0] + '">' + I(n[1]) + '</button>'; }).join('');
    function navKey(s){ return s === 'stability' ? 'map' : s === 'phone' || s === 'settings' ? 'home' : s; }
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

    /* ================= complete system: extra screens ================= */
    function tog(key, on){ return '<button class="sw-tg' + (on ? ' on' : '') + '" data-set="' + key + '" aria-pressed="' + !!on + '"><i></i></button>'; }
    function segc(key, val, opts){ return '<span class="segc">' + opts.map(function(o){ return '<button data-setv="' + key + '" data-v="' + o + '" class="' + (String(val) === String(o) ? 'on' : '') + '">' + o + '</button>'; }).join('') + '</span>'; }
    function rangeC(key, val, min, max){ return '<input class="rg" type="range" data-range="' + key + '" min="' + min + '" max="' + max + '" value="' + val + '" style="--p:' + ((val - min) / (max - min) * 100).toFixed(0) + '%">'; }
    function row(label, sub, ctrl){ return '<div class="st-row"><div><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>' + ctrl + '</div>'; }

    function controlsHTML(){
      var c = st.ctl, beams = c.lights !== 'Off';
      var svg = '<svg class="qc-truck" viewBox="0 0 560 230" aria-hidden="true"><defs><linearGradient id="qcBeam" x1="1" x2="0"><stop offset="0" stop-color="#cfe3ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe3ff" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="qcWarm"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient></defs>' +
        (beams ? '<path d="M96 70 L0 30 L0 98 Z M96 160 L0 132 L0 200 Z" fill="url(#qcBeam)"' + (c.lights === 'Auto' ? ' opacity=".6"' : '') + '/>' : '') +
        (c.bed ? '<ellipse cx="420" cy="115" rx="90" ry="58" fill="url(#qcWarm)"/>' : '') + (c.dome ? '<ellipse cx="248" cy="115" rx="64" ry="48" fill="url(#qcWarm)"/>' : '') +
        '<g fill="none" stroke="#c9d3e3" stroke-width="1.6" stroke-linejoin="round">' +
          '<path d="M100 62 Q100 52 112 50 L500 50 Q512 50 512 62 L512 168 Q512 180 500 180 L112 180 Q100 178 100 168 Z"/>' +
          '<path d="M100 82 Q130 76 168 72 M100 148 Q130 154 168 158"/><path d="M168 66 L196 70 L196 160 L168 164 Z"/>' +
          '<rect x="196" y="70" width="112" height="90" rx="10"/><path d="M220 82 h30 v26 h-30z M262 82 h30 v26 h-30z M220 122 h72 v26 h-72z"/>' +
          '<path d="M308 70 L318 70 L318 160 L308 160"/><rect x="330" y="62" width="172" height="106" rx="4"/>' +
          [356, 382, 408, 434, 460, 486].map(function(x){ return '<path d="M' + x + ' 66 V164"/>'; }).join('') + '</g>' +
        '<g fill="#7d8899">' + [[118, 40], [118, 178], [398, 40], [398, 178]].map(function(w){ return '<rect x="' + w[0] + '" y="' + w[1] + '" width="44" height="12" rx="4"/>'; }).join('') + '</g>' +
        '<g class="qc-mir' + (c.mirrors ? ' fold' : '') + '" fill="#c9d3e3"><rect class="m1" x="180" y="38" width="14" height="22" rx="3"/><rect class="m2" x="180" y="170" width="14" height="22" rx="3"/></g>' +
        '<g class="qc-wipe' + (c.wipers ? ' on s' + c.wipers : '') + '" stroke="#e8eef8" stroke-width="2.4" stroke-linecap="round"><line class="w1" x1="186" y1="150" x2="178" y2="96"/><line class="w2" x1="186" y1="110" x2="178" y2="74"/></g>' +
        '<rect class="qc-gate' + (c.gate ? ' open' : '') + '" x="502" y="64" width="8" height="102" rx="2" fill="#c9d3e3"/>' +
        '<g fill="#fff" opacity=".85"><circle cx="102" cy="72" r="3"/><circle cx="102" cy="158" r="3"/></g><g fill="#ef5b4f"><rect x="508" y="56" width="4" height="10" rx="1"/><rect x="508" y="164" width="4" height="10" rx="1"/></g></svg>';
      function hot(k, icon, label, sub, x, y){ var on = k === 'lights' ? c.lights !== 'Off' : k === 'wipers' ? c.wipers > 0 : c[k];
        return '<button class="qc-hot' + (on ? ' on' : '') + '" data-ctl="' + k + '" style="left:' + x + '%;top:' + y + '%"><span class="ring">' + I(icon) + '</span><span class="lb">' + label + (sub ? '<em>' + sub + '</em>' : '') + '</span></button>'; }
      return '<div class="qc pn">' + svg +
        hot('lights', 'headl', 'Lights', c.lights, 9, 46) + hot('mirrors', 'mirror', 'Mirrors', c.mirrors ? 'Folded' : 'Open', 34, 4) + hot('wipers', 'wiper', 'Wipers', ['Off', 'Auto', 'Low', 'High'][c.wipers], 32, 70) +
        hot('dome', 'dome', 'Dome', c.dome ? 'On' : 'Off', 47, 40) + hot('bed', 'bed', 'Bed light', c.bed ? 'On' : 'Off', 72, 40) + hot('gate', 'tailg', 'Tailgate', c.gate ? 'Open' : 'Closed', 93, 46) +
        '<div class="qc-foot"><span>' + I(st.locked ? 'lock' : 'unlock') + (st.locked ? 'Locked' : 'Unlocked') + '</span><span>' + I('fuel') + 'Fuel 78%</span><span>' + I('ev') + 'Range 312 mi</span><span>' + I('trailer') + st.tprof + '</span></div></div>';
    }

    /* ---- Drive Mode: each mode gets its own controls and read-outs ---- */
    st.dm = { lock:false, ride:1, hdc:false, hdcV:3, terrain:'Mud', ecoClim:true, coach:true, stopstart:true, haul:true, grade:true };
    var RIDE = ['Low', 'Normal', 'High'];
    var DM_DEFAULT = { Normal:{ wd:'AUTO', ride:1 }, 'Off-Road':{ wd:'4WDHigh', ride:2 }, Eco:{ wd:'2WD', ride:0 }, Tow:{ wd:'AUTO', ride:1 } };
    function dmTog(k, label, sub){ var on = !!st.dm[k];
      return '<div class="dm-row"><span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span><button class="sw-tg' + (on ? ' on' : '') + '" data-dm="' + k + '" aria-pressed="' + on + '" aria-label="' + label + '"><i></i></button></div>'; }
    function dmStep(label, val, k){ return '<div class="dm-ride"><span class="mut" style="font-size:10px">' + label + '</span><button data-dm="' + k + '-" aria-label="Lower ' + label + '">−</button><span>' + val + '</span><button data-dm="' + k + '+" aria-label="Raise ' + label + '">+</button></div>'; }
    function wdChassis(){
      var w = st.wd, front = w !== '2WD', auto = w === 'AUTO', low = w === '4WDLow', lock = st.dm.lock;
      var fc = front ? (auto ? 'rgba(110,160,255,.45)' : '#6ea0ff') : '#3a4252', dash = auto ? ' stroke-dasharray="4 4"' : '';
      return '<svg viewBox="0 0 120 240" aria-hidden="true"><g fill="none" stroke="#c9d0db" stroke-width="1.3"><rect x="22" y="8" width="76" height="224" rx="16"/><rect x="48" y="80" width="24" height="40" rx="4"/></g>' +
        '<path d="M60 52v28M30 52h60" stroke="' + fc + '" stroke-width="2.4"' + dash + '/>' +
        '<path d="M60 120v66M30 186h60" stroke="#6ea0ff" stroke-width="2.4"/>' +
        (lock ? '<g transform="translate(60 186)"><rect x="-9" y="-9" width="18" height="18" rx="4" fill="#f2c14e"/><path d="M-4 0h8v5h-8zM-2.5 0v-2.5a2.5 2.5 0 0 1 5 0V0" fill="none" stroke="#1b1f27" stroke-width="1.4"/></g>' : '<circle cx="60" cy="186" r="5" fill="#2a303d" stroke="#6ea0ff" stroke-width="1.6"/>') +
        (low ? '<text x="60" y="104" text-anchor="middle" font-size="10" fill="#AAC5F0" font-family="Nunito Sans,sans-serif">LOW</text>' : '') +
        '<g fill="' + (front ? '#d8dde5' : '#6b7486') + '"><rect x="12" y="34" width="16" height="36" rx="5"/><rect x="92" y="34" width="16" height="36" rx="5"/></g><g fill="#d8dde5"><rect x="12" y="168" width="16" height="36" rx="5"/><rect x="92" y="168" width="16" height="36" rx="5"/></g></svg>';
    }
    var WD_NOTE = { AUTO:'Rear priority · front engages on slip', '2WD':'Rear-wheel drive · best economy', '4WDHigh':'Front + rear turning together', '4WDLow':'Low range · crawl speed, max torque' };
    function inclin(kind, deg){
      var body = kind === 'pitch'
        ? '<path d="M-40 6v-10l6-8h20v8h30l10 4v6z" fill="#c9d3e3"/><circle cx="-26" cy="8" r="6" fill="#1b1f27" stroke="#c9d3e3" stroke-width="2"/><circle cx="20" cy="8" r="6" fill="#1b1f27" stroke="#c9d3e3" stroke-width="2"/>'
        : '<path d="M-22 8v-14l6-12h32l6 12v14z" fill="#c9d3e3"/><rect x="-14" y="-16" width="28" height="9" rx="2" fill="#1b1f27"/><rect x="-27" y="4" width="9" height="12" rx="2" fill="#1b1f27"/><rect x="18" y="4" width="9" height="12" rx="2" fill="#1b1f27"/>';
      var ticks = '';
      for (var a = -40; a <= 40; a += 10){ var r = (a - 90) * Math.PI / 180, r2 = a % 20 ? 47 : 43; ticks += '<line x1="' + (52 * Math.cos(r)).toFixed(1) + '" y1="' + (52 * Math.sin(r)).toFixed(1) + '" x2="' + (r2 * Math.cos(r)).toFixed(1) + '" y2="' + (r2 * Math.sin(r)).toFixed(1) + '"/>'; }
      var warn = Math.abs(deg) >= 25;
      return '<div class="dm-inc"><svg viewBox="-60 -58 120 84" aria-hidden="true"><g stroke="#8b98b0" stroke-width="1">' + ticks + '</g>' +
        '<line x1="-56" y1="16" x2="56" y2="16" stroke="#3a4252" stroke-dasharray="3 4"/><g transform="rotate(' + deg + ')">' + body + '<line x1="0" y1="-24" x2="0" y2="-40" stroke="' + (warn ? '#f2c14e' : '#AAC5F0') + '" stroke-width="2"/></g></svg>' +
        '<b' + (warn ? ' class="w"' : '') + '>' + Math.abs(deg) + '°</b><span class="mut">' + (kind === 'pitch' ? 'Pitch · nose ' + (deg < 0 ? 'up' : 'down') : 'Roll · ' + (deg < 0 ? 'left' : 'right')) + '</span></div>';
    }
    function driveModeHTML(){
      var m = st.drive, dm = st.dm, sub = '', card = '', right = '';
      var modes = '<div class="dm-modes pn">' + [['Normal', 'truck'], ['Off-Road', 'offroad'], ['Eco', 'eco'], ['Tow', 'trailer']].map(function(x){ return '<button class="tb' + (m === x[0] ? ' on' : '') + '" data-drive="' + x[0] + '">' + I(x[1]) + x[0] + '</button>'; }).join('') + '</div>';
      var wd = '<div class="dm-wd">' + [['AUTO', ''], ['4WD', 'High'], ['4WD', 'Low'], ['2WD', '']].map(function(w){ var k = w[0] + w[1]; return '<button class="tb' + (st.wd === k ? ' on' : '') + '" data-wd="' + k + '">' + w[0] + (w[1] ? '<small>' + w[1] + '</small>' : '') + '</button>'; }).join('') + '</div>';
      function fuel(extra){ return '<div class="dm-energy pn"><div class="row"><span class="mut">Range</span><b>' + ({ Eco:330, Tow:214, 'Off-Road':268 }[m] || 312) + ' mi</b></div><div class="bar"><i style="width:78%"></i></div><div class="row"><span class="mut">Fuel 78%</span><span class="mut">' + (extra || m + ' mode') + '</span></div></div>'; }

      if (m === 'Normal'){
        sub = '<div class="dm-sub pn">' + dmTog('lock', 'Rear Differential Lock', dm.lock ? 'Locked · low speed only' : 'Open') + dmStep('Ride Height', RIDE[dm.ride], 'ride') + '</div>';
        card = fuel();
        right = wd + '<div class="dm-cap mut">' + WD_NOTE[st.wd] + '</div><div class="dm-chassis">' + wdChassis() + '<span style="left:30px;top:30px">35 psi</span><span style="right:30px;top:30px">35 psi</span><span style="left:30px;top:180px">35 psi</span><span style="right:30px;top:180px">35 psi</span></div>';
      }
      else if (m === 'Off-Road'){
        sub = '<div class="dm-sub pn">' + dmTog('lock', 'Rear Diff Lock', dm.lock ? 'Locked' : 'Open') + dmTog('hdc', 'Hill Descent Control', dm.hdc ? 'Holding ' + dm.hdcV + ' mph' : 'Off') + dmStep('Ride Height', RIDE[dm.ride], 'ride') + '</div>';
        card = '<div class="dm-terr pn"><span class="mut">Terrain</span><div>' + ['Mud', 'Sand', 'Rock', 'Snow'].map(function(t){ return '<button class="tb' + (dm.terrain === t ? ' on' : '') + '" data-dm="ter:' + t + '">' + t + '</button>'; }).join('') + '</div></div>';
        var trac = { Mud:[92, 88, 71, 81], Sand:[85, 83, 79, 80], Rock:[96, 70, 90, 94], Snow:[68, 72, 64, 70] }[dm.terrain];
        right = wd + '<div class="dm-incs">' + inclin('pitch', -8) + inclin('roll', 4) + '</div>' +
          '<div class="dm-read"><div><b>1,284</b><span>ft altitude</span></div><div><b>NW</b><span>heading</span></div><div><b>8° L</b><span>steering</span></div></div>' +
          '<div class="dm-trac"><span class="mut">Wheel traction</span>' + ['FL', 'FR', 'RL', 'RR'].map(function(n, i){ var v = trac[i]; return '<div><em>' + n + '</em><i><u style="width:' + v + '%' + (v < 75 ? ';background:#f2c14e' : '') + '"></u></i><small>' + v + '%</small></div>'; }).join('') + '</div>';
      }
      else if (m === 'Eco'){
        sub = '<div class="dm-sub pn">' + dmTog('ecoClim', 'Climate Eco', dm.ecoClim ? 'Fan and A/C eased' : 'Full comfort') + dmTog('stopstart', 'Auto Stop/Start', dm.stopstart ? 'Engine rests at stops' : 'Off') + dmTog('coach', 'Efficiency Coaching', dm.coach ? 'Tips on this screen' : 'Off') + '</div>';
        card = fuel('+' + (6 + (dm.ecoClim ? 6 : 0) + (dm.stopstart ? 6 : 0)) + ' mi from Eco');
        var mpg = 24.6, ang = -120 + (mpg - 10) / 20 * 240, R = 44;
        var arc = function(a0, a1){ var p0 = (a0 - 90) * Math.PI / 180, p1 = (a1 - 90) * Math.PI / 180; return 'M' + (R * Math.cos(p0)).toFixed(1) + ' ' + (R * Math.sin(p0)).toFixed(1) + 'A' + R + ' ' + R + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + (R * Math.cos(p1)).toFixed(1) + ' ' + (R * Math.sin(p1)).toFixed(1); };
        var trips = [19.2, 21.4, 20.1, 22.8, 23.5, 22.2, 24.6];
        right = wd + '<div class="dm-eco"><div class="dm-mpg"><svg viewBox="-54 -54 108 88" aria-hidden="true"><defs><linearGradient id="dmEco"><stop offset="0" stop-color="#596880"/><stop offset="1" stop-color="#5fd39a"/></linearGradient></defs><path d="' + arc(-120, 120) + '" fill="none" stroke="#2a303d" stroke-width="7" stroke-linecap="round"/><path d="' + arc(-120, ang) + '" fill="none" stroke="url(#dmEco)" stroke-width="7" stroke-linecap="round"/></svg>' +
          '<b>' + mpg + '</b><span class="mut">mpg now</span></div>' +
          '<div class="dm-cyl"><span class="mut">Dynamic Fuel Mgmt</span><div>' + [1, 0, 0, 1, 1, 0, 0, 1].map(function(c){ return '<i class="' + (c ? 'on' : '') + '"></i>'; }).join('') + '</div><b>4 of 8</b><span class="mut">cylinders firing</span></div></div>' +
          '<div class="dm-trips"><span class="mut">Last 7 trips · mpg</span><div>' + trips.map(function(v, i){ return '<i style="height:' + ((v - 16) / 10 * 100).toFixed(0) + '%" class="' + (i === 6 ? 'now' : '') + '"><small>' + v + '</small></i>'; }).join('') + '</div></div>' +
          (dm.coach ? '<div class="dm-tip">' + I('eco') + '<span>Exit in 1.1 mi. Lift now and coast to the ramp.</span></div>' : '');
      }
      else {
        var g = st.trl.gain, ok = st.trl.brake === 'ok', okc = ok ? '#5fd39a' : '#f2c14e';
        sub = '<div class="dm-sub pn">' + dmTog('haul', 'Tow/Haul Shift', dm.haul ? 'Holds gears longer' : 'Off') + dmTog('grade', 'Grade Braking', dm.grade ? 'Downshifts on descents' : 'Off') + dmStep('Brake Gain', g.toFixed(1), 'gain') + '</div>';
        card = '<button class="dm-tcard pn" data-vgo="trailer"><span class="ic">' + I('trailer') + '</span><span class="tx"><b>' + st.tprof + '</b><small>' + (st.tprof === 'Weekend Camper' ? '4,850 lbs · Electric brake' : 'Single axle · Bikes &amp; gear') + '</small></span><em class="' + (ok ? 'ok' : 'wn') + '">' + (ok ? 'Ready' : 'Check brake') + '</em>' + I('chev') + '</button>';
        right = wd + '<div class="dm-rig"><svg viewBox="0 0 280 124" aria-hidden="true">' +
            '<g fill="none" stroke="#c9d0db" stroke-width="1.3"><rect x="8" y="32" width="96" height="60" rx="12"/><path d="M36 32v60M70 36v52"/><rect x="138" y="20" width="134" height="84" rx="8"/></g>' +
            '<path d="M104 62h34" stroke="' + okc + '" stroke-width="2.4"/><circle cx="110" cy="62" r="4" fill="' + okc + '"/>' +
            '<g fill="#d8dde5"><rect x="18" y="24" width="18" height="8" rx="3"/><rect x="18" y="92" width="18" height="8" rx="3"/><rect x="76" y="24" width="18" height="8" rx="3"/><rect x="76" y="92" width="18" height="8" rx="3"/>' +
            '<rect x="186" y="12" width="18" height="8" rx="3"/><rect x="210" y="12" width="18" height="8" rx="3"/><rect x="186" y="104" width="18" height="8" rx="3"/><rect x="210" y="104" width="18" height="8" rx="3"/></g>' +
            '<g font-size="9" fill="#d5dbe5" font-family="Nunito Sans,sans-serif" text-anchor="middle"><text x="195" y="8">42</text><text x="219" y="8">41</text><text x="195" y="122">43</text><text x="219" y="122">42</text></g>' +
            '<text x="205" y="66" text-anchor="middle" font-size="10" fill="#8f9aab" font-family="Nunito Sans,sans-serif">' + (st.tprof === 'Weekend Camper' ? '4,850 lb' : 'Utility') + '</text></svg></div>' +
          '<div class="dm-read four"><div><b>' + g.toFixed(1) + '</b><span>brake gain</span></div><div><b>41–43</b><span>trailer psi</span></div><div><b' + (ok ? '' : ' class="w"') + '>' + (ok ? 'OK' : 'Check') + '</b><span>lights &amp; brake</span></div><div><b>128</b><span>mi this tow</span></div></div>' +
          '<div class="dm-tip neutral">' + I('ok') + '<span>Sway control armed · wider turns on map</span></div>' +
          '<button class="tb dm-hitch" data-nav="camera">' + I('cam') + 'Hitch &amp; trailer view</button>';
      }
      if (st.trailerCard && (m === 'Normal' || m === 'Tow')) card = '<div class="dm-trailer pn"><b>Trailer detected</b><span style="font-size:30px;color:#d8dee8;display:flex">' + I('trailer') + '</span><button class="tb" data-act="profile">view profile</button><a data-act="skip">Skip for now</a></div>';
      return '<div class="dm-l" data-m="' + m + '">' + modes + sub + card + '</div><div class="dm-r pn" data-m="' + m + '">' + right + '</div>';
    }
    host.addEventListener('click', function(e){
      var t = e.target.closest('[data-dm]'); if (!t || !host.contains(t)) return;
      var k = t.dataset.dm, dm = st.dm, msg;
      if (k.indexOf('ter:') === 0){ dm.terrain = k.slice(4); msg = I('mount') + dm.terrain + ' terrain'; }
      else if (k === 'ride-' || k === 'ride+'){ dm.ride = Math.max(0, Math.min(2, dm.ride + (k === 'ride+' ? 1 : -1))); msg = I('car') + 'Ride height ' + RIDE[dm.ride]; }
      else if (k === 'gain-' || k === 'gain+'){ st.trl.gain = Math.max(0, Math.min(10, st.trl.gain + (k === 'gain+' ? .5 : -.5))); msg = I('trailer') + 'Brake gain ' + st.trl.gain.toFixed(1); }
      else { dm[k] = !dm[k]; msg = I(k === 'lock' ? (dm.lock ? 'lock' : 'unlock') : 'ok') + t.getAttribute('aria-label') + (dm[k] ? ' on' : ' off'); }
      render(); showToast(msg);
    });

    function trailerHTML(){
      var t = st.trl, ok = t.brake === 'ok';
      var items = [['Trailer Connected', 'Secure'], ['7-Pin Connection', 'Secure'], ['Turn Signals', 'OK'], ['Taillights', 'OK'], ['Brake Lights', 'OK'], ['Trailer Brake', ok ? 'OK' : 'Needs Adjustment']];
      var trailerSvg = '<svg viewBox="0 0 220 110" aria-hidden="true"><defs><linearGradient id="trBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#b9c0c8"/></linearGradient></defs>' +
        '<ellipse cx="112" cy="96" rx="90" ry="6" fill="#000" opacity=".35"/><path d="M40 20 Q40 10 52 10 L186 10 Q198 10 198 22 L198 80 L40 80 Z" fill="url(#trBody)"/><path d="M40 40 L198 40" stroke="#8b96a6" stroke-width="2"/>' +
        '<rect x="60" y="48" width="34" height="18" rx="3" fill="#2a3446"/><rect x="150" y="46" width="24" height="34" rx="2" fill="#d7dce2" stroke="#8b96a6"/><path d="M40 72 L8 80" stroke="#6b7480" stroke-width="3"/>' +
        '<circle cx="118" cy="84" r="12" fill="#1b1d21"/><circle cx="146" cy="84" r="12" fill="#1b1d21"/><circle cx="118" cy="84" r="5" fill="#9aa1aa"/><circle cx="146" cy="84" r="5" fill="#9aa1aa"/></svg>';
      return '<div class="tr-l pn"><div class="tr-ban ' + (ok ? 'good' : 'warn') + '">' + I(ok ? 'ok' : 'warn') + (ok ? 'ALL GOOD' : 'Brake Adjustment Needed Before Towing') + '</div><h6>Trailer Status</h6>' +
        items.map(function(it, i){ var bad = i === 5 && !ok; return '<button class="tr-it' + (bad ? ' bad' : '') + '"' + (i === 5 ? ' data-trl="brake"' : '') + '><span class="ic">' + I(bad ? 'warn' : 'ok') + '</span>' + it[0] + '<em>' + it[1] + '</em>' + I('chev') + '</button>'; }).join('') + '</div>' +
        '<div class="tr-r pn"><div class="row"><h6>Active Trailer</h6><span class="ok">' + I('trailer') + 'Connected</span></div><b class="nm">' + st.tprof + '</b>' +
        '<p class="mut">' + (st.tprof === 'Weekend Camper' ? 'Travel Trailer • Dual Axle<br>4,850 lbs • Electric Brake' : 'Utility Trailer • Single Axle<br>Bikes &amp; outdoor gear') + '</p>' +
        '<div class="tr-tires"><span class="mut">' + I('ok') + ' All Tires Within Range (42–65 PSI)</span>' + trailerSvg +
        '<i style="left:8%;top:34%">42 <small>60 F</small></i><i style="right:6%;top:30%">41 <small>60 F</small></i><i style="left:12%;bottom:0">43 <small>60 F</small></i><i style="right:4%;bottom:4%">42 <small>60 F</small></i></div>' +
        '<div class="row b"><button class="tb" data-sysnav="towing">Edit Profile</button><button class="tb pri" data-trl="start">Start Towing ›</button></div></div>' +
        (t.modal ? '<div class="modal-bg" data-trl="close"></div><div class="pop tr-pop"><h5 style="display:block">Trailer Brake Setup</h5><p>Adjust the brake gain to set the braking force applied by the trailer’s electric brakes.</p>' +
          '<div class="tr-gain"><b>Brake Gain</b><span class="v">' + t.gain.toFixed(1) + '</span></div><div class="tr-sl"><span>0.0</span>' + rangeC('gain', t.gain * 10, 0, 100) + '<span>10.0</span></div>' +
          '<div class="row" style="grid-template-columns:1fr"><button class="tb" data-trl="auto">Switch to automatic<small>Adaptive Brake Gain</small></button><button class="tb pri" data-trl="save">Save</button></div></div>' : '');
    }

    var CONTACTS = [['Home', 'Mobile', '2:14 PM'], ['Grandma', 'Mobile', 'Yesterday'], ['Lake House Caretaker', 'Mobile', 'Yesterday'], ['Roadside Assistance', '24/7', 'Mon'], ['Dr. Patel', 'Office', 'Sep 28']];
    function phoneHTML(){
      if (st.call){
        var c = st.call;
        return '<div class="pc"><div class="pc-av">' + c.name.split(' ').map(function(w){ return w[0]; }).join('').slice(0, 2) + '</div><b>' + c.name + '</b><span class="pc-t" data-callt>' + (c.live ? fmtT((Date.now() - c.t0) / 1000) : 'Calling…') + '</span>' +
          '<div class="pc-ctl"><button class="' + (c.mute ? 'on' : '') + '" data-call="mute">' + I(c.mute ? 'micoff' : 'mic') + '<small>Mute</small></button><button data-call="keypad">' + I('keypad') + '<small>Keypad</small></button><button class="' + (c.spk ? 'on' : '') + '" data-call="spk">' + I('speak') + '<small>Speaker</small></button></div>' +
          '<button class="pc-end" data-call="end" aria-label="End call">' + I('call') + '</button></div>';
      }
      var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
      return '<div class="ph-l pn"><div class="segc wide">' + [['recents', 'Recents'], ['favorites', 'Favorites']].map(function(t){ return '<button data-ptab="' + t[0] + '" class="' + (st.ptab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        (st.ptab === 'recents' ? CONTACTS : CONTACTS.slice(0, 3)).map(function(c, i){ return '<button class="ph-c" data-callto="' + c[0] + '"><span class="av">' + c[0].split(' ').map(function(w){ return w[0]; }).join('').slice(0, 2) + '</span><span class="nm">' + c[0] + '<small>' + c[1] + '</small></span><span class="mut">' + c[2] + '</span>' + I('call') + '</button>'; }).join('') + '</div>' +
        '<div class="ph-r pn"><div class="ph-num">' + (st.dial || '<span class="mut">Enter a number</span>') + (st.dial ? '<button data-dial="del">⌫</button>' : '') + '</div><div class="ph-keys">' + keys.map(function(k){ return '<button data-dial="' + k + '">' + k + '</button>'; }).join('') + '</div>' +
        '<button class="ph-go" data-callto="' + (st.dial || '') + '"' + (st.dial ? '' : ' disabled') + '>' + I('call') + '</button></div>';
    }
    function fmtT(sec){ sec = Math.max(0, Math.floor(sec)); return ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2); }

    var CATS = [['profile', 'user', 'Profile'], ['display', 'sun2', 'Display'], ['sound', 'music', 'Sound'], ['assist', 'wheel', 'Driver Assistance'], ['towing', 'trailer', 'Towing'], ['vehicle', 'car', 'Vehicle'], ['system', 'info', 'System']];
    function settingsHTML(){
      var b = '', c = st.cat;
      if (c === 'profile') b = '<div class="sp-card"><span class="pc-av sm">M</span><div><b>Mark</b><small>Driver profile · seat, mirrors, climate and music restore when the truck unlocks</small></div></div>' +
        row('Active profile', null, segc('profile', st.profile, ['Mark', 'Guest'])) + row('Restore on unlock', 'Seat, mirrors, climate, last source', tog('walkLock', st.walkLock));
      else if (c === 'display') b = row('Brightness', st.bright + '%', rangeC('bright', st.bright, 20, 100)) + row('Appearance', null, segc('theme', st.theme, ['Auto', 'Night', 'Day'])) + row('Driver display view', 'Also on the steering-wheel roller', segc('view', ['Normal', 'Tow 1', 'Tow 2'][st.view], ['Normal', 'Tow 1', 'Tow 2']));
      else if (c === 'sound') b = row('Media volume', st.muted ? 'Muted' : String(st.vol), rangeC('vol', st.vol, 0, 30)) + row('Navigation prompts', 'Spoken turn-by-turn', tog('prompts', st.prompts)) + row('Alert chime', null, segc('chime', st.chime, ['Low', 'Med', 'High']));
      else if (c === 'assist') b = row('Lane Keep Assist', 'Also on the wheel: LANE', tog('lane', st.lane)) + row('Adaptive Cruise', 'Also on the wheel: ACC', tog('acc', st.acc)) + row('Follow distance', null, segc('follow', st.follow, [1, 2, 3, 4])) +
        row('Emergency vehicle alerts', 'Siren and lights detection with an action to take', tog('evAlert', st.evAlert)) + row('Fatigue monitoring', 'Offers a recovery route when signs appear', tog('fatigue', st.fatigue)) + row('Crosswind stability assist', null, tog('wind', st.wind));
      else if (c === 'towing') b = row('Trailer profile', null, segc('tprof', st.tprof === 'Weekend Camper' ? 'Camper' : 'Utility', ['Camper', 'Utility'])) + row('Trailer brake gain', st.trl.brake === 'ok' ? 'Set to ' + st.trl.gain.toFixed(1) : 'Needs adjustment', '<button class="tb sm" data-vgo="trailer">Adjust ›</button>') +
        row('Wider turn path guidance', 'Shown on the driver display while towing', tog('turnPath', st.turnPath));
      else if (c === 'vehicle') b = row('Distance units', null, segc('units', st.units, ['mi', 'km'])) + row('Tire pressure units', null, segc('psiU', st.psiU, ['psi', 'kPa'])) + row('Child lock', 'Rear doors', tog('childLock', st.childLock)) + row('Fold mirrors on lock', null, tog('mirrors', st.ctl.mirrors));
      else b = '<div class="sp-card"><span class="pc-av sm">' + I('info') + '</span><div><b>Silverado HMI · concept build</b><small>Figma concept by Lucia Liao &amp; Ashita Nichanametla, rebuilt in HTML/SVG. Proposed behavior, not deployed capability.</small></div></div>' +
        row('Over-the-air updates', 'Up to date', '<span class="mut">✓</span>') + row('Restart demo', 'Reset every setting in this cockpit', '<button class="tb sm" data-sysreset>Reset</button>');
      return '<div class="set-l pn">' + CATS.map(function(k){ return '<button data-cat="' + k[0] + '" class="' + (c === k[0] ? 'on' : '') + '">' + I(k[1]) + k[2] + '</button>'; }).join('') + '</div><div class="set-r pn"><h5>' + CATS.filter(function(k){ return k[0] === c; })[0][2] + '</h5>' + b + '</div>';
    }

    var ASK = [
      ['Find a rest stop', 'rest', 'Lakeview Travel Center is five minutes ahead, with fuel — a three-minute detour. Here are your options.', function(){ st.screen = 'map'; st.nav = 'huron'; st.popup = 'recovery'; st.panel = null; }],
      ['Set the cabin to 70°', 'fan', 'Setting both zones to 70° with A/C on.', function(){ st.tl = 70; st.tr = 70; st.off = false; st.ac = true; st.screen = 'climate'; }],
      ['Play music outside', 'speak', 'Switching to Outside Mode.', function(){ st.sound = 'outside'; st.popup = null; st.screen = 'music'; }],
      ['Open the tailgate', 'tailg', 'Opening the tailgate.', function(){ st.ctl.gate = true; st.screen = 'drive'; st.vtab = 'controls'; }],
      ['Check the trailer', 'trailer', 'One item needs attention: the trailer brake gain.', function(){ st.screen = 'drive'; st.vtab = 'trailer'; }],
      ['Call Home', 'call', 'Calling Home.', function(){ startCall('Home'); }]
    ];
    function asstHTML(){
      return '<div class="as"><button class="as-x" data-sys="asstclose" aria-label="Close">' + I('x') + '</button><div class="as-orb' + (st.asstBusy ? ' busy' : '') + '"><i></i><i></i><i></i><b></b></div>' +
        '<div class="as-log">' + (st.asstLog.length ? st.asstLog.map(function(m){ return '<p class="' + m[0] + '">' + m[1] + '</p>'; }).join('') : '<p class="hi">Hi Mark — what can I do?</p><p class="sub">Try one of these, or say “Hey Silverado”.</p>') + '</div>' +
        '<div class="as-chips">' + ASK.map(function(a, i){ return '<button data-ask="' + i + '">' + I(a[1]) + a[0] + '</button>'; }).join('') + '</div></div>';
    }
    function ccHTML(){
      var tiles = [['wifi', 'wifi', 'Wi-Fi', st.wifi], ['bt', 'bt', 'Bluetooth', st.bt], ['hot', 'hotspot', 'Hotspot', st.hot], ['dndOn', 'dnd', 'Do Not Disturb', st.dndOn],
        ['childLock', 'child', 'Child Lock', st.childLock], ['mirrors', 'mirror', 'Fold Mirrors', st.ctl.mirrors], ['hazard', 'haz', 'Hazard', st.hazard], ['dome', 'dome', 'Dome Light', st.ctl.dome],
        ['fdef', 'defF', 'Front Defrost', st.fdef], ['rdef', 'defR', 'Rear Defrost', st.rdef], ['gate', 'tailg', 'Tailgate', st.ctl.gate], ['clean', 'clean', 'Clean Screen', false]];
      return '<div class="cc-bg" data-sys="cc"></div><div class="cc"><div class="cc-grid">' + tiles.map(function(t){ return '<button class="' + (t[3] ? 'on' : '') + '" data-cc="' + t[0] + '">' + I(t[1]) + '<span>' + t[2] + '</span></button>'; }).join('') + '</div>' +
        '<div class="cc-sl"><label>' + I('sun2') + rangeC('bright', st.bright, 20, 100) + '</label><label>' + I('music') + rangeC('vol', st.vol, 0, 30) + '</label></div><span class="cc-h"></span></div>';
    }
    function startCall(name){ st.call = { name:name, t0:Date.now(), live:false, mute:false, spk:true }; st.screen = 'phone'; setTimeout(function(){ if (st.call && st.call.name === name){ st.call.live = true; st.call.t0 = Date.now(); render(); } }, 1600); }
    setInterval(function(){ if (st.call && st.call.live){ var el = cdBody.querySelector('[data-callt]'); if (el) el.textContent = fmtT((Date.now() - st.call.t0) / 1000); } }, 1000);
    function screenHTML(){
      var s = st.screen;
      if (s === 'home'){
        var conf = '';
        if (st.milestone && !RM){ var R = rng(4), cols = ['#f2c14e', '#6ea0ff', '#e7ecf4', '#c79a52', '#8a5cff']; conf = '<div class="confetti">'; for (var i = 0; i < 26; i++) conf += '<i style="left:' + (R() * 100).toFixed(1) + '%;background:' + cols[i % 5] + ';animation-duration:' + (2.6 + R() * 2.4).toFixed(2) + 's;animation-delay:-' + (R() * 4).toFixed(2) + 's"></i>'; conf += '</div>'; }
        return (st.milestone ? '<div class="milestone"><span class="badge">10K</span>Mileage Milestone Unlocked<em>10,000 total miles reached</em></div>' + conf : '') +
          '<div class="hm-tiles pn">' + [['map', 'pin', 'Maps'], ['music', 'music', 'Audio'], ['phone', 'phone', 'Phone'], ['drive', 'car', 'Drive mode'], ['asst', 'info', 'Assistant'], ['settings', 'gear', 'Settings']].map(function(t){ return '<button class="tb" ' + (t[0] === 'asst' ? 'data-sys="asst"' : 'data-nav="' + t[0] + '"') + '>' + I(t[1]) + t[2] + '</button>'; }).join('') + '</div>' +
          '<div class="hm-right" style="' + (st.milestone ? 'top:44px' : '') + '"><div class="hm-time">12:47</div><div class="hm-greet">Good Afternoon</div><img class="hm-truck" src="assets/gm/truck.png" alt="" draggable="false">' +
          '<div class="hm-cards"><div class="pn">65°F<small>Outdoors</small></div><div class="pn">' + I('cloud') + '<small>Cloudy</small></div><button class="tb hm-lock" data-act="lock"><span class="' + (st.locked ? 'on' : '') + '">' + I('lock') + '</span><span class="' + (st.locked ? '' : 'on') + '">' + I('unlock') + '</span></button></div>' +
          '<div class="mini-player pn"><span class="disc"></span><div class="t">Blinding Lights<small>The Weeknd</small></div><button class="pbtn">' + I('prev') + '</button><button class="pbtn big" data-act="play">' + I(st.playing ? 'pause' : 'play') + '</button><button class="pbtn">' + I('next') + '</button></div></div>';
      }
      if (s === 'climate'){
        var f = st.off ? 0 : st.fan, dur = (1.6 - f * .18).toFixed(2) + 's';
        var flows = '';
        if (!st.off){
          var sp = (2.2 - f * .22).toFixed(2) + 's';
          flows = '<g class="cm-flow2" style="--d:' + sp + '">' +
            '<path d="M232 128 C214 92 168 84 134 104 C112 118 104 146 112 176" stroke="url(#ckFlowB)" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/>' +
            '<path class="mv" d="M232 128 C214 92 168 84 134 104 C112 118 104 146 112 176" stroke="#cfe0ff" stroke-width="2" fill="none" stroke-dasharray="8 14"/>' +
            '<path d="M104 170 L112 186 L122 168z" fill="#4f84f0"/>' +
            '<path d="M214 136 C190 122 160 132 150 160 C146 172 148 184 152 194" stroke="url(#ckFlowB)" stroke-width="12" fill="none" stroke-linecap="round" opacity=".45"/>' +
            '<path class="mv" d="M214 136 C190 122 160 132 150 160 C146 172 148 184 152 194" stroke="#cfe0ff" stroke-width="1.6" fill="none" stroke-dasharray="7 12"/>' +
            '<path d="M380 128 C398 92 444 84 478 104 C500 118 508 146 500 176" stroke="url(#ckFlowW)" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/>' +
            '<path class="mv" d="M380 128 C398 92 444 84 478 104 C500 118 508 146 500 176" stroke="#fff1dc" stroke-width="2" fill="none" stroke-dasharray="8 14"/>' +
            '<path d="M490 168 L500 186 L508 168z" fill="#d9a35e"/>' +
            '<path d="M398 136 C422 122 452 132 462 160 C466 172 464 184 460 194" stroke="url(#ckFlowW)" stroke-width="12" fill="none" stroke-linecap="round" opacity=".45"/>' +
            '<path class="mv" d="M398 136 C422 122 452 132 462 160 C466 172 464 184 460 194" stroke="#fff1dc" stroke-width="1.6" fill="none" stroke-dasharray="7 12"/></g>';
        }
        return '<div class="' + (st.off ? 'cm-off' : '') + '"><div class="cm-view"><svg viewBox="0 0 612 236" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<rect width="612" height="236" fill="#1b1e23"/>' +
          '<path d="M40 0 H572 L596 96 Q306 70 16 96z" fill="url(#ckWind)"/>' + (st.fdef ? '<path d="M40 0 H572 L596 96 Q306 70 16 96z" fill="#ffcf8f" opacity=".28"/>' : '') +
          '<path d="M300 0 h12 v14 h-12z" fill="#2a2d33"/><rect x="286" y="12" width="40" height="10" rx="3" fill="#2a2d33"/>' +
          '<path d="M0 0 L40 0 L16 96 L0 100z M612 0 L572 0 L596 96 L612 100z" fill="#24272c"/>' +
          '<path d="M0 100 Q306 66 612 100 L612 236 L0 236z" fill="url(#ckDashG)"/>' +
          '<path d="M0 100 Q306 66 612 100" stroke="#4a4f58" stroke-width="1.5" fill="none"/>' +
          '<path d="M70 104 Q150 84 240 92 L236 122 Q150 116 74 132z" fill="#121418"/><rect x="104" y="98" width="110" height="20" rx="5" fill="#0d1a2c"/><rect x="108" y="101" width="102" height="14" rx="3" fill="#1f3b63" opacity=".8"/>' +
          '<rect x="252" y="96" width="108" height="64" rx="7" fill="#0d0f13" stroke="#3a3f47"/><rect x="257" y="101" width="98" height="54" rx="4" fill="#1d2534"/><rect x="262" y="106" width="40" height="44" rx="3" fill="#2a3446"/><rect x="306" y="106" width="44" height="20" rx="3" fill="#2a3446"/><rect x="306" y="130" width="44" height="20" rx="3" fill="#2a3446"/>' +
          '<g fill="#0c0d10"><rect x="262" y="168" width="34" height="14" rx="4"/><rect x="316" y="168" width="34" height="14" rx="4"/></g><g stroke="#30343b" stroke-width="1.2">' + [171, 175, 179].map(function(y){ return '<line x1="265" y1="' + y + '" x2="293" y2="' + y + '"/><line x1="319" y1="' + y + '" x2="347" y2="' + y + '"/>'; }).join('') + '</g>' +
          '<g fill="#0c0d10"><rect x="70" y="142" width="30" height="13" rx="4"/><rect x="512" y="142" width="30" height="13" rx="4"/></g>' +
          '<path d="M232 236 L248 188 L364 188 L380 236z" fill="#15171b"/><circle cx="306" cy="214" r="10" fill="#2a2d33" stroke="#4a4f58"/>' +
          '<g transform="translate(158 160)"><circle r="62" fill="none" stroke="#0f1013" stroke-width="13"/><circle r="62" fill="none" stroke="#2c2f35" stroke-width="1"/><path d="M-60 6 Q-30 12 -16 8 L16 8 Q30 12 60 6 M0 22 V58" stroke="#0f1013" stroke-width="11" fill="none"/>' +
          '<rect x="-24" y="-12" width="48" height="36" rx="12" fill="#17191d" stroke="#2c2f35"/><path d="M-12 4 h24" stroke="#4a4e56" stroke-width="2.5"/></g>' +
          '<path d="M400 236 Q420 200 470 196 L612 196 L612 236z" fill="#121418"/>' +
          flows + '</svg>' +
          '<span class="cm-back">Back Seat ▾</span>' +
          '<div class="cm-temp l" style="--h:' + ((st.tl - 60) / 25 * 100).toFixed(0) + '%"><span>HI</span><i></i><b>' + st.tl + '°</b><span>LO</span></div>' +
          '<div class="cm-temp r" style="--h:' + ((st.tr - 60) / 25 * 100).toFixed(0) + '%"><span>HI</span><i></i><b>' + st.tr + '°</b><span>LO</span></div></div>' +
          '<div class="cm-ctrl"><div class="cm-vents pn"><button class="tb on">' + I('ventF') + '</button><button class="tb' + (st.fdef ? ' on' : '') + '" data-act="fdef">' + I('defF') + '</button><button class="tb">' + I('ventD') + '</button><button class="tb' + (st.rdef ? ' on' : '') + '" data-act="rdef">' + I('defR') + '</button></div>' +
          '<div class="cm-mid pn"><div class="cm-fan" style="--f:' + (f / 7 * 100).toFixed(0) + '%"><i></i><button data-act="fan-">−</button><span>' + I('fan') + '</span><button data-act="fan+">+</button></div>' +
          '<div class="cm-row"><button class="tb' + (st.seatL ? ' on' : '') + '" data-act="seatL">' + I('seatheat') + '</button><button class="tb' + (st.auto ? ' on' : '') + '" data-act="auto">AUTO</button><button class="tb pw' + (st.off ? '' : ' on') + '" data-act="off">' + I('power') + '</button><button class="tb' + (st.ac ? ' on' : '') + '" data-act="ac">A/C</button><button class="tb' + (st.seatR ? ' on' : '') + '" data-act="seatR">' + I('seatheat') + '</button></div></div>' +
          '<div class="cm-aq pn">Air Quality<svg viewBox="0 0 66 66"><circle cx="33" cy="33" r="27" fill="none" stroke="#3a4252" stroke-width="3"/><circle cx="33" cy="33" r="27" fill="none" stroke="#5fd39a" stroke-width="3" stroke-dasharray="40 200" transform="rotate(130 33 33)"/><text x="33" y="40" text-anchor="middle" fill="#fff" font-size="20" font-family="Nunito Sans,sans-serif">17</text></svg></div></div></div>';
      }
      if (s === 'drive'){
        var seg = '<div class="seg" style="--i:' + ['mode', 'controls', 'trailer'].indexOf(st.vtab) + '"><i></i>' + [['mode', 'Drive Mode'], ['controls', 'Quick Controls'], ['trailer', 'Trailer']].map(function(v){ return '<button data-vtab="' + v[0] + '" class="' + (st.vtab === v[0] ? 'on' : '') + '">' + v[1] + (v[0] === 'trailer' && st.trl.brake === 'adjust' ? '<em class="dot"></em>' : '') + '</button>'; }).join('') + '</div>';
        if (st.vtab === 'controls') return seg + controlsHTML();
        if (st.vtab === 'trailer') return seg + trailerHTML();
        return seg + driveModeHTML();
      }
      if (s === 'phone') return phoneHTML();
      if (s === 'settings') return settingsHTML();
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
        return '<div class="sp-l"><div class="stab"><img src="assets/gm/truck.png" alt="" draggable="false"><svg viewBox="0 0 282 170" aria-hidden="true"><path d="M100 24 H76 V70" stroke="#5fd39a" fill="none"/><circle cx="76" cy="72" r="3" fill="#5fd39a"/><path d="M146 150 H118 V128" stroke="#5fd39a" fill="none"/><circle cx="118" cy="126" r="3" fill="#5fd39a"/></svg><span style="left:104px;top:16px">Chassis Control Active</span><span style="left:150px;top:142px">Steering Assist Active</span></div>' +
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
      var sk = key + (key === 'drive' ? st.vtab : key === 'settings' ? st.cat : '');
      cdBody.innerHTML = '<div class="cd-screen' + (st.screen === 'home' && st.milestone ? ' ms' : '') + '"' + (sk === lastScreen ? ' style="animation:none"' : '') + '>' + screenHTML() + '</div>' +
        (st.asst ? asstHTML() : '') + (st.cc ? ccHTML() : '') + (st.clean ? '<button class="clean" data-cc="clean"><b>Screen cleaning</b><span>Touch is paused · tap here to exit</span></button>' : '');
      key = sk;
      cd.style.filter = 'brightness(' + (.55 + st.bright / 100 * .45).toFixed(3) + ')' + (st.theme === 'Day' ? ' saturate(.9) contrast(.95)' : '');
      cd.classList.toggle('t-day', st.theme === 'Day');
      cdStatus.querySelector('.sb-wifi').style.opacity = st.wifi ? 1 : .25; cdStatus.querySelector('.sb-bt').style.opacity = st.bt ? 1 : .25;
      cdStatus.querySelector('.sb-grid').classList.toggle('on', st.cc); cdStatus.querySelector('.sb-mic').classList.toggle('on', st.asst);
      lastScreen = key;
      [].forEach.call(cdNav.children, function(b){ b.classList.toggle('on', b.dataset.nav === navKey(st.screen)); });
    }
    function showToast(html){
      toast.innerHTML = html; toast.classList.add('on'); cdStatus.classList.add('island');
      clearTimeout(showToast._t); showToast._t = setTimeout(function(){ cdStatus.classList.remove('island'); }, 1700);
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
      if (d.drive){ if (st.drive !== d.drive){ st.wd = DM_DEFAULT[d.drive].wd; st.dm.ride = DM_DEFAULT[d.drive].ride; } st.drive = d.drive; st.mode = d.drive === 'Tow' ? 'TOW MODE' : d.drive; st.left = d.drive === 'Tow' ? 'trailer' : null; render(); showToast(I('car') + d.drive + ' mode'); return; }
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
        if (d.w === 'voice'){ st.asst = true; st.cc = false; st.asstLog = []; render(); return; }
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

    /* ================= complete system: handlers ================= */
    var SET_TOGGLE = { lane:1, acc:1, prompts:1, evAlert:1, fatigue:1, wind:1, turnPath:1, walkLock:1, childLock:1 };
    function setVal(k, v){
      if (k === 'view'){ st.view = ['Normal', 'Tow 1', 'Tow 2'].indexOf(v); }
      else if (k === 'tprof'){ st.tprof = v === 'Camper' ? 'Weekend Camper' : 'Utility Trailer'; }
      else if (k === 'follow'){ st.follow = +v; }
      else st[k] = v;
    }
    function ask(i){
      var a = ASK[i]; if (st.asstBusy) return;
      st.asstLog = [['me', a[0]]]; st.asstBusy = true; render();
      setTimeout(function(){ st.asstLog.push(['ai', a[2]]); st.asstBusy = false; render(); }, 700);
      setTimeout(function(){ if (!st.asst) return; st.asst = false; a[3](); render(); }, 2000);
    }
    host.addEventListener('click', function(e){
      var t = e.target.closest('[data-sys],[data-vtab],[data-ctl],[data-trl],[data-ptab],[data-callto],[data-call],[data-dial],[data-cat],[data-set],[data-setv],[data-ask],[data-cc],[data-vgo],[data-sysnav],[data-sysreset],[data-full],[data-focus]');
      if (!t || !host.contains(t)) return;
      var d = t.dataset;
      if (st.clean && d.cc !== 'clean') return;
      if (d.full != null){ setFull(!full); return; }
      if (d.focus != null){ canvas.classList.toggle('focus'); t.classList.toggle('on'); return; }
      if (d.sys === 'asst'){ st.asst = !st.asst; st.cc = false; st.asstLog = []; render(); return; }
      if (d.sys === 'asstclose'){ st.asst = false; render(); return; }
      if (d.sys === 'cc'){ st.cc = !st.cc; st.asst = false; render(); return; }
      if (d.sys === 'profile'){ st.screen = 'settings'; st.cat = 'profile'; st.cc = false; render(); return; }
      if (d.vtab){ st.vtab = d.vtab; render(); return; }
      if (d.vgo){ st.screen = 'drive'; st.vtab = d.vgo; render(); return; }
      if (d.sysnav){ st.screen = 'settings'; st.cat = d.sysnav; render(); return; }
      if (d.ctl){
        var c = st.ctl, k = d.ctl;
        if (k === 'lights') c.lights = { Auto:'On', On:'Off', Off:'Auto' }[c.lights];
        else if (k === 'wipers') c.wipers = (c.wipers + 1) % 4;
        else c[k] = !c[k];
        render();
        showToast(I({ lights:'headl', mirrors:'mirror', wipers:'wiper', dome:'dome', bed:'bed', gate:'tailg' }[k]) + ({ lights:'Lights ' + c.lights, mirrors:c.mirrors ? 'Mirrors folded' : 'Mirrors open', wipers:'Wipers ' + ['off', 'auto', 'low', 'high'][c.wipers],
          dome:'Dome light ' + (c.dome ? 'on' : 'off'), bed:'Bed light ' + (c.bed ? 'on' : 'off'), gate:c.gate ? 'Tailgate open' : 'Tailgate closed' }[k]));
        if (k === 'gate' && c.gate && st.sound !== 'outside') setTimeout(function(){ st.screen = 'music'; st.popup = 'tailgate'; render(); }, 900);
        return;
      }
      if (d.trl){
        var tr = st.trl;
        if (d.trl === 'brake'){ tr.modal = true; }
        else if (d.trl === 'close'){ tr.modal = false; }
        else if (d.trl === 'auto'){ tr.gain = 5.5; showToast(I('ok') + 'Adaptive brake gain'); }
        else if (d.trl === 'save'){ tr.modal = false; tr.brake = 'ok'; showToast(I('ok') + 'Trailer brake gain ' + tr.gain.toFixed(1) + ' · All good'); }
        else if (d.trl === 'start'){
          if (tr.brake !== 'ok'){ tr.modal = true; showToast(I('warn') + 'Adjust the trailer brake first'); }
          else { st.drive = 'Tow'; st.mode = 'TOW MODE'; st.left = 'trailer'; st.vtab = 'mode'; showToast(I('trailer') + 'Tow mode · drive safe'); }
        }
        render(); return;
      }
      if (d.ptab){ st.ptab = d.ptab; render(); return; }
      if (d.dial){ st.dial = d.dial === 'del' ? st.dial.slice(0, -1) : (st.dial + d.dial).slice(0, 14); render(); return; }
      if (d.callto != null){ if (!d.callto) return; startCall(d.callto); st.dial = ''; render(); return; }
      if (d.call){ var cl = st.call; if (!cl) return;
        if (d.call === 'end'){ st.call = null; showToast(I('call') + 'Call ended'); }
        else if (d.call === 'mute') cl.mute = !cl.mute; else if (d.call === 'spk') cl.spk = !cl.spk; else showToast(I('keypad') + 'Keypad');
        render(); return; }
      if (d.cat){ st.cat = d.cat; render(); return; }
      if (d.set){ var key = d.set;
        if (key === 'mirrors') st.ctl.mirrors = !st.ctl.mirrors; else st[key] = !st[key];
        render(); return; }
      if (d.setv){ setVal(d.setv, d.v); render(); return; }
      if (d.ask != null){ ask(+d.ask); return; }
      if (d.sysreset != null){ location.reload(); return; }
      if (d.cc){ var k2 = d.cc;
        if (k2 === 'clean'){ st.clean = !st.clean; st.cc = false; }
        else if (k2 === 'mirrors' || k2 === 'dome' || k2 === 'gate'){ st.ctl[k2] = !st.ctl[k2]; if (k2 === 'gate' && st.ctl.gate && st.sound !== 'outside'){ st.cc = false; st.screen = 'music'; st.popup = 'tailgate'; } }
        else st[k2] = !st[k2];
        render(); return; }
    });
    host.addEventListener('input', function(e){
      var r = e.target.closest('[data-range]'); if (!r) return;
      var k = r.dataset.range, v = +r.value;
      r.style.setProperty('--p', ((v - r.min) / (r.max - r.min) * 100).toFixed(0) + '%');
      if (k === 'gain'){ st.trl.gain = Math.round(v / 5) / 2; var vv = cdBody.querySelector('.tr-gain .v'); if (vv) vv.textContent = st.trl.gain.toFixed(1); return; }
      if (k === 'bright'){ st.bright = v; cd.style.filter = 'brightness(' + (.55 + v / 100 * .45).toFixed(3) + ')'; return; }
      if (k === 'vol'){ st.vol = v; st.muted = false; renderBar(); return; }
    });
    host.addEventListener('change', function(e){ if (e.target.closest('[data-range]')) render(); });

    /* full-screen exploration: lock the page scroll and freeze the scroll story */
    var full = false;
    function setFull(on){
      full = on; sec.classList.toggle('full', on);
      document.documentElement.style.overflow = on ? 'hidden' : '';
      if (!on) canvas.classList.remove('focus');
      [].forEach.call(host.querySelectorAll('[data-full]'), function(b){ b.innerHTML = on ? I('shrink') + 'Exit full screen' : I('expand') + 'Explore the full system'; });
      setTimeout(fit, 30);
    }
    addEventListener('keydown', function(e){ if (e.key === 'Escape' && full) setFull(false); });
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
      if (!api.near(sec, .2) || full) return;
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
