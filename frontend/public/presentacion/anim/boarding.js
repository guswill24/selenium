// Copyright (c) 2026 guswillsan@hotmail.com. All rights reserved.
// Slide 1 ("¡Amarren sus cinturones!") animation. Overlays drawn on top of the infographic, so the picture is
// never cut or redrawn: cabin lights come on with a slow camera settle, a short turbulence, then light guides the
// eye through the slide (title, flight path, test levels, Selenium IDE, flow steps, goals, destination).
// After the sequence the slide stays alive with subtle ambient effects.
// Interface (same as anim/cover.js): mount(canvas, src, { reduced }) → { DUR, restart, stop, setAudio, unlockAudio, renderAt }.
(() => {
  const SW = 1672, SH = 941, OW = 1920, OH = 1080, DUR = 12.5;

  // Regions of the source infographic, in source pixels
  const R = {
    title: [40, 4, 575, 205], ribbon: [168, 150, 395, 156], banner: [1350, 640, 322, 96], ticket: [1312, 745, 360, 190],
    selenium: [1216, 176, 196, 93], plane: [672, 152], panelTitle: [888, 102], clock: [1641, 682],
  };
  // Test levels (bottom-up, as a pyramid is built): unit, integration, system, acceptance
  const LEVELS = [
    { poly: [[722, 365], [1345, 356], [1360, 428], [718, 441]], color: '139,92,246' },
    { poly: [[740, 288], [1322, 282], [1336, 348], [732, 361]], color: '59,130,246' },
    { poly: [[758, 212], [1186, 200], [1193, 263], [750, 277]], color: '250,204,21' },
    { poly: [[788, 148], [1276, 117], [1292, 197], [785, 211]], color: '34,197,94' },
  ];
  // Outlines that limit each light sweep to its own element (so bright clouds behind it never light up)
  const SHAPES = {
    title: [[48, 60], [540, 12], [618, 58], [612, 145], [120, 236], [95, 206], [40, 150]],
    ribbon: [[172, 212], [545, 150], [556, 195], [549, 262], [262, 307], [228, 256], [182, 246]],
    banner: [[1356, 690], [1380, 668], [1672, 636], [1672, 730], [1362, 740]],
    ticket: [[1314, 802], [1636, 748], [1672, 758], [1672, 935], [1345, 935], [1318, 860]],
  };
  const STEPS = [[738, 487, 88, 113], [836, 490, 110, 118], [957, 495, 138, 125], [1106, 500, 164, 130], [1282, 500, 166, 140], [1462, 505, 180, 140]];
  const TYPES = [[1470, 101], [1470, 149], [1474, 192], [1474, 241], [1480, 290], [1482, 342], [1486, 392]];
  const GOALS = [[38, 562], [36, 598], [37, 634], [36, 669], [36, 706]];
  const NOTEBOOK = [[535, 872], [548, 902], [560, 928]];

  // Timeline (seconds)
  const T = { lights: 0, chime: .35, shake: 1.7, title: 1.2, ribbon: 2.3, trail: 2.6, levels: 3.6, levelGap: .55, selenium: 5.9,
    types: 6.6, typeGap: .16, flow: 7.7, flowDur: 2.6, goals: 10.2, goalGap: .14, banner: 10.9, ticket: 11.5 };

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
  const eIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bump = (t, t0, d) => { const p = (t - t0) / d; return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const loadImg = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function lumMask(img, [x, y, w, h], lo, shape) { // bright pixels of a region (letters, highlights), for light sweeps
    const c = canvas(w, h), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, x, y, w, h, 0, 0, w, h);
    const id = g.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = .3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 255 * clamp((lum - lo) / 70);
    }
    g.putImageData(id, 0, 0);
    if (shape) { // keep only the inside of the element's outline, with a soft edge
      const m = canvas(w, h), mg = m.getContext('2d'); mg.filter = 'blur(3px)'; mg.translate(-x, -y); polyPath(mg, shape); mg.fillStyle = '#fff'; mg.fill();
      g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0); g.globalCompositeOperation = 'source-over';
    }
    return { x, y, w, h, img: c, tmp: canvas(w, h) };
  }
  const polyPath = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  const roundRect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

  async function mount(out, src, opts = {}) {
    const ctx = out.getContext('2d');
    const img = await loadImg(src);
    const M = { title: lumMask(img, R.title, 150, SHAPES.title), ribbon: lumMask(img, R.ribbon, 165, SHAPES.ribbon),
      banner: lumMask(img, R.banner, 140, SHAPES.banner), ticket: lumMask(img, R.ticket, 120, SHAPES.ticket) };
    const motes = [];
    for (let i = 0; i < 26; i++) motes.push({ x: 180 + rnd() * 520, y: 160 + rnd() * 300, vx: 4 + rnd() * 9, vy: -(3 + rnd() * 7), r: 1.5 + rnd() * 3.5, ph: rnd() * 6.28 });
    const moteSprite = canvas(48, 48);
    { const m = moteSprite.getContext('2d'), g = m.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, 'rgba(255,248,225,1)'); g.addColorStop(.4, 'rgba(255,236,190,.4)'); g.addColorStop(1, 'rgba(255,230,180,0)');
      m.fillStyle = g; m.fillRect(0, 0, 48, 48); }
    // Flight path from the plane icon to the panel title
    const P0 = R.plane, P2 = R.panelTitle, P1 = [790, 40];
    const trailAt = u => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
    const flowPts = STEPS.map(([x, y, w, h]) => [x + w / 2, y + h * .42]);

    // ---------- overlays (source coordinates; the camera transform is already applied) ----------
    function sheen(m, p, strength = .6, width = .22) { // a soft diagonal band of light across the bright pixels of m
      if (p <= -width || p >= 1 + width) return;
      const g = m.tmp.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, m.w, m.h); g.drawImage(m.img, 0, 0);
      g.globalCompositeOperation = 'source-in';
      const cx = -m.h * .5 + p * (m.w + m.h), gr = g.createLinearGradient(cx - m.w * width, 0, cx + m.w * width, m.h * .6);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,252,235,${strength})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, m.w, m.h);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(m.tmp, m.x, m.y); ctx.restore();
    }
    function glow(path, color, a, blur = 26) {
      if (a <= .01) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; path();
      ctx.fillStyle = `rgba(${color},${.13 * a})`; ctx.fill();
      ctx.shadowColor = `rgba(${color},${a})`; ctx.shadowBlur = blur; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(${color},${.85 * a})`; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    }
    function sparkle(x, y, t, t0, size = 16) { // a four-point star that blooms and fades
      const p = (t - t0) / .8; if (p <= 0 || p >= 1) return;
      const s = size * Math.sin(Math.PI * p), r = s * .22;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(p * 1.2);
      ctx.drawImage(moteSprite, -s * 1.2, -s * 1.2, s * 2.4, s * 2.4);
      ctx.fillStyle = `rgba(255,250,230,${.9 * Math.sin(Math.PI * p)})`; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r : s; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function rings(x, y, t, t0, color = '255,214,120') { // two expanding rings (the alarm clock "ringing")
      for (let k = 0; k < 2; k++) {
        const p = (t - t0 - k * .35) / 1.3; if (p <= 0 || p >= 1) continue;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${color},${.7 * (1 - p)})`; ctx.lineWidth = 3 * (1 - p) + 1;
        ctx.beginPath(); ctx.arc(x, y, 22 + p * 46, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    function trail(t) {
      const p = clamp((t - T.trail) / 1.3), fade = 1 - clamp((t - T.trail - 2.1) / .9);
      if (p <= 0 || fade <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.setLineDash([2, 13]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = `rgba(255,255,255,${.85 * fade})`; ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(140,200,255,.9)'; ctx.shadowBlur = 12; ctx.beginPath();
      const n = Math.max(2, Math.round(60 * p)); for (let i = 0; i <= n; i++) { const [x, y] = trailAt(p * i / n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      const [hx, hy] = trailAt(eOut(p)); ctx.globalAlpha = fade; ctx.drawImage(moteSprite, hx - 22, hy - 22, 44, 44);
      ctx.restore();
    }
    function flow(t) {
      const p = (t - T.flow) / T.flowDur; if (p <= 0) return;
      const fade = 1 - clamp((t - T.flow - T.flowDur - .2) / .8);
      STEPS.forEach(([x, y, w, h], i) => {
        const a = bump(p * (STEPS.length - 1), i - .55, 1.1) * .9 + (i === 2 ? .35 * clamp((p - .4) / .2) * fade : 0);
        glow(() => roundRect(ctx, x, y, w, h, 12), '125,211,252', a, 22);
      });
      if (fade <= 0) return;
      const u = clamp(p) * (STEPS.length - 1), i = Math.min(STEPS.length - 2, Math.floor(u)), f = u - i;
      const [ax, ay] = flowPts[i], [bx, by] = flowPts[i + 1], x = ax + (bx - ax) * eIO(f), y = ay + (by - ay) * eIO(f);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade; ctx.drawImage(moteSprite, x - 26, y - 26, 52, 52); ctx.restore();
    }

    // ---------- scene ----------
    function drawScene(t, still = false) {
      const k = OW / SW;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = '#0d1730'; ctx.fillRect(0, 0, OW, OH);
      // Camera: settles from 1.08 to 1.00; a short turbulence after the seat-belt chime
      const z = still ? 1 : 1 + .08 * (1 - eOut(t / 4.2));
      let dx = 0, dy = 0;
      if (!still && t > T.shake && t < T.shake + 1.2) { const a = 5 * (1 - (t - T.shake) / 1.2); dx = a * Math.sin(t * 43); dy = a * .7 * Math.sin(t * 59 + 1); }
      ctx.setTransform(k * z, 0, 0, k * z, OW / 2 - SW / 2 * k * z + dx * k, OH / 2 - SH / 2 * k * z + dy * k);
      ctx.globalAlpha = still ? 1 : eOut(t / 1.3); ctx.drawImage(img, 0, 0); ctx.globalAlpha = 1;

      if (!still) {
        // Ambient: light motes drifting past the window
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const m of motes) {
          const x = 180 + ((m.x - 180 + m.vx * t) % 520 + 520) % 520, y = 160 + ((m.y - 160 + m.vy * t) % 300 + 300) % 300;
          ctx.globalAlpha = (.25 + .25 * Math.sin(t * 1.3 + m.ph)) * clamp(t / 2); const s = m.r * 6; ctx.drawImage(moteSprite, x - s / 2, y - s / 2, s, s);
        }
        ctx.restore();

        // Sequence
        sheen(M.title, (t - T.title) / 1.3, .7);
        sheen(M.ribbon, (t - T.ribbon) / 1.1, .55);
        trail(t);
        LEVELS.forEach((l, i) => glow(() => polyPath(ctx, l.poly), l.color, bump(t, T.levels + i * T.levelGap, 1.15) * .95));
        const [sx, sy, sw, sh] = R.selenium;
        const selA = clamp((t - T.selenium) / .5) * (.55 + .3 * Math.sin((t - T.selenium) * 2.1)) + bump(t, T.selenium, .9) * .5;
        glow(() => roundRect(ctx, sx, sy, sw, sh, 12), '255,214,90', selA, 30);
        sparkle(sx + 40, sy + 26, t, T.selenium + .1, 22);
        TYPES.forEach(([x, y], i) => sparkle(x, y, t, T.types + i * T.typeGap, 15));
        flow(t);
        GOALS.forEach(([x, y], i) => sparkle(x, y, t, T.goals + i * T.goalGap, 13));
        NOTEBOOK.forEach(([x, y], i) => sparkle(x, y, t, T.goals + .4 + i * T.goalGap, 12));
        sheen(M.banner, (t - T.banner) / 1.0, .6);
        rings(...R.clock, t, T.banner + .3);
        sheen(M.ticket, (t - T.ticket) / 1.1, .45);
        sparkle(1374, 870, t, T.ticket + .5, 20);

        // After the sequence: the slide stays alive (title shine, ringing clock, destination glint)
        if (t > DUR) {
          const u = t - DUR;
          sheen(M.title, (u % 9 - 3) / 1.4, .5);
          rings(...R.clock, u % 6, 1.5);
          sheen(M.ticket, (u % 11 - 6) / 1.2, .35);
        }
      } else {
        glow(() => roundRect(ctx, ...R.selenium, 12), '255,214,90', .55, 30);
      }

      // Cabin lights: a warm wash fades out as the scene comes up
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (!still && t < 2) { ctx.fillStyle = `rgba(13,23,48,${.55 * (1 - eOut(t / 2))})`; ctx.fillRect(0, 0, OW, OH); }
    }

    // ---------- audio (Web Audio; follows the Audio button and the volume) ----------
    const AU = { ctx: null, master: null, session: null, level: 0, noise: null };
    function unlockAudio() {
      try {
        if (!AU.ctx) {
          AU.ctx = new (window.AudioContext || window.webkitAudioContext)();
          AU.master = AU.ctx.createGain(); AU.master.gain.value = 0; AU.master.connect(AU.ctx.destination);
          const n = AU.ctx.createBuffer(1, AU.ctx.sampleRate * 2, AU.ctx.sampleRate), d = n.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; AU.noise = n;
          if (running) scheduleFx(now());
        }
        if (AU.ctx.state === 'suspended') AU.ctx.resume();
      } catch (e) { /* audio is optional */ }
      applyLevel();
    }
    function tone(dst, at, f, v, dec, type = 'sine') {
      const o = AU.ctx.createOscillator(), g = AU.ctx.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .015); g.gain.exponentialRampToValueAtTime(.0008, at + dec);
      o.connect(g); g.connect(dst); o.start(at); o.stop(at + dec + .05);
    }
    function chime(dst, at) { // the cabin seat-belt "bing-bong"
      [[1046.5, 0], [830.6, .55]].forEach(([f, d]) => { tone(dst, at + d, f, .16, 1.9); tone(dst, at + d, f * 2, .03, .9); tone(dst, at + d, f * 3.01, .012, .5); });
    }
    function whoosh(dst, at, dur, v) {
      const s = AU.ctx.createBufferSource(), f = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain(); s.buffer = AU.noise;
      f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, at); f.frequency.exponentialRampToValueAtTime(2400, at + dur);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + dur * .5); g.gain.linearRampToValueAtTime(0, at + dur);
      s.connect(f); f.connect(g); g.connect(dst); s.start(at); s.stop(at + dur + .05);
    }
    function rumble(dst, at, dur, v) {
      const s = AU.ctx.createBufferSource(), f = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain(); s.buffer = AU.noise;
      f.type = 'lowpass'; f.frequency.value = 160; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .15); g.gain.linearRampToValueAtTime(0, at + dur);
      s.connect(f); f.connect(g); g.connect(dst); s.start(at); s.stop(at + dur + .05);
    }
    function scheduleFx(from) {
      if (!AU.ctx) return;
      if (AU.session) { try { AU.session.disconnect(); } catch (e) {} }
      const sg = AU.ctx.createGain(); sg.connect(AU.master); AU.session = sg;
      const base = AU.ctx.currentTime + .05, at = (time, fn) => { if (time >= from) fn(base + time - from); };
      at(T.chime, x => chime(sg, x));
      at(T.shake, x => rumble(sg, x, 1.2, .5));
      at(T.trail, x => whoosh(sg, x, 1.3, .07));
      [261.63, 329.63, 392, 523.25].forEach((f, i) => at(T.levels + i * T.levelGap, x => tone(sg, x, f, .06, 1.2, 'triangle')));
      at(T.selenium, x => { tone(sg, x, 783.99, .07, 1.6); tone(sg, x + .12, 1174.66, .05, 1.6); });
      [0, 1, 2, 3, 4, 5].forEach(i => at(T.flow + i * T.flowDur / 5, x => tone(sg, x, 587.33 * Math.pow(2, i / 6), .045, .8)));
      at(T.banner + .3, x => [0, .12, .24, .36].forEach(d => tone(sg, x + d, 1568, .025, .12, 'square')));
      at(T.ticket + .5, x => { tone(sg, x, 1046.5, .06, 1.4); tone(sg, x + .1, 1318.5, .05, 1.4); });
    }
    function applyLevel() { if (AU.master) AU.master.gain.setTargetAtTime(running ? AU.level : 0, AU.ctx.currentTime, .08); }

    // ---------- clock ----------
    let startAt = performance.now(), running = false, raf = 0;
    const now = () => (performance.now() - startAt) / 1000;
    const frame = () => { drawScene(now()); raf = requestAnimationFrame(frame); };
    return {
      DUR,
      // With reduced motion a still frame is shown; the animation plays only when asked for (force = Reproducir / R)
      restart(force = false) {
        startAt = performance.now();
        if (opts.reduced && !force) { this.stop(); drawScene(DUR, true); return; }
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
  window.DECK_ANIMS.boarding = { DUR, mount };
})();
