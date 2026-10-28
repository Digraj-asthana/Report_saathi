/**
 * AarogyamAi - High-Performance 3D DNA Background Engine
 * Darkened, ultra-smooth motion with accelerated scroll dynamics and lag-free rendering.
 */

export const COOL_LAB_THEME = {
  id: 'coollab',
  name: 'Cool Lab Balanced Contrast',
  strand1: 'rgba(29, 78, 137, 0.48)',      // Deep cobalt strand
  strand1Hex: '#1D4E89',
  strand2: 'rgba(91, 138, 192, 0.42)',     // Sky cobalt strand
  strand2Hex: '#5B8AC0',
  rungs: 'rgba(88, 120, 152, 0.52)',       // Defined base-pair rungs
  rungsHex: '#587898',
  nodes: 'rgba(228, 87, 46, 0.65)',       // Vivid medical orange nodes
  nodesHex: '#E4572E',
  glow: 'none',
  glowColor: 'transparent',
  glowBlur: 0,
  bgTone: '#F4F8FC',
  cardBg: 'rgba(255, 255, 255, 0.94)',
  accent: '#1D4E89',
  accentSecondary: '#7FA7D9',
  accentHighlight: '#E4572E'
};

export class BackgroundEngine {
  constructor(options = {}) {
    this.frameCanvas = options.frameCanvas;
    this.helixCanvas = options.helixCanvas;
    this.container = options.container;
    this.totalFrames = 227;
    this.frames = new Array(this.totalFrames);
    this.loadedCount = 0;
    this.theme = COOL_LAB_THEME;
    this.lastValidFrameIndex = 0;

    // Motion physics calibrated for buttery smoothness:
    // Constant rotation speed (frames per second)
    this.constantSpeed = 16.0; 
    this.speedMultiplier = 1.0;
    this.virtualFrame = 0;

    // Scroll motion physics:
    // Scrolling motion is calibrated to be faster than constant rotation motion
    this.scrollVelocity = 0;
    this.targetScrollVelocity = 0;
    this.scrollSensitivity = 0.22; // Responsive scroll factor
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;

    // Time tracking for delta-time independent animation
    this.lastTime = performance.now();
    this.isPaused = false;
    this.frameCount = 0;
    this.currentFps = 60;
    this.lastFpsUpdate = performance.now();

    // Mouse parallax (subtle, smoothed)
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.targetMouseX = 0.5;
    this.targetMouseY = 0.5;

    // Callbacks
    this.onProgress = options.onProgress || (() => {});
    this.onFrameUpdate = options.onFrameUpdate || (() => {});

    this.init();
  }

  init() {
    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases(), { passive: true });
    this.bindScrollEvents();
    this.bindMouseEvents();
    this.preloadFrames();
    this.startLoop();
  }

  resizeCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Set 1x DPR for background canvas to completely eliminate GPU fill-rate lag
    const dpr = 1;

    if (this.frameCanvas) {
      this.frameCanvas.width = width * dpr;
      this.frameCanvas.height = height * dpr;
      this.frameCtx = this.frameCanvas.getContext('2d', { alpha: false, desynchronized: true });
      this.frameCtx.imageSmoothingEnabled = true;
      this.frameCtx.imageSmoothingQuality = 'medium';
    }

    if (this.helixCanvas) {
      // Keep helix canvas hidden to avoid extra GPU compositing pass
      this.helixCanvas.width = width;
      this.helixCanvas.height = height;
      this.helixCanvas.style.display = 'none';
    }

    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  bindScrollEvents() {
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const delta = currentScrollY - this.lastScrollY;
      this.lastScrollY = currentScrollY;

      // Scroll motion is faster than constant rotation motion
      // Direct impulse added to targetScrollVelocity
      this.targetScrollVelocity += delta * this.scrollSensitivity;

      // Clamp max velocity to prevent disorienting jumps
      this.targetScrollVelocity = Math.max(-60, Math.min(60, this.targetScrollVelocity));
    }, { passive: true });
  }

  bindMouseEvents() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX / window.innerWidth;
      this.targetMouseY = e.clientY / window.innerHeight;
    }, { passive: true });
  }

  preloadFrames() {
    const getPath = (i) => `/frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;

    // 1. Immediately load frame 1 so the background appears instantly
    const firstImg = new Image();
    firstImg.src = getPath(1);
    firstImg.onload = () => {
      this.frames[0] = firstImg;
      this.lastValidFrameIndex = 0;
      this.loadedCount++;
      this.onProgress(this.loadedCount, this.totalFrames);
    };

    // 2. Load keyframes (every 4th frame) first so full 360-degree rotation is immediately ready
    const keyframes = [];
    for (let i = 2; i <= this.totalFrames; i += 4) {
      keyframes.push(i);
    }
    // 3. Then fill in the rest
    const remaining = [];
    for (let i = 2; i <= this.totalFrames; i++) {
      if (i % 4 !== 2) remaining.push(i);
    }

    const queue = [...keyframes, ...remaining];
    const concurrentLimit = 6;
    let inFlight = 0;
    let queueIdx = 0;

    const pump = () => {
      while (inFlight < concurrentLimit && queueIdx < queue.length) {
        const frameNum = queue[queueIdx++];
        inFlight++;
        const img = new Image();
        img.src = getPath(frameNum);
        img.onload = () => {
          this.frames[frameNum - 1] = img;
          this.loadedCount++;
          this.onProgress(this.loadedCount, this.totalFrames);
          inFlight--;
          pump();
        };
        img.onerror = () => {
          this.loadedCount++;
          inFlight--;
          pump();
        };
      }
    };

    pump();
  }

  setSpeed(val) {
    this.speedMultiplier = Math.max(0.1, val);
  }

  setScrollSensitivity(val) {
    this.scrollSensitivity = Math.max(0.05, val * 0.4);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  startLoop() {
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta time to 50ms
      this.lastTime = timestamp;

      this.frameCount++;
      if (timestamp - this.lastFpsUpdate >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = timestamp;
      }

      this.updatePhysics(dt);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updatePhysics(dt) {
    // 1. Constant smooth rotation: moves smoothly constantly
    if (!this.isPaused) {
      this.virtualFrame += this.constantSpeed * dt * this.speedMultiplier;
    }

    // 2. Responsive scroll motion: faster than constant rotation motion
    // Smooth lerp to target scroll velocity
    this.scrollVelocity += (this.targetScrollVelocity - this.scrollVelocity) * Math.min(1, 14 * dt);
    this.virtualFrame += this.scrollVelocity * dt;

    // Smooth exponential decay of scroll momentum back to baseline constant motion
    this.targetScrollVelocity *= Math.exp(-5.5 * dt);

    // Smooth mouse parallax interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * Math.min(1, 6 * dt);
    this.mouseY += (this.targetMouseY - this.mouseY) * Math.min(1, 6 * dt);

    // Wrap virtualFrame gracefully within 0..totalFrames
    if (this.virtualFrame < 0) {
      this.virtualFrame = (this.virtualFrame % this.totalFrames) + this.totalFrames;
    }
    this.virtualFrame = this.virtualFrame % this.totalFrames;
  }

  getBestFrame(index) {
    if (this.frames[index]) {
      this.lastValidFrameIndex = index;
      return this.frames[index];
    }
    // Search nearby within reasonable radius
    for (let r = 1; r < 25; r++) {
      const prev = (index - r + this.totalFrames) % this.totalFrames;
      if (this.frames[prev]) {
        this.lastValidFrameIndex = prev;
        return this.frames[prev];
      }
      const next = (index + r) % this.totalFrames;
      if (this.frames[next]) {
        this.lastValidFrameIndex = next;
        return this.frames[next];
      }
    }
    return this.frames[this.lastValidFrameIndex] || null;
  }

  render() {
    if (!this.frameCtx) return;

    const w = this.viewportWidth;
    const h = this.viewportHeight;
    const frameIndex = Math.floor(this.virtualFrame);
    const frame = this.getBestFrame(frameIndex);

    // 1. Draw 3D DNA Video Frame
    if (frame) {
      const imgAspect = frame.naturalWidth / frame.naturalHeight || (16 / 9);
      const canvasAspect = w / h;
      let drawW, drawH, drawX, drawY;

      if (canvasAspect > imgAspect) {
        drawW = w;
        drawH = w / imgAspect;
        drawX = 0;
        drawY = (h - drawH) / 2;
      } else {
        drawH = h;
        drawW = h * imgAspect;
        drawX = (w - drawW) / 2;
        drawY = 0;
      }

      this.frameCtx.drawImage(frame, drawX, drawY, drawW, drawH);
    } else {
      this.frameCtx.fillStyle = '#F4F8FC';
      this.frameCtx.fillRect(0, 0, w, h);
    }

    // 2. Apply Balanced Contrast Clinical Grading (Luminous background + crisp 3D DNA)
    this.applyBalancedGrading(this.frameCtx, w, h);

    // 3. Render Procedural DNA Double Helix Directly on Same Canvas (No extra layer, no blend-mode lag)
    this.renderHelixOverlay(this.frameCtx, w, h);

    // 4. Update HUD throttled
    this.onFrameUpdate(frameIndex + 1, this.totalFrames, this.currentFps);
  }

  applyBalancedGrading(ctx, w, h) {
    ctx.save();

    // 1. Calibrated Tone Wash:
    // Slightly darker (0.28 wash) so the 3D animation's deep blue and cyan blur colour
    // is clearly visible, while keeping the overall frame clean and scientific.
    ctx.fillStyle = 'rgba(244, 248, 252, 0.28)';
    ctx.fillRect(0, 0, w, h);

    // 2. Centered Soft Text Contrast Halo:
    // Gentle radial wash centered behind the headline to maximize text readability
    // while keeping the 3D animated molecules clearly visible.
    const textShield = ctx.createRadialGradient(w * 0.5, h * 0.35, 60, w * 0.5, h * 0.35, w * 0.50);
    textShield.addColorStop(0, 'rgba(244, 248, 252, 0.20)');
    textShield.addColorStop(0.65, 'rgba(244, 248, 252, 0.06)');
    textShield.addColorStop(1, 'rgba(244, 248, 252, 0)');
    ctx.fillStyle = textShield;
    ctx.fillRect(0, 0, w, h);

    // 3. Bokeh & Cyan Blur Color Enhancer (Centered & Balanced):
    // Accentuates the optical blur color and glow of the 3D molecular animation
    const blurColorAura = ctx.createRadialGradient(w * 0.5, h * 0.42, 50, w * 0.5, h * 0.42, w * 0.70);
    blurColorAura.addColorStop(0, 'rgba(0, 180, 240, 0.10)');   // Vivid cyan blur glow
    blurColorAura.addColorStop(0.5, 'rgba(29, 78, 137, 0.12)'); // Rich deep sapphire
    blurColorAura.addColorStop(1, 'rgba(10, 24, 46, 0.05)');
    ctx.fillStyle = blurColorAura;
    ctx.fillRect(0, 0, w, h);

    // 4. Subtle Soft Vignette
    const edgeVig = ctx.createRadialGradient(w / 2, h / 2, w * 0.40, w / 2, h / 2, w * 0.92);
    edgeVig.addColorStop(0, 'rgba(213, 224, 234, 0)');
    edgeVig.addColorStop(1, 'rgba(150, 185, 218, 0.18)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  renderHelixOverlay(ctx, w, h) {
    const t = this.theme;
    ctx.save();

    // Helix phase synchronized with virtualFrame so it rotates in unison
    const basePhase = (this.virtualFrame / this.totalFrames) * Math.PI * 4;

    const centerX = w * 0.80 + (this.mouseX - 0.5) * 30;
    const amplitude = Math.min(w * 0.11, 115);
    const wavelength = 220;
    const numPoints = Math.ceil(h / 14) + 6;

    const points1 = [];
    const points2 = [];
    const rungs = [];

    for (let i = -2; i < numPoints; i++) {
      const y = i * 14;
      const angle = (y / wavelength) * Math.PI * 2 + basePhase;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const z1 = sinA;
      const z2 = -sinA;

      const x1 = centerX + cosA * amplitude;
      const x2 = centerX - cosA * amplitude;

      points1.push({ x: x1, y, z: z1 });
      points2.push({ x: x2, y, z: z2 });

      if (i % 3 === 0) {
        rungs.push({ x1, y1: y, x2, y2: y, zAvg: (z1 + z2) / 2 });
      }
    }

    // 1. Darkened Base-Pair Rungs
    ctx.strokeStyle = t.rungs;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    rungs.forEach(rung => {
      ctx.beginPath();
      ctx.moveTo(rung.x1, rung.y1);
      ctx.lineTo(rung.x2, rung.y2);
      ctx.stroke();

      const midX = (rung.x1 + rung.x2) / 2;
      const midY = (rung.y1 + rung.y2) / 2;
      ctx.fillStyle = t.nodes;
      ctx.beginPath();
      ctx.arc(midX, midY, 2.0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Darkened Strand 1
    ctx.lineWidth = 3.8;
    ctx.strokeStyle = t.strand1;
    ctx.beginPath();
    points1.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points1[idx - 1];
        const cx = (prev.x + p.x) / 2;
        const cy = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
      }
    });
    ctx.stroke();

    // 3. Darkened Strand 2
    ctx.strokeStyle = t.strand2;
    ctx.beginPath();
    points2.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points2[idx - 1];
        const cx = (prev.x + p.x) / 2;
        const cy = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
      }
    });
    ctx.stroke();

    // 4. Darkened Nodes (base dots)
    ctx.fillStyle = t.nodes;
    points1.forEach((p, idx) => {
      if (idx % 3 === 0) {
        const radius = 3.4 + p.z * 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.8, radius), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    points2.forEach((p, idx) => {
      if (idx % 3 === 0) {
        const radius = 3.4 + p.z * 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.8, radius), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
