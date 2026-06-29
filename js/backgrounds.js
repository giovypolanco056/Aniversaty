/* ================================================================
   BACKGROUNDS.JS
   Sistema de fondos dinámicos por escena.

   Se encarga de:
     - Transicionar entre fondos al cambiar de escena
     - Activar partículas de fondo según la escena
     - Aplicar gradientes de fondo desde SCENE_BACKGROUNDS
     - Sincronizarse con el EffectsEngine para partículas
================================================================ */

const BackgroundSystem = (() => {

  /* ── Referencias ─────────────────────────────────────────── */
  let bgGradient   = null;
  let bgContainer  = null;
  let currentBg    = null;
  let heartRainStop = null;   // Función para parar la lluvia de corazones

  /* ── Inicialización ──────────────────────────────────────── */

  function init() {
    bgGradient  = document.getElementById('vn-bg-gradient');
    bgContainer = document.getElementById('vn-background');
  }

  /* ── Cambio de fondo ─────────────────────────────────────── */

  /**
   * Transiciona al fondo correspondiente a una escena.
   * @param {string} bgKey        - Clave en SCENE_BACKGROUNDS
   * @param {Object} options      - { immediate: boolean }
   */
  function transitionTo(bgKey, options = {}) {
    if (currentBg === bgKey) return;
    currentBg = bgKey;

    const bgConfig = SCENE_BACKGROUNDS[bgKey] || SCENE_BACKGROUNDS['default'];
    const { immediate = false } = options;

    // Aplicar gradiente
    if (bgGradient && bgConfig.gradient) {
      if (immediate) {
        bgGradient.style.transition = 'none';
        bgGradient.style.background = bgConfig.gradient;
        // Restaurar transición en el próximo frame
        requestAnimationFrame(() => {
          bgGradient.style.transition = 'background 1.8s ease';
        });
      } else {
        bgGradient.style.background = bgConfig.gradient;
      }
    }

    // Mostrar el contenedor de fondo si no está visible
    if (bgContainer) {
      bgContainer.classList.add('visible');
    }

    // Detener efectos de partículas anteriores
    stopCurrentParticleEffect();

    // Activar partículas de fondo si corresponde
    if (bgConfig.particles) {
      startBgParticles(bgConfig.particles);
    }

    console.log(`[BackgroundSystem] Transitioned to: ${bgKey}`);
  }

  /* ── Partículas de fondo ─────────────────────────────────── */

  /**
   * Inicia el efecto de partículas de fondo según el tipo.
   * @param {string} type - 'stars' | 'hearts'
   */
  function startBgParticles(type) {
    if (type === 'stars') {
      EffectsEngine.startStarsBackground();
    } else if (type === 'hearts') {
      // Lluvia continua de corazones
      heartRainStop = EffectsEngine.startHeartRain(700);
    }
  }

  /**
   * Detiene el efecto de partículas de fondo activo.
   */
  function stopCurrentParticleEffect() {
    // Detener lluvia de corazones si está activa
    if (heartRainStop) {
      heartRainStop();
      heartRainStop = null;
    }
    // Detener animación del canvas
    EffectsEngine.stopBgAnimation();
  }

  /* ── Estado inicial ──────────────────────────────────────── */

  /**
   * Activa el fondo con el overlay de la página de cumpleaños.
   */
  function activateVNOverlay() {
    const overlay = document.getElementById('vn-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }

    // Desvanecer y ocultar completamente la página de cumpleaños
    const birthdayPage = document.getElementById('birthday-page');
    if (birthdayPage) {
      birthdayPage.classList.add('vn-dim');
      // Sacarla del flujo después de que termine la transición
      setTimeout(() => {
        birthdayPage.style.display = 'none';
      }, 1600);
    }
  }

  /**
   * Inicia con el fondo oscuro base del VN.
   */
  function initBackground() {
    transitionTo('default', { immediate: true });
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    transitionTo,
    activateVNOverlay,
    initBackground,
    stopCurrentParticleEffect,
  };

})();
