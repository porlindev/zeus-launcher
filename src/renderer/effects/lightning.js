(() => {
  const canvas = document.getElementById('fx-lightning');
  const ctx = canvas.getContext('2d');

  const MAX_BOLTS = 50;
  const MIN_SPAWN_DIST = 10;
  const GOLD_GLOW = '#ffcf40';
  const GOLD_CORE = '#fff6d8';

  const bolts = [];
  let lastX = null;
  let lastY = null;

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function jaggedPoints(x1, y1, x2, y2, displace, depth) {
    if (depth <= 0) {
      return [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ];
    }
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
    const left = jaggedPoints(x1, y1, mx, my, displace * 0.55, depth - 1);
    const right = jaggedPoints(mx, my, x2, y2, displace * 0.55, depth - 1);
    return left.slice(0, -1).concat(right);
  }

  function spawnBolt(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const displace = Math.min(18, Math.max(6, dist * 0.35));
    bolts.push({
      points: jaggedPoints(x1, y1, x2, y2, displace, 3),
      createdAt: performance.now(),
      life: 260 + Math.random() * 180,
      width: 1.4 + Math.random() * 1.2,
    });
    if (bolts.length > MAX_BOLTS) {
      bolts.shift();
    }
  }

  function handlePointerMove(event) {
    const { clientX: x, clientY: y } = event;
    if (lastX === null) {
      lastX = x;
      lastY = y;
      return;
    }
    if (Math.hypot(x - lastX, y - lastY) >= MIN_SPAWN_DIST) {
      spawnBolt(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
    }
  }

  function drawBolt(points, width, alpha) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = GOLD_GLOW;
    ctx.shadowColor = GOLD_GLOW;
    ctx.shadowBlur = 18;
    ctx.lineWidth = width * 3.2;
    ctx.stroke();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = GOLD_CORE;
    ctx.shadowColor = GOLD_GLOW;
    ctx.shadowBlur = 8;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function tick(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = bolts.length - 1; i >= 0; i -= 1) {
      const bolt = bolts[i];
      const t = (now - bolt.createdAt) / bolt.life;
      if (t >= 1) {
        bolts.splice(i, 1);
        continue;
      }
      drawBolt(bolt.points, bolt.width, 1 - t);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove);
  resize();
  requestAnimationFrame(tick);

  // ---------- Thunder (sky strike + sound), Home view only ----------

  const flashEl = document.getElementById('fx-flash');
  const homeView = document.getElementById('view-home');

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function unlockAudio() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  }
  document.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  function playThunder() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const duration = 2.2 + Math.random() * 1.4;
    const volume = 0.32 + Math.random() * 0.14;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, now);
    filter.frequency.exponentialRampToValueAtTime(110, now + duration);
    filter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(volume, now + 0.025);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);

    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(95, now);
    boom.frequency.exponentialRampToValueAtTime(32, now + 0.9);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0, now);
    boomGain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.04);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.start(now);
    boom.stop(now + 1.3);
  }

  function flashScreen() {
    flashEl.classList.add('active');
    setTimeout(() => {
      flashEl.classList.remove('active');
      setTimeout(() => {
        if (Math.random() < 0.4) {
          flashEl.classList.add('active');
          setTimeout(() => flashEl.classList.remove('active'), 40);
        }
      }, 90);
    }, 55);
  }

  function spawnSkyBolt() {
    const x1 = Math.random() * window.innerWidth;
    const y1 = -20;
    const x2 = x1 + (Math.random() - 0.5) * 260;
    const y2 = window.innerHeight * (0.5 + Math.random() * 0.4);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const displace = Math.min(70, Math.max(28, dist * 0.14));
    bolts.push({
      points: jaggedPoints(x1, y1, x2, y2, displace, 5),
      createdAt: performance.now(),
      life: 380 + Math.random() * 240,
      width: 3 + Math.random() * 2.2,
    });
    if (bolts.length > MAX_BOLTS) {
      bolts.shift();
    }
  }

  function isHomeVisible() {
    return homeView && !homeView.classList.contains('hidden');
  }

  function strikeThunder() {
    spawnSkyBolt();
    flashScreen();
    playThunder();
  }

  function scheduleNextThunder() {
    const delay = 18000 + Math.random() * 37000;
    setTimeout(() => {
      if (isHomeVisible()) {
        strikeThunder();
      }
      scheduleNextThunder();
    }, delay);
  }

  scheduleNextThunder();
})();
