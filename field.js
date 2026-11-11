/* LLField — GPU particle form shared by the home page and project pages.
   window.LLField.create({ canvas, shape, accent, size:[mobile, desktop], layout(halfW, halfH, portrait) })
   returns { morph(shapeId, accentHex, scatter) }. Requires three.js (global THREE). */
(function(){
  "use strict";
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------------------------------------------------------------
     PARTICLE FIELD — GPU simulation in a ping-pong float texture.
     Each particle is pulled onto a signed-distance form, swirls along
     it, drifts on curl noise, and is pushed by the cursor's motion.
  ---------------------------------------------------------------- */
  var SIM = [
    'precision highp float;',
    'uniform sampler2D uPos; uniform sampler2D uOrigin;',
    'uniform float uTime, uHZ, uMix, uBurst, uHover, uAspect;',
    'uniform int uA, uB;',
    'uniform mat4 uMVP; uniform mat3 uPushM;',
    'uniform vec2 uMouse, uVel;',
    'varying vec2 vUv;',
    'mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }',
    'float smin(float a, float b, float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }',
    'float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }',
    'float sdRBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }',
    /* 0 — a twisted hollow ring */
    'float shRing(vec3 p){',
    '  float a=atan(p.y,p.x);',
    '  vec2 q=vec2(length(p.xy)-.47, p.z);',
    '  q=rot(a*1.5+uTime*.12)*q;',
    '  q.x*=1.+.35*sin(a*3.+1.);',
    '  return (length(q*vec2(1.,1.9))-.14)*.55;',
    '}',
    /* 1 — steering wheel */
    'float shWheel(vec3 p){',
    '  vec2 q=vec2(length(p.xy)-.52, p.z);',
    '  float d=length(q*vec2(1.,.8))-.05;',
    '  d=smin(d, sdRBox(p-vec3(0.,-.02,0.), vec3(.19,.14,.06), .07), .05);',
    '  d=smin(d, sdCap(p, vec3(0.), vec3(-.5,.06,0.), .035), .06);',
    '  d=smin(d, sdCap(p, vec3(0.), vec3(.5,.06,0.), .035), .06);',
    '  d=smin(d, sdCap(p, vec3(0.,-.05,0.), vec3(0.,-.5,0.), .045), .06);',
    '  return d;',
    '}',
    /* 2 — phone with app tiles */
    'float shPhone(vec3 p){',
    '  float body=sdRBox(p, vec3(.29,.56,.035), .07);',
    '  vec3 g=p-vec3(0.,.06,.05);',
    '  vec2 cell=mod(g.xy+.065,.13)-.065;',
    '  float tiles=sdRBox(vec3(cell, g.z), vec3(.045,.045,.01), .018);',
    '  tiles=max(tiles, sdRBox(g, vec3(.2,.33,.2), 0.));',
    '  return min(body, tiles);',
    '}',
    /* 3 — gear */
    'float shGear(vec3 p){',
    '  float r=length(p.xy), a=atan(p.y,p.x);',
    '  float teeth=.5+.065*clamp(sin(a*14.+uTime*.2)*2.6,-1.,1.);',
    '  float d2=(r-teeth)*.8;',
    '  d2=max(d2, -(r-.14));',
    '  float sec=6.2831853/6.;',
    '  float aa=mod(a+sec*.5,sec)-sec*.5;',
    '  float hole=length(vec2(cos(aa),sin(aa))*r-vec2(.32,0.))-.075;',
    '  d2=max(d2,-hole);',
    '  vec2 w=vec2(d2, abs(p.z)-.085);',
    '  return min(max(w.x,w.y),0.)+length(max(w,0.));',
    '}',
    /* 4 — molar */
    'float shTooth(vec3 p){',
    '  vec3 q=p-vec3(0.,.17,0.);',
    '  float crown=sdRBox(q, vec3(.28,.17,.22), .14);',
    '  crown+=.03*sin(q.x*13.)*sin(q.z*13.)*smoothstep(0.,.2,q.y);',
    '  float r1=sdCap(p, vec3(-.13,.05,0.), vec3(-.21,-.52,.02), .08);',
    '  float r2=sdCap(p, vec3(.13,.05,0.), vec3(.2,-.52,-.02), .08);',
    '  return smin(crown, min(r1,r2), .12)*.85;',
    '}',
    /* 5 — three signal traces running in sequence */
    'float sig(float x, float k){ return .12*sin(x*6.+uTime*1.1+k)*smoothstep(-.75,-.2,x)+.05*sin(x*17.-uTime*1.6+k*2.); }',
    'float shWave(vec3 p){',
    '  float d=1e3;',
    '  for(int i=0;i<3;i++){ float z=(float(i)-1.)*.2, k=float(i)*1.7;',
    '    d=min(d, length(vec2(p.y-sig(p.x,k)+(float(i)-1.)*.06, p.z-z))-.022); }',
    '  d*=.5;',
    '  return max(d, abs(p.x)-.72);',
    '}',
    'float shape(int id, vec3 p){',
    '  if(id==0) return shRing(p);',
    '  if(id==1) return shWheel(p);',
    '  if(id==2) return shPhone(p);',
    '  if(id==3) return shGear(p);',
    '  if(id==4) return shTooth(p);',
    '  return shWave(p);',
    '}',
    'float sdf(vec3 p){ float a=shape(uA,p); if(uMix<.001) return a; return mix(a, shape(uB,p), uMix); }',
    'vec3 grad(vec3 p){ vec2 e=vec2(.002,0.);',
    '  return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy), sdf(p+e.yxy)-sdf(p-e.yxy), sdf(p+e.yyx)-sdf(p-e.yyx))+1e-6); }',
    /* divergence-free: each component ignores its own axis */
    'vec3 curl(vec3 p){ return vec3(sin(p.y*1.7+cos(p.z*1.3)), sin(p.z*1.9+cos(p.x*1.1)), sin(p.x*1.5+cos(p.y*1.7))); }',
    'void main(){',
    '  vec4 P=texture2D(uPos,vUv); vec4 O=texture2D(uOrigin,vUv);',
    '  vec3 p=P.xyz; float rnd=O.w;',
    '  if(length(p)>1.8) p*=.5;',
    '  p+=curl(p*2.2+uTime*.08)*.0011*uHZ;',
    '  float dust=step(rnd,.09);',
    '  vec3 g=grad(p); float d=sdf(p);',
    '  p-=g*d*mix(.07,.003,dust)*uHZ;',
    '  p+=cross(normalize(p+1e-4),g)*.0008*uHZ*(1.-dust);',
    '  p+=(O.xyz-p)*mix(.0006,.003,dust)*uHZ;',
    '  vec4 c=uMVP*vec4(p,1.); vec2 s=c.xy/c.w;',
    '  vec2 dv=(s-uMouse)*vec2(uAspect,1.);',
    '  float w=exp(-dot(dv,dv)*26.);',
    '  p+=uPushM*vec3(uVel,0.)*w*(.5+rnd);',
    '  p+=uPushM*vec3(-dv.y,dv.x,0.)*w*uHover*.006*uHZ;',
    '  p+=normalize(p+1e-4)*uBurst*(.012+.05*rnd)*uHZ;',
    '  gl_FragColor=vec4(p,1.);',
    '}'
  ].join('\n');

  var VERT = [
    'attribute vec2 ref; attribute vec4 rnd;',
    'uniform sampler2D uPos; uniform float uSize;',
    'varying vec4 vR;',
    'void main(){',
    '  vec3 p=texture2D(uPos,ref).xyz;',
    '  p*=mix(1.,1.35,pow(rnd.y,120.));',
    '  vec4 mv=modelViewMatrix*vec4(p,1.);',
    '  gl_Position=projectionMatrix*mv;',
    '  float s=mix(.45,1.,rnd.z)*(1.+2.2*pow(rnd.w,80.));',
    '  gl_PointSize=max(1.,uSize*s/-mv.z);',
    '  vR=rnd;',
    '}'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec3 uAccent; uniform float uTime, uBright;',
    'varying vec4 vR;',
    'void main(){',
    '  vec2 c=gl_PointCoord*2.-1.; float d=dot(c,c); if(d>1.) discard;',
    '  float sh=pow(1.-d,1.6)*(.75+.35*(-c.x*.6-c.y*.6));',
    '  vec3 base=vec3(mix(.03,.19,vR.x));',
    '  float acc=pow(vR.z,12.);',
    '  float spark=.65+(.5+.5*sin(uTime*4.+vR.y*20.))*pow(vR.z,8.)*2.;',
    '  gl_FragColor=vec4(mix(base,uAccent,acc)*spark*sh*uBright,1.);',
    '}'
  ].join('\n');

  var ROT = [[.35,-.3],[-.2,.35],[.1,-.45],[.5,.35],[.15,.6],[.5,-.25]];

  function createField(opts){
    opts = opts || {};
    var T = window.THREE;
    if (!T) throw new Error('three.js unavailable');
    var canvas = opts.canvas;
    var renderer = new T.WebGLRenderer({ canvas:canvas, antialias:false, alpha:false, powerPreference:'high-performance' });
    if (renderer.capabilities.maxVertexTextures < 1) throw new Error('no vertex textures');
    var gl2 = renderer.capabilities.isWebGL2;
    var type = (gl2 ? renderer.extensions.has('EXT_color_buffer_float') : renderer.extensions.has('WEBGL_color_buffer_float')) ? T.FloatType : T.HalfFloatType;
    renderer.setClearColor(0x04060b, 1);

    var mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    var S = opts.size ? (mobile ? opts.size[0] : opts.size[1]) : (mobile ? 200 : 448), N = S * S;

    /* origins: uniform in a sphere; w = per-particle random */
    var data = new Float32Array(N * 4);
    for (var i = 0; i < N; i++){
      var x, y, z;
      do { x = Math.random()*2-1; y = Math.random()*2-1; z = Math.random()*2-1; } while (x*x + y*y + z*z > 1);
      data[i*4] = x * .95; data[i*4+1] = y * .95; data[i*4+2] = z * .95; data[i*4+3] = Math.random();
    }
    var origin = new T.DataTexture(data, S, S, T.RGBAFormat, T.FloatType);
    origin.needsUpdate = true;
    function rt(){ return new T.WebGLRenderTarget(S, S, { type:type, format:T.RGBAFormat, minFilter:T.NearestFilter, magFilter:T.NearestFilter, depthBuffer:false, stencilBuffer:false }); }
    var rtA = rt(), rtB = rt(), firstPass = true;

    var simU = {
      uPos:{value:origin}, uOrigin:{value:origin}, uTime:{value:0}, uHZ:{value:1}, uMix:{value:0}, uBurst:{value:0},
      uHover:{value:0}, uAspect:{value:1}, uA:{value:0}, uB:{value:0},
      uMVP:{value:new T.Matrix4()}, uPushM:{value:new T.Matrix3()}, uMouse:{value:new T.Vector2(9,9)}, uVel:{value:new T.Vector2()}
    };
    var simScene = new T.Scene(), simCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    simScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
      uniforms:simU, fragmentShader:SIM,
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }'
    })));

    var geo = new T.BufferGeometry();
    var ref = new Float32Array(N * 2), rnd = new Float32Array(N * 4);
    for (i = 0; i < N; i++){
      ref[i*2] = (i % S + .5) / S; ref[i*2+1] = (Math.floor(i / S) + .5) / S;
      rnd[i*4] = Math.random(); rnd[i*4+1] = Math.random(); rnd[i*4+2] = Math.random(); rnd[i*4+3] = Math.random();
    }
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('ref', new T.BufferAttribute(ref, 2));
    geo.setAttribute('rnd', new T.BufferAttribute(rnd, 4));
    var drawU = { uPos:{value:origin}, uSize:{value:10}, uAccent:{value:new T.Color('#b9a7ff')}, uTime:{value:0}, uBright:{value:mobile ? 1.5 : .85} };
    var points = new T.Points(geo, new T.ShaderMaterial({
      uniforms:drawU, vertexShader:VERT, fragmentShader:FRAG,
      transparent:true, depthTest:false, depthWrite:false, blending:T.AdditiveBlending
    }));
    points.frustumCulled = false;

    var scene = new T.Scene(), group = new T.Group();
    group.add(points); scene.add(group);
    var camera = new T.PerspectiveCamera(30, 1, .1, 100);
    var base = new T.Vector3(0, 0, 6), look = new T.Vector3();
    var halfH = Math.tan(15 * Math.PI / 180) * 6;

    function resize(){
      var w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      simU.uAspect.value = w / h;
      drawU.uSize.value = .026 * h * dpr * (mobile ? 1.35 : 1);
      var halfW = halfH * camera.aspect, portrait = w / h < 1;
      var L = opts.layout ? opts.layout(halfW, halfH, portrait) : {
        scale: Math.min(1.45, halfW * .86 / .72, halfH * .7 / .72),
        x: portrait ? 0 : halfW * .03, y: halfH * (portrait ? .26 : .2) };
      group.scale.setScalar(L.scale);
      group.position.set(L.x, L.y, 0);
      look.set(0, group.position.y * .5, 0);
    }
    resize();
    addEventListener('resize', resize);

    /* pointer */
    var mouse = new T.Vector2(9, 9), acc = new T.Vector2(), vel = new T.Vector2(), lastMove = -1e9, have = false;
    addEventListener('pointermove', function(e){
      var r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom){ have = false; mouse.set(9, 9); return; }
      var nx = (e.clientX - r.left) / r.width * 2 - 1, ny = -((e.clientY - r.top) / r.height * 2 - 1);
      if (have){ acc.x += nx - mouse.x; acc.y += ny - mouse.y; }
      mouse.set(nx, ny); have = true; lastMove = performance.now();
    }, { passive:true });
    document.addEventListener('pointerleave', function(){ have = false; mouse.set(9, 9); });
    var burst = 0;
    canvas.parentNode.addEventListener('pointerdown', function(e){
      if (e.target.closest('a, button, .card')) return;
      if (!RM) burst = Math.max(burst, .7);
    });

    var s0 = opts.shape || 0, a0 = opts.accent || '#b9a7ff';
    var shapeA = s0, shapeB = s0, mixT = -1, accent = new T.Color(a0), target = new T.Color(a0);
    var tRot = new T.Vector2(ROT[s0][0], ROT[s0][1]);
    group.rotation.set(ROT[s0][0], ROT[s0][1], 0);
    drawU.uAccent.value.copy(accent);
    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }).observe(canvas);
    var clock = new T.Clock(), elapsed = 0;
    var m4 = new T.Matrix4();

    function morph(id, hex, scatter){
      if (mixT >= 0 && simU.uMix.value > .5) shapeA = shapeB;
      shapeB = id; mixT = 0;
      target.set(hex);
      tRot.set(ROT[id][0], ROT[id][1]);
      if (scatter && !RM) burst = Math.max(burst, .55);
    }

    var warm = parseInt((location.search.match(/warm=(\d+)/) || [])[1] || 0, 10);
    function step(dt){
      elapsed += dt;
      var hz = dt * 60, now = performance.now();

      /* morph */
      if (mixT >= 0){
        mixT += dt / 1.4;
        var k = Math.min(1, mixT);
        simU.uMix.value = k * k * (3 - 2 * k);
        if (mixT >= 1){ shapeA = shapeB; mixT = -1; simU.uMix.value = 0; }
      }
      simU.uA.value = shapeA; simU.uB.value = shapeB;
      accent.lerp(target, .04); drawU.uAccent.value.copy(accent);

      /* gaze camera and slow sway */
      var mx = have && !RM ? mouse.x : 0, my = have && !RM ? mouse.y : 0;
      camera.position.x += (base.x - mx * .35 - camera.position.x) * .05;
      camera.position.y += (base.y - my * .25 - camera.position.y) * .05;
      camera.position.z = base.z;
      camera.lookAt(look);
      var sway = RM ? 0 : Math.sin(elapsed * .2) * .18;
      group.rotation.x += (tRot.x - group.rotation.x) * .03;
      group.rotation.y += (tRot.y + sway - group.rotation.y) * .03;
      camera.updateMatrixWorld(); group.updateMatrixWorld();

      /* cursor push in the form's local space */
      vel.multiplyScalar(.86).add(acc); acc.set(0, 0);
      simU.uVel.value.set(vel.x * halfH * camera.aspect * .45, vel.y * halfH * .45);
      m4.copy(group.matrixWorld).invert().multiply(camera.matrixWorld);
      simU.uPushM.value.setFromMatrix4(m4);
      simU.uMVP.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(group.matrixWorld);
      simU.uMouse.value.copy(mouse);
      simU.uHover.value += ((have && now - lastMove < 2500 ? 1 : 0) - simU.uHover.value) * .05;
      simU.uBurst.value = burst; burst *= Math.pow(.9, hz);

      simU.uTime.value = elapsed; simU.uHZ.value = hz;
      simU.uPos.value = firstPass ? origin : rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, simCam);
      renderer.setRenderTarget(null);
      firstPass = false;
      var tmp = rtA; rtA = rtB; rtB = tmp;
    }
    function frame(){
      if (!visible){ clock.getDelta(); requestAnimationFrame(frame); return; }
      for (; warm > 0; warm--) step(1 / 60);   /* debug: ?warm=N pre-runs N steps */
      step(Math.min(clock.getDelta(), 1 / 20));
      drawU.uPos.value = rtA.texture;
      drawU.uTime.value = elapsed;
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { morph:morph };
  }

  window.LLField = { create:createField };
})();
