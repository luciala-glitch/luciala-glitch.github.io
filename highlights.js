// Project highlights: one pinned WebGL stage, five scroll-driven chapters.
// Silverado: stylized pickup → camera passes through the windshield → cockpit screens follow the towing flow.
(() => {
const section = document.querySelector('.highlights');
if (!section) return;
const canvas = section.querySelector('#hl-canvas');
const chapters = [...section.querySelectorAll('.hl-chapter')];
const dots = [...section.querySelectorAll('.hl-index button')];
const caption = section.querySelector('#hl-caption');
const fade = section.querySelector('.hl-fade');
const bar = section.querySelector('.hl-progress i');
const WEIGHTS = [2.6, 1.3, 1.2, 1.1, 1.1];
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0);
const STARTS = WEIGHTS.map((_, i) => WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
section.style.setProperty('--hl-height', `${TOTAL * 100 + 100}vh`);

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const span = (t, a, b) => ease(clamp((t - a) / (b - a)));

// ---------- scroll state (works with or without WebGL) ----------
const state = {chapter: 0, t: 0, visible: false};
function readScroll() {
  const box = section.getBoundingClientRect();
  const p = clamp(-box.top / (box.height - innerHeight));
  const s = p * TOTAL;
  let c = STARTS.findLastIndex(start => s >= start);
  c = clamp(c, 0, WEIGHTS.length - 1);
  state.chapter = c; state.t = clamp((s - STARTS[c]) / WEIGHTS[c]);
  chapters.forEach((el, i) => el.classList.toggle('active', i === c));
  dots.forEach((el, i) => el.setAttribute('aria-current', String(i === c)));
  if (bar) bar.style.transform = `scaleX(${p})`;
  // dip to black around each chapter boundary
  const d = Math.min(...STARTS.slice(1).map(b => Math.abs(s - b)));
  const blink = c === 0 ? clamp(1 - Math.abs(state.t - .585) / .035) : 0;
  if (fade) fade.style.opacity = Math.max(clamp(1 - d / .14), blink).toFixed(3);
  if (caption) caption.textContent = captionFor(c, state.t);
}
function captionFor(c, t) {
  if (c === 0) {
    if (t < .42) return 'EXTERIOR · STYLIZED MODEL';
    if (t < .62) return 'INTO THE CAB';
    return ['01 · DRIVE MODE', '02 · TRAILER DETECTED → OPEN PROFILE', '03 · TRAILER PROFILE → START TOWING', '04 · TOW MODE · CLUSTER ADAPTS'][gmStep(t)];
  }
  if (c === 1) return ['01 · FIND A MACHINE', '02 · CHECK WHAT IT REQUIRES', '03 · ARRIVE WITH TRAINING DONE'][Math.min(2, Math.floor(t * 3))];
  if (c === 2) return 'PORTFOLIO → PROJECT → APQP · ONE SELECTED PROJECT';
  if (c === 3) return 'SIGNED LONG-AXIS · BLIND REPEAT READINGS';
  return 'SYNTHETIC RUNS · DURATION × FIRST EVENT × GAP';
}
const gmStep = t => t < .72 ? 0 : t < .81 ? 1 : t < .9 ? 2 : 3;
dots.forEach((dot, i) => dot.addEventListener('click', () => {
  const top = section.offsetTop + (STARTS[i] + .02) / TOTAL * (section.offsetHeight - innerHeight);
  window.__lenis ? window.__lenis.scrollTo(top, {duration: 1.6}) : scrollTo({top, behavior: reduced ? 'auto' : 'smooth'});
}));
let queued = false;
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; readScroll(); }); } }, {passive: true});
addEventListener('resize', readScroll);
readScroll();

// ---------- lazy-load three.js ----------
const supportsGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!supportsGL) { section.classList.add('no-webgl'); return; }
new IntersectionObserver((entries, io) => {
  if (!entries[0].isIntersecting) return;
  io.disconnect();
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = () => { try { init(window.THREE); } catch (err) { console.error(err); section.classList.add('no-webgl'); } };
  s.onerror = () => section.classList.add('no-webgl');
  document.head.append(s);
}, {rootMargin: '150% 0px'}).observe(section);
new IntersectionObserver(e => state.visible = e[0].isIntersecting).observe(section);

function init(THREE) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.setClearColor(0x0b0c10);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0c10, 14, 42);
  const camera = new THREE.PerspectiveCamera(38, 1, .03, 120);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const loader = new THREE.TextureLoader();
  const tex = url => loader.load(url, t => { t.encoding = THREE.sRGBEncoding; t.anisotropy = maxAniso; });

  // studio environment for reflections: dark room with a few soft light panels
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x07080b);
  [[0, 6, 0, 10, .2, 4, 0xffffff], [-6, 2, 3, .2, 2, 6, 0x7f95ff], [6, 2, -3, .2, 2, 6, 0xffb49e], [0, 2, -7, 8, 2, .2, 0xffffff]].forEach(([x, y, z, w, h, d, c]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({color: c}));
    m.position.set(x, y, z); envScene.add(m);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, .04).texture;

  const hemi = new THREE.HemisphereLight(0xdedcd6, 0x121110, .55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(6, 9, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xe6e4de, 1.6); rim.position.set(-7, 3, -6); scene.add(rim);
  const warm = new THREE.PointLight(0xff5b1f, 1.4, 22); warm.position.set(5, 1.5, -5); scene.add(warm);

  const screenMat = url => new THREE.MeshBasicMaterial({map: tex(url), toneMapped: false});
  const groups = [buildTruck(), buildPhones(), buildGear(), buildNorthern(), buildOxylus()];
  groups.forEach(g => { g.group.visible = false; scene.add(g.group); });

  // ----- 01 Silverado: stylized pickup + cockpit -----
  function buildTruck() {
    const group = new THREE.Group(), exterior = new THREE.Group(); group.add(exterior);
    const s = new THREE.Shape();
    s.moveTo(-2.9, .48); s.lineTo(-2.9, 1.2); s.lineTo(-1.0, 1.22); s.lineTo(-.98, 1.9);
    s.quadraticCurveTo(-.92, 1.99, -.72, 1.99); s.lineTo(.55, 1.98); s.lineTo(1.25, 1.42); s.lineTo(2.2, 1.36); s.lineTo(2.75, 1.3);
    s.quadraticCurveTo(2.98, 1.28, 2.98, 1.05); s.lineTo(3.0, .55); s.lineTo(2.85, .42); s.lineTo(2.35, .42);
    s.absarc(1.75, .42, .58, 0, Math.PI, false); s.lineTo(-1.27, .42);
    s.absarc(-1.85, .42, .58, 0, Math.PI, false); s.lineTo(-2.9, .42);
    const bodyGeo = new THREE.ExtrudeGeometry(s, {depth: 1.84, bevelEnabled: true, bevelThickness: .06, bevelSize: .04, bevelSegments: 4, curveSegments: 20});
    bodyGeo.translate(0, 0, -.92);
    // Engineering-model look: dark body, instrument-blue edges.
    const paint = new THREE.MeshStandardMaterial({color: 0x06080c, metalness: .3, roughness: .62, envMapIntensity: .22});
    exterior.add(new THREE.Mesh(bodyGeo, paint));
    const edgeMat = new THREE.LineBasicMaterial({color: 0xff5b1f, toneMapped: false});
    const edges = geo => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edgeMat);
    exterior.add(edges(bodyGeo));
    const black = new THREE.MeshStandardMaterial({color: 0x0d0e11, roughness: .55, metalness: .3});
    const glass = new THREE.MeshPhysicalMaterial({color: 0x10173a, metalness: .9, roughness: .08, transparent: true, opacity: .55, side: THREE.DoubleSide});
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); exterior.add(m); return m; };
    add(new THREE.BoxGeometry(1.8, .02, 1.62), black, -1.95, 1.27, 0); // bed opening
    const side = new THREE.Shape(); side.moveTo(-.86, 1.36); side.lineTo(-.86, 1.86); side.lineTo(.5, 1.9); side.lineTo(1.12, 1.42); side.closePath();
    add(new THREE.ShapeGeometry(side), glass, 0, 0, 1.0);
    add(new THREE.ShapeGeometry(side), glass, 0, 0, -1.0);
    const ws = new THREE.PlaneGeometry(.86, 1.66); ws.rotateX(Math.PI / 2);
    const windshield = add(ws, glass, .94, 1.75, 0); windshield.rotation.z = Math.atan2(-.56, .7);
    const rw = new THREE.PlaneGeometry(1.4, .36); rw.rotateY(Math.PI / 2); add(rw, glass, -1.06, 1.62, 0);
    add(new THREE.BoxGeometry(.06, .4, 1.5), black, 3.02, .86, 0); // grille
    const lamp = new THREE.MeshBasicMaterial({color: 0xe6eeff, toneMapped: false});
    [-.66, .66].forEach(z => add(new THREE.BoxGeometry(.05, .06, .44), lamp, 3.0, 1.13, z));
    const tail = new THREE.MeshBasicMaterial({color: 0xff5b1f, toneMapped: false});
    [-.84, .84].forEach(z => add(new THREE.BoxGeometry(.04, .3, .12), tail, -2.96, 1.0, z));
    [-1.12, 1.12].forEach(z => add(new THREE.BoxGeometry(.12, .16, .2), black, 1.05, 1.47, z)); // mirrors
    add(new THREE.BoxGeometry(2.0, .05, .08), black, -.05, .52, 1.02); // running boards
    add(new THREE.BoxGeometry(2.0, .05, .08), black, -.05, .52, -1.02);
    const tire = new THREE.MeshStandardMaterial({color: 0x101113, roughness: .92});
    const rimMat = new THREE.MeshStandardMaterial({color: 0x0b0d12, metalness: .5, roughness: .5});
    const tireGeo = new THREE.CylinderGeometry(.47, .47, .34, 40); tireGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(.29, .29, .36, 6); rimGeo.rotateX(Math.PI / 2);
    [1.75, -1.85].forEach(x => [-.8, .8].forEach(z => { add(tireGeo, tire, x, .47, z); add(rimGeo, rimMat, x, .47, z); const e = edges(tireGeo); e.position.set(x, .47, z); exterior.add(e); }));
    // ground: soft contact shadow + faint grid
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const sc = shadowCanvas.getContext('2d'), grad = sc.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,.85)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = grad; sc.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3.6), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false}));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .005; group.add(shadow);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({color: 0x050608, roughness: 1, metalness: 0}));
    ground.rotation.x = -Math.PI / 2; group.add(ground);
    const grid = new THREE.GridHelper(60, 60, 0x3154ff, 0x1a1d27); grid.position.y = .003; grid.material.transparent = true; grid.material.opacity = .32; group.add(grid);

    // cabin interior (BackSide shell is only visible from inside)
    const cabin = new THREE.Group(); group.add(cabin);
    const shell = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.0, 1.8), new THREE.MeshStandardMaterial({color: 0x08090c, roughness: 1, side: THREE.BackSide}));
    shell.position.set(.12, 1.46, 0); cabin.add(shell);
    const trim = new THREE.MeshStandardMaterial({color: 0x0f1115, roughness: .7, metalness: .1, envMapIntensity: .3});
    const dash = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, 1.76), trim); dash.position.set(1.14, 1.16, 0); cabin.add(dash);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(.2, .07, .66), trim); hood.position.set(.92, 1.5, -.45); cabin.add(hood);
    const plane = (w, h) => { const g = new THREE.PlaneGeometry(w, h); g.rotateY(-Math.PI / 2); return g; };
    const states = ['home', 'detected', 'trailer', 'tow'];
    const clusterMats = states.map(n => screenMat(`assets/hl/cluster-${n}.webp`));
    const centerMats = ['home', 'detected', 'trailer', 'trailer'].map(n => screenMat(`assets/hl/center-${n}.webp`));
    const cluster = new THREE.Mesh(plane(.56, .21), clusterMats[0]); cluster.position.set(.84, 1.37, -.45); cabin.add(cluster);
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(.03, .34, .44), trim); bezel.position.set(.86, 1.21, .03); bezel.rotation.y = .2; cabin.add(bezel);
    const center = new THREE.Mesh(plane(.41, .314), centerMats[0]); center.position.set(.84, 1.21, .03); center.rotation.y = .2; cabin.add(center);
    // Steering wheel: leather rim, three spokes, oval airbag pad, column. Generic, no badge.
    {
    const wheel = new THREE.Group(), R = .175;
    const leather = new THREE.MeshStandardMaterial({color: 0x1c1d20, roughness: .78, metalness: 0, envMapIntensity: .35});
    const pad = new THREE.MeshStandardMaterial({color: 0x141518, roughness: .55, envMapIntensity: .4});
    const satin = new THREE.MeshStandardMaterial({color: 0x8d8f93, roughness: .28, metalness: .9, envMapIntensity: .9});
    const keyMat = new THREE.MeshStandardMaterial({color: 0x26282c, roughness: .45, envMapIntensity: .4});
    const mark = new THREE.MeshBasicMaterial({color: 0xe8541c});
    const rimGeo = new THREE.TorusGeometry(R, .0205, 20, 96); rimGeo.rotateY(Math.PI / 2);
    wheel.add(new THREE.Mesh(rimGeo, leather));
    const top = new THREE.TorusGeometry(R, .0212, 16, 10, .16); top.rotateZ(Math.PI / 2 - .08); top.rotateY(Math.PI / 2);
    wheel.add(new THREE.Mesh(top, mark)); // centering stripe at 12 o'clock
    const hubGeo = new THREE.CylinderGeometry(.062, .068, .05, 40); hubGeo.rotateZ(Math.PI / 2); hubGeo.scale(1, .86, 1.28);
    const hub = new THREE.Mesh(hubGeo, pad); hub.position.x = .02; wheel.add(hub);
    [-1, 1].forEach(side => {
      const len = R - .075, spoke = new THREE.Mesh(new THREE.BoxGeometry(.016, .036, len), leather);
      spoke.position.set(.016, -.012, side * (.075 + len / 2)); wheel.add(spoke);
      const inlay = new THREE.Mesh(new THREE.BoxGeometry(.004, .004, len * .8), satin);
      inlay.position.set(.006, .007, side * (.075 + len / 2)); wheel.add(inlay);
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(.006, .011, .016), keyMat);
        b.position.set(.006, -.014, side * (.088 + i * .021)); wheel.add(b);
      }
    });
    const lower = new THREE.Mesh(new THREE.BoxGeometry(.016, R - .06, .05), leather);
    lower.position.set(.018, -(.055 + (R - .06) / 2), 0); wheel.add(lower);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(.032, .04, .34, 24), keyMat);
    column.rotation.z = Math.PI / 2; column.position.x = .2; wheel.add(column);
    wheel.position.set(.5, 1.13, -.45); wheel.rotation.z = -.32; cabin.add(wheel);
    }
    const seatMat = new THREE.MeshStandardMaterial({color: 0x101216, roughness: .9, envMapIntensity: .2});
    [-.45, .45].forEach(z => {
      const back = new THREE.Mesh(new THREE.BoxGeometry(.14, .7, .5), seatMat); back.position.set(-.6, 1.3, z); back.rotation.z = .12; cabin.add(back);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(.52, .12, .5), seatMat); seat.position.set(-.32, .98, z); cabin.add(seat);
    });
    const ambient = new THREE.PointLight(0xd8d6d0, .35, 2.2); ambient.position.set(.4, 1.3, 0); cabin.add(ambient);

    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(3.6, 1.86, -.32), new THREE.Vector3(1.6, 1.62, -.3), new THREE.Vector3(-.4, 1.46, -.25)]);
    const v = new THREE.Vector3(), look = new THREE.Vector3();
    return {
      group, fov: 38,
      update(t, time, k) {
        let fov = 38;
        if (t < .42) {
          const a = span(t, 0, .42), th = .78 - a * 1.2 + (reduced ? 0 : Math.sin(time * .2) * .02);
          const r = (9.2 - a * 2.6) * k;
          v.set(Math.cos(th) * r, 2.7 - a * .7, Math.sin(th) * r);
          look.set(.2, 1.05, 0);
        } else if (t < .52) {
          const a = span(t, .42, .52), th = .78 - 1.2, r = 6.6 * k;
          v.set(Math.cos(th) * r, 2.0, Math.sin(th) * r).lerp(path.getPoint(0), a);
          look.set(.2, 1.05, 0).lerp(new THREE.Vector3(.84, 1.29, -.25), a);
        } else {
          const a = span(t, .52, .64);
          v.copy(path.getPoint(a));
          look.set(.84, 1.29, -.25);
          fov = 38 + a * 8 + (k > 1 ? 18 : 0);
          const settle = span(t, .64, 1);
          v.x += settle * .1;
        }
        camera.position.copy(v); camera.lookAt(look); camera.fov = fov;
        const step = gmStep(t);
        cluster.material = clusterMats[step]; center.material = centerMats[step];
        center.material.color.setScalar(step === 3 ? .55 : 1); // the tow step lives on the cluster
        cabin.visible = t > .45;
        exterior.visible = t < .585; // camera has passed the windshield
        const inside = !exterior.visible;
        // exterior: low fill, blue rim only, so the blue edges carry the form
        hemi.intensity = inside ? .06 : .18; key.intensity = inside ? .15 : .45; rim.intensity = inside ? .1 : 2.2; warm.intensity = 0;
      }
    };
  }

  // ----- 02 FABLab: three phones fan out -----
  function buildPhones() {
    const group = new THREE.Group();
    const rr = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
    const bodyMat = new THREE.MeshPhysicalMaterial({color: 0x1b1d22, metalness: .8, roughness: .25, clearcoat: .6});
    const phones = [0, 1, 2].map(i => {
      const W = 1, H = i === 2 ? 2.06 : 2.02;
      const ph = new THREE.Group();
      const body = new THREE.ExtrudeGeometry(rr(W + .02, H + .02, .16), {depth: .08, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3});
      body.translate(0, 0, -.1); ph.add(new THREE.Mesh(body, bodyMat));
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({map: tex(`assets/hl/phone-${i}.webp`), transparent: true, alphaTest: .4, toneMapped: false}));
      screen.position.z = .003; ph.add(screen);
      group.add(ph); return ph;
    });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshBasicMaterial({color: 0x3154ff, transparent: true, opacity: .12, depthWrite: false}));
    glow.position.z = -1.6; group.add(glow);
    return {
      group,
      update(t, time, k) {
        const reveal = span(t, 0, .3), fan = span(t, .3, .62), focus = Math.min(2, Math.floor(t * 3));
        const bob = reduced ? 0 : Math.sin(time * .8) * .03;
        phones[0].position.set(0, bob, 0); phones[0].rotation.set(.25 * (1 - reveal), -.9 * (1 - reveal) + Math.sin(time * .3) * .04 * (reduced ? 0 : 1), 0);
        [[1, -1], [2, 1]].forEach(([i, dir]) => {
          phones[i].position.set(dir * 1.38 * fan, -.06 + bob * .5, -.7 * fan - .05);
          phones[i].rotation.set(0, -dir * .38 * fan, dir * -.04 * fan);
          phones[i].visible = fan > .01;
        });
        phones.forEach((p, i) => p.scale.setScalar(1 + (i === focus && fan > .9 ? .06 : 0)));
        camera.position.set(0, .15, (5.6 - span(t, .62, 1) * .6) * k); camera.lookAt(0, 0, 0); camera.fov = 38;
      }
    };
  }

  // ----- 03 Gear: linked views in depth -----
  function buildGear() {
    const group = new THREE.Group();
    const views = ['portfolio', 'project', 'apqp'].map((n, i) => {
      const g = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.28, 2.08, .04), new THREE.MeshStandardMaterial({color: 0x15171c, roughness: .5}));
      frame.position.z = -.03; g.add(frame);
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), screenMat(`assets/hl/gear-${n}.webp`)));
      group.add(g); return g;
    });
    const lineMat = new THREE.LineBasicMaterial({color: 0xff5b1f, transparent: true, opacity: .7});
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    const link = new THREE.Line(lineGeo, lineMat); group.add(link);
    return {
      group,
      update(t, time, k) {
        const spread = span(t, 0, .55);
        views.forEach((v, i) => {
          v.position.set(i * 1.05 * spread, i * .42 * spread, -i * 1.35 * spread);
          v.rotation.y = -.18 * spread;
        });
        const pts = views.map(v => new THREE.Vector3(1.6, -1.0, 0).applyEuler(v.rotation).add(v.position));
        pts.push(pts[2].clone());
        lineGeo.setFromPoints(pts); lineMat.opacity = .7 * spread;
        group.rotation.y = -.42 + span(t, .3, 1) * .3 + (reduced ? 0 : Math.sin(time * .25) * .02);
        camera.position.set(-.4, .9, 7.4 * k); camera.lookAt(.9, .4, -1.2); camera.fov = 38;
      }
    };
  }

  // ----- 04 Northern: push in on the measured X-ray -----
  function buildNorthern() {
    const group = new THREE.Group();
    const xray = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.48), screenMat('assets/p19-0.webp'));
    group.add(xray);
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.9, .012), new THREE.MeshBasicMaterial({color: 0xff5b1f, transparent: true, opacity: .8, toneMapped: false}));
    scan.position.z = .01; group.add(scan);
    const dustGeo = new THREE.BufferGeometry(), pts = [];
    for (let i = 0; i < 500; i++) pts.push((Math.random() - .5) * 8, (Math.random() - .5) * 6, (Math.random() - .5) * 6);
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({color: 0x8b78ff, size: .02, transparent: true, opacity: .6})));
    return {
      group,
      update(t, time, k) {
        const a = span(t, 0, 1);
        xray.rotation.y = .32 * (1 - a); scan.rotation.y = xray.rotation.y;
        scan.position.y = reduced ? 0 : Math.sin(time * .9) * 1.15;
        camera.position.set(-1.4 + a * 1.5, -.6 + a * .9, (6.4 - a * 2.4) * k); camera.lookAt(a * .15, a * .2, 0); camera.fov = 38;
      }
    };
  }

  // ----- 05 Oxylus: synthetic run cloud -----
  function buildOxylus() {
    const group = new THREE.Group();
    const colors = [0xff5b1f, 0xb79bff, 0xff6d4d, 0xffcf7a, 0x5aa9ff, 0xff8fd8].map(c => new THREE.Color(c));
    const pos = [], col = [];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 330; i++) {
      const c = Math.floor(rnd() * 6), dur = rnd(), ev = rnd() * dur, gap = c === 0 ? 0 : rnd() * .9;
      pos.push(dur * 2.4 - 1.2, ev * 2.4 - 1.2, gap * 2.4 - 1.2); col.push(colors[c].r, colors[c].g, colors[c].b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    group.add(new THREE.Points(g, new THREE.PointsMaterial({size: .055, vertexColors: true, toneMapped: false})));
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4, 2.4, 2.4)), new THREE.LineBasicMaterial({color: 0x3a3f4a})));
    const floor = new THREE.GridHelper(2.4, 6, 0x3154ff, 0x3154ff); floor.position.y = -1.2; floor.material.transparent = true; floor.material.opacity = .4; group.add(floor);
    return {
      group,
      update(t, time, k) {
        group.rotation.y = .6 + t * 1.6 + (reduced ? 0 : time * .05);
        group.rotation.x = .15;
        camera.position.set(0, .6, (7.2 - span(t, 0, 1) * 1.2) * k); camera.lookAt(0, -.1, 0); camera.fov = 40;
      }
    };
  }

  // ---------- render loop ----------
  let w = 0, h = 0;
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // shift the stage away from the copy: right on desktop, up on portrait screens
    if (w > 900) camera.setViewOffset(w, h, -w * .17, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * .24, w, h);
  }
  new ResizeObserver(resize).observe(canvas); resize();
  section.classList.add('gl-ready');
  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!state.visible || document.hidden) return;
    const time = clock.getElapsedTime(), k = w / h < 1 ? 1.55 : w / h < 1.3 ? 1.2 : 1;
    groups.forEach((g, i) => g.group.visible = i === state.chapter);
    if (state.chapter !== 0) { hemi.intensity = .55; key.intensity = 1.15; rim.intensity = 1.6; warm.intensity = 1.4; }
    groups[state.chapter].update(state.t, time, k);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  })();
}
})();
