/* ================================================================
   EFFECTS.JS
   Motor de efectos visuales de la experiencia.

   Funcionalidades:
     - Sistema de partículas (corazones, estrellas, besos)
     - Efecto de glitch visual con franjas de color
     - Congelado de pantalla (freeze frame)
     - Canvas de estrellas de fondo
     - Efectos de overlay cálido
================================================================ */

const EffectsEngine = (() => {

  /* ── Referencias al DOM ─────────────────────────────────── */
  let particlesContainer = null;
  let glitchLayer        = null;
  let bgCanvas           = null;
  let bgCtx              = null;
  let vnLayer            = null;

  // Animación del canvas de fondo
  let bgAnimFrame  = null;
  let bgStars      = [];
  let bgMode       = 'none';   // 'none' | 'stars' | 'hearts'

  /* ── Inicialización ──────────────────────────────────────── */

  function init() {
    particlesContainer = document.getElementById('vn-particles');
    glitchLayer        = document.getElementById('vn-glitch-layer');
    bgCanvas           = document.getElementById('vn-bg-canvas');
    vnLayer            = document.getElementById('vn-layer');

    if (bgCanvas) {
      bgCtx = bgCanvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  }

  /* ── Canvas helpers ──────────────────────────────────────── */

  function resizeCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  /* ── Sistema de partículas ───────────────────────────────── */

  /**
   * Emite partículas según el tipo definido en EFFECTS_CONFIG.
   * @param {string} effectKey - Clave en EFFECTS_CONFIG
   */
  function triggerEffect(effectKey) {
    const cfg = EFFECTS_CONFIG[effectKey];
    if (!cfg) return;

    switch (cfg.type) {
      case 'particles':
        emitParticles(cfg.emitter, cfg.count, cfg.speed);
        break;
      case 'glitch':
        triggerGlitch(cfg.duration);
        break;
      case 'overlay':
        applyColorOverlay(cfg.color, cfg.fade);
        break;
      case 'fade':
        // Manejado por ScenesController
        break;
    }
  }

  /* ── Definición de emitters ──────────────────────────────── */

  const EMITTERS = {
    hearts: {
      symbols:  ['💕', '💗', '💖', '💓', '♥', '❤', '💝'],
      sizeMin:  0.8,
      sizeMax:  1.6,
    },
    stars: {
      symbols:  ['✨', '⭐', '🌟', '✦', '✧', '★'],
      sizeMin:  0.7,
      sizeMax:  1.4,
    },
    kiss_hearts: {
      symbols:  ['💋', '💘', '💝', '💕'],
      sizeMin:  0.9,
      sizeMax:  1.8,
    },
  };

  /**
   * Emite N partículas del tipo dado.
   * @param {string} emitterKey - Clave en EMITTERS
   * @param {number} count      - Número de partículas
   * @param {string} speed      - 'slow' | 'medium' | 'fast'
   */
  function emitParticles(emitterKey, count = 10, speed = 'medium') {
    if (!particlesContainer) return;
    const emitter = EMITTERS[emitterKey];
    if (!emitter) return;

    const speedMap = { slow: 6000, medium: 4500, fast: 2800 };
    const duration = speedMap[speed] || 4500;

    for (let i = 0; i < count; i++) {
      // Stagger la aparición de cada partícula
      setTimeout(() => createParticle(emitter, duration), i * 180);
    }
  }

  /**
   * Crea y anima una partícula individual.
   * @param {Object} emitter  - Configuración del emitter
   * @param {number} duration - Duración de la animación en ms
   */
  function createParticle(emitter, duration) {
    if (!particlesContainer) return;

    const el = document.createElement('div');
    el.className = 'vn-particle';

    // Símbolo aleatorio del emitter
    const symbol = emitter.symbols[Math.floor(Math.random() * emitter.symbols.length)];
    el.textContent = symbol;

    // Tamaño aleatorio
    const size = emitter.sizeMin + Math.random() * (emitter.sizeMax - emitter.sizeMin);
    el.style.fontSize = `${size}rem`;

    // Posición horizontal aleatoria
    const leftPct = 5 + Math.random() * 90;
    el.style.left    = `${leftPct}%`;
    el.style.bottom  = `-${size * 20}px`; // Empieza fuera del viewport

    // Duración con variación aleatoria ±20%
    const dur = duration * (0.8 + Math.random() * 0.4);
    el.style.animationDuration  = `${dur}ms`;
    el.style.animationDelay     = `0ms`;

    particlesContainer.appendChild(el);

    // Limpieza al terminar la animación
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  /**
   * Inicia lluvia continua de corazones (para escenas de amor).
   * Devuelve una función para detenerla.
   */
  function startHeartRain(intervalMs = 600) {
    const emitter = EMITTERS.hearts;
    const interval = setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        createParticle(emitter, 4800);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }

  /* ── Efecto Glitch ───────────────────────────────────────── */

  /**
   * Activa el efecto de glitch visual.
   * @param {number} duration - Duración total en ms
   */
  function triggerGlitch(duration = 400) {
    if (!glitchLayer || !vnLayer) return;

    AudioEngine.playGlitchSound();

    // Mostrar capa de glitch
    glitchLayer.classList.remove('vn-hidden');
    vnLayer.classList.add('glitching');

    // Crear franjas de glitch
    const stripeCount = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < stripeCount; i++) {
      createGlitchStripe();
    }

    // Limpiar después de la duración
    setTimeout(() => {
      glitchLayer.innerHTML = '';
      glitchLayer.classList.add('vn-hidden');
      vnLayer.classList.remove('glitching');
    }, duration);
  }

  /**
   * Crea una franja de glitch en posición y tamaño aleatorios.
   */
  function createGlitchStripe() {
    if (!glitchLayer) return;

    const stripe = document.createElement('div');
    stripe.className = 'vn-glitch-stripe';

    const top    = Math.random() * 95;
    const height = 0.5 + Math.random() * 4;
    const delay  = Math.random() * 200;

    // Colores de glitch: rosa, cian, blanco
    const colors = [
      'rgba(240,98,146,0.7)',
      'rgba(100,200,255,0.5)',
      'rgba(255,255,255,0.4)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    stripe.style.cssText = `
      top: ${top}%;
      height: ${height}%;
      background: ${color};
      animation-delay: ${delay}ms;
    `;

    glitchLayer.appendChild(stripe);
    stripe.addEventListener('animationend', () => stripe.remove(), { once: true });
  }

  /* ── Freeze frame ─────────────────────────────────────────── */

  /**
   * Congela visualmente la pantalla por un momento.
   * @param {number} duration - Duración en ms
   * @returns {Promise}
   */
  function freezeScreen(duration = 800) {
    return new Promise(resolve => {
      if (vnLayer) vnLayer.classList.add('frozen');
      setTimeout(() => {
        if (vnLayer) vnLayer.classList.remove('frozen');
        resolve();
      }, duration);
    });
  }

  /* ── Canvas de estrellas de fondo ────────────────────────── */

  /**
   * Inicializa y anima estrellas en el canvas de fondo.
   */
  function startStarsBackground() {
    if (!bgCtx) return;
    bgMode = 'stars';

    // Crear estrellas iniciales
    bgStars = [];
    const count = Math.floor((bgCanvas.width * bgCanvas.height) / 6000);
    for (let i = 0; i < Math.min(count, 120); i++) {
      bgStars.push({
        x:       Math.random() * bgCanvas.width,
        y:       Math.random() * bgCanvas.height,
        size:    0.5 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.8,
        speed:   0.003 + Math.random() * 0.008,
        phase:   Math.random() * Math.PI * 2,
      });
    }

    // Iniciar loop de animación
    cancelAnimationFrame(bgAnimFrame);
    animateBgCanvas();
  }

  /**
   * Para la animación del canvas de fondo.
   */
  function stopBgAnimation() {
    bgMode = 'none';
    cancelAnimationFrame(bgAnimFrame);
    if (bgCtx) bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  }

  /**
   * Loop de animación del canvas de fondo.
   */
  function animateBgCanvas(timestamp = 0) {
    if (bgMode === 'none') return;
    bgAnimFrame = requestAnimationFrame(animateBgCanvas);

    if (!bgCtx) return;
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    if (bgMode === 'stars') {
      bgStars.forEach(star => {
        // Actualizar opacidad (twinkling)
        star.phase += star.speed;
        const opacity = (Math.sin(star.phase) * 0.4 + 0.5) * star.opacity;

        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255, 240, 255, ${opacity})`;
        bgCtx.fill();
      });
    }
  }

  /* ── Overlay de color ────────────────────────────────────── */

  /**
   * Aplica un overlay de color suave sobre la escena.
   * @param {string} color    - Color CSS (ej: 'rgba(255,160,80,0.07)')
   * @param {number} fadeDur  - Duración del fade en ms
   */
  function applyColorOverlay(color, fadeDur = 1500) {
    const bgGradient = document.getElementById('vn-bg-gradient');
    if (!bgGradient) return;

    // Crear overlay temporal
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: ${color};
      opacity: 0;
      transition: opacity ${fadeDur / 1000}s ease;
      pointer-events: none;
      z-index: 1;
    `;
    bgGradient.parentElement.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    triggerEffect,
    emitParticles,
    startHeartRain,
    triggerGlitch,
    freezeScreen,
    startStarsBackground,
    stopBgAnimation,
    createParticle,
  };

})();
