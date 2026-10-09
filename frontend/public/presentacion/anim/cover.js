// Copyright (c) 2026 guswillsan@hotmail.com. All rights reserved.
// Slide 1 (cover) animation, built with the same technique as the presentation template:
// - WebGL "living landscape" over a clean plate: masks R = glints, G = foliage in the wind, B = sky with drifting clouds
// - paper reveal and a slow camera zoom (1.10 → 1.00 during DUR)
// - layers cut from the infographic that enter on the timeline T (particles, brush wipe, seal, cards, sweeps)
// - ambient light motes and birds, and Web Audio effects synchronised with the sequence
// The Mi Ruta elements (case-study title, bus sign, stop sign, step 3, closing item) get extra emphasis and a final spotlight.
(() => {
  const SW = 1672, SH = 941, OW = 1920, OH = 1080, DUR = 18;

  // Regions of the source infographic, in source pixels [x, y, w, h]
  const R = {
    title: [50, 20, 850, 102], sub: [75, 116, 838, 74], caso: [130, 195, 585, 82], tag: [78, 278, 565, 70],
    card: [35, 350, 540, 200], note: [1385, 20, 275, 192], bottom: [18, 800, 1642, 126],
    steps: [[25, 560, 215, 230], [255, 560, 212, 230], [480, 560, 228, 230], [720, 560, 228, 230], [960, 560, 228, 230], [1195, 560, 222, 230], [1430, 560, 227, 230]],
    arrows: [[228, 612, 36, 44], [456, 612, 36, 44], [696, 612, 36, 44], [935, 612, 36, 44], [1172, 612, 36, 44], [1404, 612, 36, 44]],
    marquee: [1130, 255, 165, 40], stopSign: [1393, 262, 78, 112], bottomMR: [868, 808, 236, 112],
  };
  const MI_RUTA = 2; // index of step "3. Mi Ruta – Sistema Bajo Prueba"
  // Areas removed from the clean plate: they enter later as layers
  const ERASE = [R.title, R.sub, R.caso, R.tag, R.card, R.note, [16, 556, 1648, 240], [14, 796, 1650, 134]];
  // Mask shapes: sky (B), foliage ellipses (G), glint zones (R)
  const SKY = [[905, 0, 470, 225]];
  const FOLIAGE = [[1140, 170, 52, 62], [1250, 158, 46, 54], [1612, 252, 56, 76], [966, 335, 34, 62], [668, 392, 40, 64], [1642, 452, 30, 40]];
  const GLINT = [[1060, 40, 290, 190]];
  // The bus is cut out with its outline (minus the laptop in front of it) so it can drive up to the stop.
  // It grows from BUS_ANCHOR (its rear, far down the road behind the student) to its place in the picture.
  const BUS_POLY = [[946, 290], [1000, 262], [1060, 252], [1100, 246], [1103, 231], [1262, 231], [1300, 247], [1313, 288], [1338, 288],
    [1340, 343], [1312, 348], [1309, 462], [1282, 472], [1276, 486], [1238, 486], [1228, 471], [1122, 471], [1103, 463], [1070, 462], [1086, 400], [946, 400]];
  const LAPTOP_POLY = [[893, 404], [1086, 400], [1054, 545], [880, 548]];
  const BUS_BOX = [930, 225, 420, 270], BUS_ANCHOR = [955, 402], BUS_NOSE = [1262, 486];
  const HEADLIGHTS = [[1140, 425], [1290, 425]], WHEELS = [[1112, 470], [1258, 484]];
  // Timeline (seconds)
  const T = { reveal: [0, 2.4], title: 1.6, sub: 3.0, caso: 4.0, tag: 5.0, card: 5.8, note: 6.6, bus: 6.9, busDrive: 1.9,
    steps: 9.6, stepGap: .5, bottom: 13.2, spot: [14.4, 17.4], sweep2: 17.5 };
  const GOLD = '201,162,75';

  // ---------- utilities ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
  const eExpo = t => { t = clamp(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
  const eIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const eBack = t => { t = clamp(t); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const prog = (t, t0, d) => clamp((t - t0) / d);
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const center = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];

  // ---------- WebGL: living landscape ----------
  const VS = `attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}`;
  const FS = `precision highp float;varying vec2 v;
uniform sampler2D uBg,uMask;uniform vec2 uSrc,uCenter;uniform float uT,uZoom,uReveal;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
 float t=uT; vec2 p=uCenter+(v-.5)*uSrc/uZoom;
 vec4 m=texture2D(uMask,p/uSrc);
 vec3 c0=texture2D(uBg,p/uSrc).rgb;
 float leaf=m.g*smoothstep(.03,.12,c0.g-max(c0.r,c0.b));
 float wind=.6+.4*sin(t*.7);
 vec2 d=vec2(2.2*wind*sin(t*1.9+p.y*.03+p.x*.01)+sin(t*3.3+p.y*.07),.8*sin(t*2.3+p.x*.03))*leaf;
 vec3 c=texture2D(uBg,(p+d)/uSrc).rgb;
 float lum=dot(c,vec3(.3,.59,.11));
 float n=fbm(p*.0035+vec2(t*.03,t*.004)),n2=fbm(p*.0012+vec2(t*.012,0.)+5.);
 float cl=(smoothstep(.5,.8,n)*.35+smoothstep(.55,.85,n2)*.25)*m.b*smoothstep(.82,.93,lum);
 c=mix(c,vec3(1.),cl);
 vec2 cell=floor(p/8.);vec2 cc=(cell+.5+(vec2(hash(cell),hash(cell+3.1))-.5)*.6)*8.;
 float cl2=dot(texture2D(uBg,cc/uSrc).rgb,vec3(.3,.59,.11));
 float h=hash(cell+7.);float tw=pow(max(sin(t*(1.5+h*2.5)+h*40.),0.),10.);
 vec2 dd=p-cc;float star=exp(-dot(dd,dd)*.35)+exp(-dd.y*dd.y*2.)*exp(-abs(dd.x)*.45)*.6;
 c+=vec3(1.,.95,.82)*star*tw*smoothstep(.72,.86,cl2)*m.r*step(.55,h)*1.1;
 vec2 sp=p-vec2(1010.,10.);c+=vec3(1.,.95,.82)*exp(-dot(sp,sp)/60000.)*(.08+.03*sin(t*.8));
 c+=vec3(1.,.93,.8)*pow(.5+.5*sin((p.x*.6+p.y)*.012-t*.5),8.)*clamp(1.-p.y/700.,0.,1.)*.05;
 float rn=fbm(p*.011)*.62+(1.-length((p/uSrc-.5)*vec2(1.,.8))*1.4)*.38;
 float thr=1.-uReveal*1.3;float vis=smoothstep(thr,thr+.05,rn);
 vec3 paper=vec3(.965,.95,.925)*(.975+.025*noise(p*.9));
 float edge=vis*(1.-vis)*4.;
 c=mix(paper,c,vis);c=mix(c,c*vec3(.86,.84,.9),edge*.6);
 vec2 vv=v-.5;c*=1.-dot(vv,vv)*.25;
 gl_FragColor=vec4(c,1.);}`;

  function initGL(gl, plate, mask) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const tex = (img, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link'); gl.useProgram(p);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uBg', 'uMask', 'uSrc', 'uCenter', 'uT', 'uZoom', 'uReveal'].forEach(n => U[n] = gl.getUniformLocation(p, n));
    tex(plate, 0); tex(mask, 1); gl.uniform1i(U.uBg, 0); gl.uniform1i(U.uMask, 1); gl.uniform2f(U.uSrc, SW, SH);
    gl.viewport(0, 0, OW, OH);
    return U;
  }

  // ---------- assets built from the single infographic ----------
  function buildPlate(img) { // the infographic without the blocks that enter later
    // The blocks sit on the white paper of the infographic: paint that paper over them with soft edges
    const c = canvas(SW, SH), x = c.getContext('2d'); x.drawImage(img, 0, 0);
    x.fillStyle = 'rgb(247,248,250)';
    x.filter = 'blur(6px)'; for (const [rx, ry, rw, rh] of ERASE) x.fillRect(rx - 2, ry - 2, rw + 4, rh + 4);
    x.filter = 'none'; for (const [rx, ry, rw, rh] of ERASE) x.fillRect(rx + 4, ry + 4, rw - 8, rh - 8);
    paintBehindBus(x);
    return c;
  }
  const polyPath = (x, pts) => { x.beginPath(); pts.forEach(([px, py], i) => x[i ? 'lineTo' : 'moveTo'](px, py)); x.closePath(); };
  function paintBehindBus(x) { // what the bus hides, in the same sketch style: sky, a building, trees, bushes and the road
    x.save(); polyPath(x, BUS_POLY); x.clip();
    const [bx, by, bw, bh] = BUS_BOX, g = x.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, '#f4f8fc'); g.addColorStop(.66, '#eef4f4'); g.addColorStop(.7, '#e4e7f0'); g.addColorStop(1, '#dcdfea');
    x.fillStyle = g; x.fillRect(bx, by, bw, bh);
    x.lineJoin = 'round'; x.lineCap = 'round';
    x.fillStyle = '#d6e7f8'; x.strokeStyle = '#8fb6e2'; x.lineWidth = 2;
    for (const [px, py, pw, ph] of [[1135, 238, 62, 150], [1205, 262, 46, 126]]) { x.fillRect(px, py, pw, ph); x.strokeRect(px, py, pw, ph);
      for (let wy = py + 14; wy < py + ph - 10; wy += 22) for (let wx = px + 10; wx < px + pw - 10; wx += 18) { x.fillStyle = '#eef6ff'; x.fillRect(wx, wy, 8, 10); x.fillStyle = '#d6e7f8'; } }
    const tree = (cx, cy, r, trunk) => {
      if (trunk) { x.strokeStyle = '#7a5a3c'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx, cy + r * .4); x.lineTo(cx, cy + r * 1.6); x.stroke(); }
      // wide stroke first, then the fill on top: only the outer outline of the crown remains, like the drawing's ink
      x.fillStyle = '#a8dca0'; x.strokeStyle = '#26402f'; x.lineWidth = 6;
      const crown = () => { x.beginPath(); for (const [ox, oy, k] of [[-.55, .15, .62], [0, -.25, .75], [.55, .12, .6], [0, .35, .6]]) {
        const ccx = cx + ox * r, ccy = cy + oy * r; x.moveTo(ccx + k * r, ccy); x.arc(ccx, ccy, k * r, 0, Math.PI * 2); } };
      crown(); x.stroke(); crown(); x.fill();
    };
    tree(1010, 318, 40, true); tree(1088, 300, 34, true); tree(1270, 300, 44, true);
    tree(1150, 386, 30, false); tree(1225, 392, 32, false); tree(1300, 392, 26, false); tree(1040, 392, 26, false);
    x.fillStyle = '#e9ebf3'; x.fillRect(bx, 418, bw, 14); x.strokeStyle = '#b9bfd2'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(bx, 432); x.lineTo(bx + bw, 438); x.stroke();
    x.strokeStyle = '#f7f8fb'; x.lineWidth = 4; for (let lx = bx; lx < bx + bw; lx += 70) { x.beginPath(); x.moveTo(lx, 468); x.lineTo(lx + 36, 470); x.stroke(); }
    x.restore();
  }
  function buildMask() {
    const c = canvas(SW, SH), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, SW, SH);
    x.globalCompositeOperation = 'lighter';
    x.filter = 'blur(18px)'; x.fillStyle = 'rgb(0,0,255)'; SKY.forEach(r => x.fillRect(...r));
    x.filter = 'blur(10px)'; x.fillStyle = 'rgb(0,255,0)';
    for (const [cx, cy, rx, ry] of FOLIAGE) { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); x.fill(); }
    x.filter = 'blur(6px)'; x.fillStyle = 'rgb(255,0,0)'; GLINT.forEach(r => x.fillRect(...r));
    return c;
  }
  function crop(img, r, feather = 6) { // a block of the infographic with soft edges
    const [x, y, w, h] = r, c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, x, y, w, h, 0, 0, w, h);
    const m = canvas(w, h), mg = m.getContext('2d'); mg.filter = `blur(${feather / 2}px)`; mg.fillStyle = '#fff';
    mg.fillRect(feather, feather, w - feather * 2, h - feather * 2);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
    return { x, y, w, h, img: c };
  }
  function inkOf(l, thr = 120) { // only the dark (text and outline) pixels of a layer
    const c = canvas(l.w, l.h), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(l.img, 0, 0);
    const id = g.getImageData(0, 0, l.w, l.h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = .3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2];
      d[i + 3] = d[i + 3] * clamp((thr - lum) / 40);
    }
    g.putImageData(id, 0, 0); return c;
  }
  function tint(src, color) { const c = canvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); return c; }

  async function mount(out, src, opts = {}) {
    const ctx = out.getContext('2d');
    const img = await loadImg(src);
    const plate = buildPlate(img), mask = buildMask();
    const L = {};
    for (const k of ['title', 'sub', 'caso', 'tag', 'card', 'note', 'bottom', 'marquee', 'stopSign', 'bottomMR']) L[k] = crop(img, R[k], k === 'marquee' || k === 'stopSign' ? 3 : 6);
    L.steps = R.steps.map(r => crop(img, r)); L.arrows = R.arrows.map(r => crop(img, r, 4));
    for (const k of ['title', 'caso']) { L[k].ink = inkOf(L[k], k === 'title' ? 100 : 115); L[k].gold = tint(L[k].ink, 'rgb(255,220,150)'); }
    L.steps[MI_RUTA].ink = inkOf(L.steps[MI_RUTA], 115);
    L.marquee.glow = tint(inkOf(L.marquee, 255), 'rgba(255,200,90,1)'); // whole sign, for the LED glow
    { // the bus without the laptop that covers its side, and the laptop alone to draw in front of the moving bus
      const [bx, by, bw, bh] = BUS_BOX, c = canvas(bw, bh), g = c.getContext('2d');
      g.translate(-bx, -by); polyPath(g, BUS_POLY); g.clip(); g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'destination-out'; polyPath(g, LAPTOP_POLY); g.fill();
      L.busCut = { x: bx, y: by, w: bw, h: bh, img: c };
      const xs = LAPTOP_POLY.map(p => p[0]), ys = LAPTOP_POLY.map(p => p[1]), lx = Math.min(...xs), ly = Math.min(...ys);
      const lw = Math.max(...xs) - lx, lh = Math.max(...ys) - ly, d = canvas(lw, lh), h = d.getContext('2d');
      h.translate(-lx, -ly); polyPath(h, LAPTOP_POLY); h.clip(); h.drawImage(img, 0, 0);
      L.laptop = { x: lx, y: ly, w: lw, h: lh, img: d };
    }

    // WebGL landscape, with a 2D fallback
    const gc = canvas(OW, OH); let gl = null, U = null;
    try { gl = gc.getContext('webgl', { preserveDrawingBuffer: true, antialias: false }); if (gl) U = initGL(gl, plate, mask); } catch (e) { gl = null; }

    // Particles of the title (assembled from scattered gold dust)
    const titlePts = [];
    { const l = L.title, d = l.ink.getContext('2d').getImageData(0, 0, l.w, l.h).data;
      for (let y = 0; y < l.h; y += 3) for (let i = 0; i < l.w; i += 3) {
        if (d[(y * l.w + i) * 4 + 3] > 140 && rnd() < .6) {
          const tx = l.x + i, ty = l.y + y, a = rnd() * Math.PI * 2, r = 160 + rnd() * 460;
          const sx = tx + Math.cos(a) * r * 1.4, sy = ty + Math.sin(a) * r * .7, sw = (rnd() < .5 ? -1 : 1) * (120 + rnd() * 260);
          titlePts.push({ tx, ty, sx, sy, cx: (sx + tx) / 2 - (ty - sy) * .35 + sw * .3, cy: (sy + ty) / 2 + (tx - sx) * .18,
            delay: .55 * (i / l.w) + rnd() * .3, dur: 1.0 + rnd() * .5, s: .9 + rnd() * 1.4, tw: rnd() * 6.28 });
        }
      } }
    const sweepC = canvas(L.title.w, L.title.h), sweepX = sweepC.getContext('2d');
    // Ambient layer: light motes and birds over the sky
    const motes = [], birds = [];
    for (let i = 0; i < 40; i++) motes.push({ x: rnd() * OW, y: rnd() * OH, vx: 6 + rnd() * 14, vy: -(4 + rnd() * 12), r: 2 + rnd() * 6, ph: rnd() * 6.28, sp: .6 + rnd() * 1.6 });
    [[0, 150, 70, 1, 0], [-60, 175, 66, .8, 1.3], [-30, 128, 74, .7, 2.1], [-300, 110, 60, .9, .6], [-360, 140, 62, .65, 2.9]]
      .forEach(([x0, y, v, s, ph]) => birds.push({ x0, y, v, s, ph }));
    const moteSprite = canvas(64, 64); { const m = moteSprite.getContext('2d'), g = m.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,240,205,1)'); g.addColorStop(.35, 'rgba(255,226,170,.45)'); g.addColorStop(1, 'rgba(255,220,160,0)');
      m.fillStyle = g; m.fillRect(0, 0, 64, 64); }
    const spotC = canvas(SW, SH), spotX = spotC.getContext('2d');

    // ---------- camera ----------
    // The infographic reaches its edges, so the zoom is gentler than in the template (1.05 → 1.00) and stays centred
    const camera = t => { const z = eIO(t / DUR); return { zoom: 1.05 - .05 * z, cx: SW / 2, cy: SH / 2 }; };
    const setCam = c => { const kx = OW / SW * c.zoom, ky = OH / SH * c.zoom; ctx.setTransform(kx, 0, 0, ky, OW / 2 - c.cx * kx, OH / 2 - c.cy * ky); };

    // ---------- drawing helpers ----------
    function drawLayer(l, { alpha = 1, dx = 0, dy = 0, blur = 0, sx = 1, sy = 1, rot = 0, clip = null, img = l.img, glow = 0, glowCol = GOLD } = {}) {
      if (alpha <= .002) return; ctx.save();
      if (clip) { ctx.beginPath(); ctx.rect(clip[0], clip[1], clip[2], clip[3]); ctx.clip(); }
      ctx.globalAlpha = alpha; if (blur > .05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
      if (glow > .01) { ctx.shadowColor = `rgba(${glowCol},${glow})`; ctx.shadowBlur = 30; }
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2; ctx.translate(cx + dx, cy + dy); if (rot) ctx.rotate(rot); ctx.scale(sx, sy);
      ctx.drawImage(img, -l.w / 2, -l.h / 2); ctx.restore();
    }
    const riseMasked = (l, p, blurMax = 3) => { const e = eExpo(p);
      drawLayer(l, { alpha: clamp(p * 3), dy: (1 - e) * l.h * .6, blur: (1 - e) * blurMax, clip: [l.x - 20, l.y - 8, l.w + 40, l.h + 16] }); };
    function sweep(l, ink, p, strength = 1) { // golden light running across the text only
      if (p <= 0 || p >= 1) return; const X = sweepX, w = l.w, h = l.h;
      if (sweepC.width !== w || sweepC.height !== h) { sweepC.width = w; sweepC.height = h; }
      X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, w, h); X.drawImage(ink, 0, 0);
      X.globalCompositeOperation = 'source-in'; const pos = -200 + (w + 400) * eIO(p);
      const g = X.createLinearGradient(pos - 90, 0, pos + 90, h * .6); g.addColorStop(0, 'rgba(255,215,130,0)'); g.addColorStop(.5, `rgba(255,214,120,${strength})`); g.addColorStop(1, 'rgba(255,215,130,0)');
      X.fillStyle = g; X.fillRect(0, 0, w, h); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sweepC, l.x, l.y); ctx.restore();
    }
    function ring(x, y, r0, grow, p, col = GOLD, width = 3, alpha = .8) {
      if (p <= 0 || p >= 1) return; ctx.save(); ctx.strokeStyle = `rgba(${col},${(1 - p) * alpha})`; ctx.lineWidth = width * (1 - p) + .5;
      ctx.beginPath(); ctx.arc(x, y, r0 + p * grow, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    function ringRect(r, grow, p, col = GOLD, width = 3, alpha = .85) { // a rounded outline expanding around a block
      if (p <= 0 || p >= 1) return; const [x, y, w, h] = r, g = p * grow;
      ctx.save(); ctx.strokeStyle = `rgba(${col},${(1 - p) * alpha})`; ctx.lineWidth = width * (1 - p) + .5;
      roundRect(ctx, x - 6 - g, y - 6 - g, w + 12 + g * 2, h + 12 + g * 2, 16 + g * .5); ctx.stroke(); ctx.restore();
    }
    function burst(x, y, p, col, seedA = 0, r0 = 50) {
      if (p <= 0 || p >= 1) return; ctx.save();
      for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + seedA, d = r0 + eOut(p) * (50 + (k % 3) * 20), s = 3 * (1 - p) + .6;
        ctx.fillStyle = `rgba(${col},${(1 - p) * .85})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    function glowSpot(x, y, r, a, col = '255,214,120') {
      if (a <= .01) return; ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    const pulse = (t, sp = 1.6, ph = 0) => .5 + .5 * Math.sin(t * sp + ph);

    // ---------- sequence ----------
    function drawTitle(t) {
      const l = L.title, t0 = T.title, solid = eOut(prog(t, t0 + 1.2, .9));
      if (t > t0 - .3 && solid < 1) {
        ctx.save();
        for (const q of titlePts) {
          const pr = prog(t, t0 + q.delay, q.dur), e = eIO(pr), u = 1 - e;
          const x = u * u * q.sx + 2 * u * e * q.cx + e * e * q.tx, y = u * u * q.sy + 2 * u * e * q.cy + e * e * q.ty;
          const a = clamp((t - t0 + .3) / .5) * (1 - solid) * (.7 + .3 * Math.sin(t * 9 + q.tw)); if (a < .02) continue;
          ctx.fillStyle = pr < 1 ? `rgba(196,146,48,${a})` : `rgba(20,24,40,${a})`;
          const s = q.s * (pr < 1 ? 1.9 : 1.7); ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
        ctx.restore();
      }
      drawLayer(l, { alpha: solid, blur: (1 - solid) * 2 });
      const f = prog(t, t0 + 1.2, 1.0);
      if (f > 0 && f < 1) { ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * f) * .6; ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(6px)'; ctx.drawImage(l.gold, l.x, l.y); ctx.restore(); }
      sweep(l, l.ink, prog(t, t0 + 2.0, 1.3), .9); sweep(l, l.ink, prog(t, T.sweep2, 1.3), .8);
    }
    function drawCaso(t) { // "Caso práctico: Mi Ruta": seal entrance, ring, burst, sweep and a lasting golden glow
      const l = L.caso, p = prog(t, T.caso, 1.3); if (p <= 0) return; const e = eBack(p), [cx, cy] = center(R.caso);
      const glow = p >= 1 ? .35 + .3 * pulse(t, 2.2) : 0;
      drawLayer(l, { alpha: clamp(p * 2.2), sx: .55 + .45 * e, sy: .55 + .45 * e, rot: (1 - eOut(p)) * -.12, glow });
      ringRect(R.caso, 70, prog(t, T.caso + .45, 1.2), GOLD, 4); ringRect(R.caso, 45, prog(t, T.caso + .65, 1.1), '232,121,160', 3);
      burst(cx, cy, prog(t, T.caso + .5, 1.1), '232,121,160', .3, 240); burst(cx, cy, prog(t, T.caso + .55, 1.1), GOLD, 1.1, 270);
      sweep(l, l.ink, prog(t, T.caso + 1.3, 1.2), 1);
    }
    function drawTag(t) { // brush wipe left → right with a light at its head
      const l = L.tag, p = prog(t, T.tag, 1.1); if (p <= 0) return; const e = eIO(p), w = l.w * e;
      drawLayer(l, { clip: [l.x - 4, l.y - 6, w + 4, l.h + 12] });
      if (p < 1) glowSpot(l.x + w, l.y + l.h * .5, 30, .9, '160,200,255');
    }
    function drawCard(t) { // course card slides in from the left with a soft shadow
      const l = L.card, p = prog(t, T.card, 1.0); if (p <= 0) return; const e = eExpo(p);
      ctx.save(); ctx.globalAlpha = clamp(p * 1.8); ctx.shadowColor = `rgba(20,37,79,${.16 * clamp(p * 1.5)})`; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
      const sc = .965 + .035 * e; ctx.translate(l.x + l.w / 2 - (1 - e) * 120, l.y + l.h / 2); ctx.scale(sc, sc); ctx.drawImage(l.img, -l.w / 2, -l.h / 2); ctx.restore();
    }
    function drawNote(t) {
      const l = L.note, p = prog(t, T.note, 1.1); if (p <= 0) return; const e = eBack(p);
      drawLayer(l, { alpha: clamp(p * 2.5), sx: .6 + .4 * e, sy: .6 + .4 * e, rot: (1 - eOut(p)) * .35 });
    }
    // Bus pose while it drives up to the stop: it grows from far down the road, decelerates and brakes with a nose dip
    function busPose(t) {
      const p = prog(t, T.bus, T.busDrive); if (p <= 0) return null;
      const e = 1 - Math.pow(1 - p, 2.4), tb = t - T.bus - T.busDrive;
      const settle = tb > 0 ? Math.exp(-tb * 3.4) * Math.sin(tb * 10) : 0; // damped suspension after braking
      return { a: clamp(p * 5), s: .42 + .58 * e, moving: p < 1,
        roll: p < 1 ? .9 * Math.sin(t * 22) * (1 - e) : 0, bounce: 2.2 * settle, pitch: .02 * settle };
    }
    function busTransform(pose) { // grow from the rear (BUS_ANCHOR), then pitch around the front wheels
      const [ax, ay] = BUS_ANCHOR, [nx, ny] = BUS_NOSE;
      ctx.translate(ax, ay + pose.roll + pose.bounce); ctx.scale(pose.s, pose.s); ctx.translate(-ax, -ay);
      ctx.translate(nx, ny); ctx.rotate(pose.pitch); ctx.translate(-nx, -ny);
    }
    function drawBus(t) { // arrival at the stop, headlights, LED sign lighting up, stop sign and map pin pulses
      const pose = busPose(t); if (!pose) return; const stopAt = T.bus + T.busDrive;
      ctx.save(); busTransform(pose);
      ctx.save(); ctx.globalAlpha = pose.a * .16; ctx.fillStyle = '#1e2846'; ctx.filter = 'blur(4px)';
      ctx.beginPath(); ctx.ellipse(1165, 488, 180, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.globalAlpha = pose.a; ctx.drawImage(L.busCut.img, L.busCut.x, L.busCut.y); ctx.globalAlpha = 1;
      // headlights: on while driving, two flashes once stopped, then a soft glow
      for (const [hx, hy] of HEADLIGHTS) {
        const flash = Math.max(Math.sin(Math.PI * prog(t, stopAt + .3, .35)), Math.sin(Math.PI * prog(t, stopAt + .7, .35)));
        glowSpot(hx, hy, 60, pose.a * (pose.moving ? .55 : .85 * flash + .18 * clamp((t - stopAt - 1) / .5) * pulse(t, 3)), '255,226,140');
      }
      // LED sign: three flickers, then a steady breathing glow
      const on = t < stopAt + .2 ? 0 : t < stopAt + .8 ? (Math.floor((t - stopAt - .2) * 10) % 2) : 1;
      if (on) { const a = t < stopAt + .8 ? .9 : .45 + .35 * pulse(t, 2.6);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.filter = 'blur(5px)'; ctx.drawImage(L.marquee.glow, L.marquee.x, L.marquee.y); ctx.restore();
        drawLayer(L.marquee, { glow: a * .8, glowCol: '255,190,80' }); }
      ctx.restore();
      drawLayer(L.laptop); // the student's laptop stays in front of the bus
      // dust from the wheels while braking
      const dp = prog(t, stopAt - .3, 1.2);
      if (dp > 0 && dp < 1) { ctx.save();
        for (const [wx, wy] of WHEELS) for (let k = 0; k < 7; k++) { const d = eOut(dp);
          ctx.fillStyle = `rgba(165,170,190,${(1 - dp) * .32})`; ctx.beginPath();
          ctx.arc(wx - d * (18 + k * 10), wy - d * (3 + (k % 3) * 6), 4 + dp * (8 + k), 0, Math.PI * 2); ctx.fill(); }
        ctx.restore(); }
      const ps = prog(t, stopAt + .5, .9);
      if (ps > 0) { drawLayer(L.stopSign, { sx: 1 + .08 * Math.sin(Math.PI * ps), sy: 1 + .08 * Math.sin(Math.PI * ps), glow: ps >= 1 ? .25 + .25 * pulse(t, 2, 1) : .6 });
        ringRect(R.stopSign, 40, ps, GOLD, 3); }
      const pp = ((t - stopAt - .9) * .6) % 1; if (t > stopAt + .9) { ring(1573, 352, 6, 26, pp, '220,60,70', 3, .9); glowSpot(1573, 352, 16, .35 * pulse(t, 4), '255,120,120'); }
    }
    function drawSteps(t) { // the 7-step flow: cards rise in turn, icons ring and burst; step 3 (Mi Ruta) is emphasised
      const cols = ['232,121,160', '214,170,70', '70,150,110', '90,140,210', '50,110,220', '60,160,110', '214,170,70'];
      L.steps.forEach((l, i) => {
        const t0 = T.steps + i * T.stepGap, p = prog(t, t0, .9); if (p <= 0) return; const e = eExpo(p), mr = i === MI_RUTA;
        const glow = mr && p >= 1 ? .35 + .35 * pulse(t, 2.4) : 0;
        ctx.save(); ctx.globalAlpha = clamp(p * 1.8);
        if (glow) { ctx.shadowColor = `rgba(${GOLD},${glow})`; ctx.shadowBlur = 34; } else { ctx.shadowColor = `rgba(20,37,79,${.14 * clamp(p * 1.5)})`; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; }
        const sc = mr ? 1 + .05 * Math.sin(Math.PI * prog(t, t0 + .5, .8)) : .97 + .03 * e;
        ctx.translate(l.x + l.w / 2, l.y + l.h / 2 + (1 - e) * 50); ctx.scale(sc, sc); ctx.drawImage(l.img, -l.w / 2, -l.h / 2); ctx.restore();
        const ix = l.x + l.w / 2, iy = 628;
        ring(ix, iy, 46, mr ? 90 : 46, prog(t, t0 + .3, 1.0), mr ? GOLD : cols[i], mr ? 4 : 3);
        burst(ix, iy, prog(t, t0 + .35, 1.0), mr ? GOLD : cols[i], i, mr ? 60 : 46);
        if (mr) sweep(l, l.ink, prog(t, t0 + 1.0, 1.1), .9);
        if (p >= 1) { const ph = ((t - t0) * .45 + i * .33) % 1; ring(ix, iy, 46, 16, ph, mr ? GOLD : cols[i], 1.5, mr ? .7 : .35); }
      });
      // arrows on top of both neighbour cards, drawn left → right once the card on their left has risen
      L.arrows.forEach((a, i) => { const pa = prog(t, T.steps + i * T.stepGap + .35, .5);
        if (pa > 0) drawLayer(a, { clip: [a.x, a.y - 4, a.w * eIO(pa), a.h + 8] }); });
    }
    function drawBottom(t) {
      riseMasked(L.bottom, prog(t, T.bottom, 1.0), 4);
      const p = prog(t, T.bottom + .8, .9); if (p <= 0) return;
      drawLayer(L.bottomMR, { glow: p >= 1 ? .3 + .3 * pulse(t, 2.2, 2) : .7 * p, sx: 1 + .06 * Math.sin(Math.PI * p), sy: 1 + .06 * Math.sin(Math.PI * p) });
      ringRect(R.bottomMR, 40, p, GOLD, 3);
    }
    function drawSpot(t) { // spotlight on every Mi Ruta element
      const [s0, s1] = T.spot, a = Math.min(eIO(prog(t, s0, .7)), 1 - eIO(prog(t, s1 - .7, .7))); if (a <= .01) return;
      const items = [R.caso, [1105, 240, 225, 210], R.stopSign, R.steps[MI_RUTA], R.bottomMR];
      spotX.globalCompositeOperation = 'source-over'; spotX.clearRect(0, 0, SW, SH); spotX.fillStyle = 'rgba(13,23,48,.62)'; spotX.fillRect(0, 0, SW, SH);
      spotX.globalCompositeOperation = 'destination-out'; spotX.filter = 'blur(14px)'; spotX.fillStyle = '#000';
      for (const [x, y, w, h] of items) { roundRect(spotX, x - 10, y - 10, w + 20, h + 20, 22); spotX.fill(); }
      spotX.filter = 'none';
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(spotC, 0, 0); ctx.restore();
      ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 4;
      items.forEach(([x, y, w, h], i) => { ctx.strokeStyle = `rgba(255,214,120,${.55 + .45 * pulse(t, 3, i)})`; roundRect(ctx, x - 8, y - 8, w + 16, h + 16, 18); ctx.stroke(); });
      ctx.restore();
    }
    function drawAmbient(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); const amb = clamp((t - 1.6) / 1.5); if (amb <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) { const x = (m.x + m.vx * t + 12 * Math.sin(t * .5 + m.ph)) % OW, y = ((m.y + m.vy * t) % OH + OH) % OH;
        const a = amb * (.10 + .16 * Math.sin(t * m.sp + m.ph)); if (a <= 0) continue; ctx.globalAlpha = a; const s = m.r * 4; ctx.drawImage(moteSprite, x - s / 2, y - s / 2, s, s); }
      ctx.restore();
      ctx.save(); const x0 = 1040, span = OW - x0 + 200;
      for (const b of birds) { const x = x0 - 100 + (((b.x0 + b.v * t) % span) + span) % span, y = b.y + 6 * Math.sin(t * .9 + b.ph); if (x > OW + 40) continue;
        const fl = Math.sin(t * 9 + b.ph), s = 11 * b.s, wy = -fl * s * .6, fade = clamp((x - x0 + 100) / 120);
        ctx.strokeStyle = `rgba(60,72,95,${.7 * amb * fade})`; ctx.lineWidth = Math.max(1.2, 2 * b.s); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - s, y + wy); ctx.quadraticCurveTo(x - s * .45, y + wy * .2 - s * .25, x, y); ctx.quadraticCurveTo(x + s * .45, y + wy * .2 - s * .25, x + s, y + wy); ctx.stroke(); }
      ctx.restore();
    }
    function drawScene(t) {
      const cam = camera(t);
      if (gl) {
        gl.uniform1f(U.uT, t); gl.uniform1f(U.uZoom, cam.zoom); gl.uniform2f(U.uCenter, cam.cx, cam.cy);
        gl.uniform1f(U.uReveal, eIO(prog(t, T.reveal[0], T.reveal[1]))); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(gc, 0, 0);
      } else { setCam(cam); ctx.drawImage(plate, 0, 0); }
      setCam(cam);
      drawBus(t); drawNote(t); drawTitle(t);
      { const p = prog(t, T.sub, 1.2), e = eExpo(p); drawLayer(L.sub, { alpha: clamp(p * 1.6), dy: (1 - e) * 18, blur: (1 - e) * 7 }); }
      drawCaso(t); drawTag(t); drawCard(t); drawSteps(t); drawBottom(t); drawSpot(t);
      drawAmbient(t);
    }

    // ---------- audio: city ambience and effects (the music lives in the deck) ----------
    const AU = { ctx: null, master: null, buses: {}, session: null, timers: [], level: 1, horn: null };
    // Real horn of a MAN city bus (assets/bus-horn.wav, a 0.85 s double beep cut from "WWS CityBusMANSG220horn.ogg",
    // Work With Sounds / Technical Museum of Slovenia, CC BY 4.0, via Wikimedia Commons). Downloaded now, decoded on unlock.
    const hornData = fetch(src.replace(/[^/]*$/, 'bus-horn.wav')).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))).catch(() => null);
    function unlockAudio() {
      if (AU.ctx) { if (AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {}); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const C = new AC(); AU.ctx = C;
      const master = C.createGain(); master.gain.value = 0; AU.master = master;
      const comp = C.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; master.connect(comp); comp.connect(C.destination);
      for (const [k, v] of [['amb', .45], ['fx', .6]]) { const g = C.createGain(); g.gain.value = v; g.connect(master); AU.buses[k] = g; }
      const len = C.sampleRate * 4, nb = C.createBuffer(2, len, C.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = nb.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
      AU.noise = nb; buildAmbience(); applyLevel();
      AU.hornReady = hornData.then(a => a ? C.decodeAudioData(a.slice(0)) : null).then(b => { AU.horn = b; }).catch(() => {});
      if (running) scheduleFx(now());
    }
    const noiseSrc = () => { const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; s.loop = true; s.start(0, Math.random() * 3.5); return s; };
    const filt = (type, f, q = 1) => { const x = AU.ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
    const gainN = v => { const g = AU.ctx.createGain(); g.gain.value = v; return g; };
    const lfo = (param, freq, depth) => { const o = AU.ctx.createOscillator(), g = gainN(depth); o.frequency.value = freq; o.connect(g); g.connect(param); o.start(); };
    const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
    const panner = v => { const C = AU.ctx; if (C.createStereoPanner) { const p = C.createStereoPanner(); p.pan.value = v; return p; } return gainN(1); };
    function buildAmbience() { // distant traffic, breeze in the trees and birds
      const out = AU.buses.amb;
      const g1 = gainN(.16); chain(noiseSrc(), filt('lowpass', 260, .7), g1, out); lfo(g1.gain, .05, .05);
      const bf = filt('bandpass', 600, .6), g2 = gainN(.05); chain(noiseSrc(), bf, g2, out); lfo(bf.frequency, .05, 300); lfo(g2.gain, .09, .03);
      AU.timers.push(setInterval(() => { if (AU.ctx.state === 'running' && running && Math.random() < .3) chirp(AU.ctx.currentTime + Math.random() * .25, Math.random() * 1.6 - .8, .02 + Math.random() * .04); }, 300));
    }
    function chirp(t0, pan, vol) { const C = AU.ctx, n = 2 + Math.floor(Math.random() * 4), base = 2500 + Math.random() * 1900;
      const o2 = gainN(vol); chain(o2, filt('highpass', 1800, .7), panner(pan), AU.buses.amb); const up = Math.random() < .5;
      for (let i = 0; i < n; i++) { const t = t0 + i * (.08 + Math.random() * .06), o = C.createOscillator(), g = gainN(0), f0 = base * (.9 + Math.random() * .25);
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (up ? 1.4 : .68), t + .07);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + .085);
        o.connect(g); g.connect(o2); o.start(t); o.stop(t + .1); } }
    function swoosh(dst, t, d, f0, f1, v) { const s = noiseSrc(), f = filt('bandpass', f0, 1.2), g = gainN(0);
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + d * .6); g.gain.linearRampToValueAtTime(0, t + d); chain(s, f, g, dst); s.stop(t + d + .1); }
    function ping(dst, t, f, v, dec, pan = 0, type = 'sine') { const o = AU.ctx.createOscillator(), g = gainN(0); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + dec);
      chain(o, g, panner(pan), dst); o.start(t); o.stop(t + dec + .05); }
    function shimmer(dst, t, d) { const notes = [1568, 1760, 2093, 2349, 2637, 3136, 3520];
      for (let i = 0; i < 30; i++) ping(dst, t + Math.pow(Math.random(), .8) * d, notes[Math.floor(Math.random() * notes.length)] * (Math.random() < .3 ? 2 : 1), .03 + Math.random() * .03, .6 + Math.random() * .5, Math.random() * 1.4 - .7); }
    function bell(dst, t, base, v) { const lp = filt('lowpass', 3500, .5); lp.connect(dst);
      for (const [r, a, d] of [[.5, .5, 7], [1, 1, 5], [1.19, .45, 4], [1.5, .35, 3.5], [2, .4, 3], [2.52, .2, 2.2], [3, .15, 1.8]]) ping(lp, t, base * r, v * a, d); }
    function boom(dst, t, v) { const o = AU.ctx.createOscillator(), g = gainN(0); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(42, t + 1.2);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + 1.6); chain(o, g, dst); o.start(t); o.stop(t + 1.7); }
    function engine(dst, t, d, v) { const s = noiseSrc(), f = filt('lowpass', 140, 2), g = gainN(0); lfo(f.frequency, 18, 40);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + d * .4); g.gain.linearRampToValueAtTime(v * .35, t + d); g.gain.linearRampToValueAtTime(0, t + d + 1.5);
      chain(s, f, g, dst); s.stop(t + d + 1.6); }
    function hiss(dst, t, d, v) { const s = noiseSrc(), f = filt('highpass', 3500, .7), g = gainN(0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .03); g.gain.exponentialRampToValueAtTime(.001, t + d); chain(s, f, g, dst); s.stop(t + d + .05); }
    function horn(dst, t, v) { const lp = filt('lowpass', 1400, .8); lp.connect(dst);
      for (const [dt, f] of [[0, 466], [.2, 466]]) { ping(lp, t + dt, f, v, .16, 0, 'sawtooth'); ping(lp, t + dt, f * 1.26, v * .7, .16, 0, 'sawtooth'); } }
    function busHorn(dst, when, v) { // the recorded horn once it is decoded; the synthesised one meanwhile or if it failed to load
      const play = () => {
        if (AU.session !== dst || when < AU.ctx.currentTime) return;
        if (!AU.horn) { horn(dst, when, .05); return; }
        const s = AU.ctx.createBufferSource(); s.buffer = AU.horn; chain(s, gainN(v), panner(.3), dst); s.start(when);
      };
      if (AU.horn) play(); else (AU.hornReady || Promise.resolve()).then(play);
    }
    function scheduleFx(t) { // effects for the remaining part of the timeline, starting at animation time t
      if (!AU.ctx || AU.ctx.state !== 'running') return;
      if (AU.session) { try { AU.session.disconnect(); } catch (e) {} }
      const sg = gainN(1); sg.connect(AU.buses.fx); AU.session = sg; const base = AU.ctx.currentTime + .03 - t;
      const at = (s, fn) => { if (s >= t - .05) fn(base + s); };
      at(.1, x => swoosh(sg, x, 2.4, 250, 1600, .08));
      at(T.title - .2, x => { swoosh(sg, x, 1.8, 300, 5200, .12); shimmer(sg, x + .2, 1.5); });
      at(T.title + 1.2, x => bell(sg, x, 392, .13));
      at(T.sub, x => ping(sg, x, 1318, .04, 1.4));
      at(T.caso, x => { boom(sg, x, .18); bell(sg, x + .45, 523.25, .12); shimmer(sg, x + .5, 1.0); });
      at(T.tag, x => swoosh(sg, x, 1.1, 180, 900, .09));
      at(T.card, x => swoosh(sg, x, .8, 500, 3000, .07));
      at(T.note, x => ping(sg, x + .2, 988, .06, 1.2, .5));
      const stopAt = T.bus + T.busDrive; // engine while it approaches, air brakes, then a short horn at the stop
      at(T.bus, x => { engine(sg, x, T.busDrive, .24); hiss(sg, x + T.busDrive - .15, .55, .06); busHorn(sg, x + T.busDrive + .25, .5); });
      at(stopAt + .5, x => ping(sg, x, 1175, .05, 1.2, .6));
      [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66].forEach((f, i) => at(T.steps + i * T.stepGap, x => {
        swoosh(sg, x, .6, 500, 2600, .05); ping(sg, x + .3, f, .07, 1.4, (i - 3) * .2); if (i === MI_RUTA) bell(sg, x + .5, 659.25, .1); }));
      at(T.bottom, x => swoosh(sg, x, 1.0, 200, 1200, .08));
      at(T.spot[0], x => { shimmer(sg, x, 1.2); bell(sg, x + .1, 783.99, .1); });
      at(T.sweep2, x => shimmer(sg, x, .8));
    }
    function applyLevel() { if (AU.master) AU.master.gain.setTargetAtTime(running ? AU.level : 0, AU.ctx.currentTime, .08); }

    // ---------- clock ----------
    let startAt = performance.now(), running = false, raf = 0;
    const now = () => (performance.now() - startAt) / 1000;
    const frame = () => { drawScene(now()); raf = requestAnimationFrame(frame); };
    return {
      DUR,
      // With reduced motion the final frame is shown; the animation plays only when asked for (force = Reproducir / R)
      restart(force = false) {
        startAt = performance.now();
        if (opts.reduced && !force) { this.stop(); drawScene(DUR + 1); return; }
        if (!running) { running = true; raf = requestAnimationFrame(frame); }
        applyLevel(); scheduleFx(0);
      },
      stop() { running = false; cancelAnimationFrame(raf); if (AU.session) { try { AU.session.disconnect(); } catch (e) {} AU.session = null; } applyLevel(); },
      setAudio({ on, vol }) { AU.level = on ? .9 * vol : 0; applyLevel(); },
      unlockAudio,
      renderAt(t) { drawScene(t); return out; },
    };
  }

  window.DECK_ANIMS = window.DECK_ANIMS || {};
  window.DECK_ANIMS.cover = { DUR, mount };
})();
