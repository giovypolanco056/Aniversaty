/* ================================================================
   SCENES.JS
   Controlador de escenas - orquesta todos los sistemas.

   Responsabilidades:
     - Gestionar el flujo de escenas en orden
     - Coordinar personaje, fondo, diálogo y efectos
     - Manejar transiciones entre escenas
     - Controlar el flujo narrativo completo
     - Manejar la escena final (fade to black)
================================================================ */

const ScenesController = (() => {

  /* ── Estado ─────────────────────────────────────────────── */
  let currentSceneIndex = -1;
  let isTransitioning   = false;
  let isRunning         = false;

  /* ── Inicialización ──────────────────────────────────────── */

  function init() {
    // El controlador no necesita referencias DOM directas,
    // delega en los otros módulos.
  }

  /* ── Flujo principal ─────────────────────────────────────── */

  /**
   * Avanza a la siguiente escena.
   * Se llama desde main.js cuando el diálogo de una escena termina.
   */
  async function nextScene() {
    if (isTransitioning) return;

    currentSceneIndex++;

    if (currentSceneIndex >= SCENES.length) {
      console.log('[ScenesController] All scenes completed');
      return;
    }

    await loadScene(SCENES[currentSceneIndex]);
  }

  /**
   * Carga y ejecuta una escena completa.
   * @param {Object} scene - Objeto de escena de SCENES
   */
  async function loadScene(scene) {
    isTransitioning = true;
    console.log(`[ScenesController] Loading scene: ${scene.id}`);

    // ── 1. Cambiar música si corresponde ──────────────────
    if (scene.musicShift) {
      AudioEngine.playBGM(scene.musicShift, { fade: true });
    }

    // ── 2. Transicionar el fondo ──────────────────────────
    if (scene.background) {
      BackgroundSystem.transitionTo(scene.background);
    }

    // ── 3. Transicionar el personaje ──────────────────────
    if (scene.sprite) {
      await CharacterEngine.transitionToScene(scene.sprite, scene.position || 'center');
    }

    // ── 4. Activar efectos iniciales de la escena ─────────
    if (scene.effects && scene.effects.length > 0) {
      for (const effectKey of scene.effects) {
        // El efecto de fade lo manejamos aparte (al final del diálogo)
        if (effectKey !== 'fade_to_black') {
          EffectsEngine.triggerEffect(effectKey);
        }
      }
    }

    isTransitioning = false;

    // ── 5. Mostrar el diálogo ──────────────────────────────
    DialogEngine.loadLines(scene.dialog, () => {
      // Callback cuando todas las líneas del diálogo terminaron

      if (scene.isFinalScene) {
        // Escena final: activar fade to black
        handleFinalScene();
      } else {
        // Escena normal: esperar click para la siguiente
        // El click lo detecta el DialogEngine internamente,
        // pero aquí mostramos el botón de avance de escena.
        // En realidad, nextScene() se llama desde el onAllLinesEnd
        // de DialogEngine, que ya lo tenemos configurado arriba.
        // El callback aquí es suficiente para encadenar.
        nextScene();
      }
    });
  }

  /* ── Escena final ────────────────────────────────────────── */

  /**
   * Maneja el fade to black de la escena final.
   */
  async function handleFinalScene() {
    const fadeScreen = document.getElementById('vn-fade-screen');
    if (!fadeScreen) return;

    // Crear el texto del fade
    const fadeText = document.createElement('p');
    fadeText.className = 'vn-fade-text';
    fadeText.textContent = '...';
    fadeScreen.appendChild(fadeText);

    // Activar fade to black
    fadeScreen.classList.remove('vn-hidden');
    AudioEngine.fadeOutBGM(2500);

    requestAnimationFrame(() => {
      fadeScreen.classList.add('fading');
    });

    // El texto aparece después del fade
    // (La transición CSS lo maneja automáticamente)

    console.log('[ScenesController] Final scene fade completed');
  }

  /* ── Secuencia de interrupción ───────────────────────────── */

  /**
   * Ejecuta la secuencia de interrupción del glitch.
   * Llamada desde main.js después del delay inicial.
   * @returns {Promise}
   */
  async function triggerInterruption() {
    isRunning = true;
    const layer = document.getElementById('vn-layer');

    // ── Paso 1: Bajar música ──────────────────────────────
    AudioEngine.reduceBGMVolume(0.15, TIMING_CONFIG.musicFadeDuration);
    await sleep(TIMING_CONFIG.musicFadeDuration * 0.6);

    // ── Paso 2: Efecto de glitch ──────────────────────────
    if (layer) layer.classList.remove('vn-hidden');
    if (layer) layer.classList.add('active');

    EffectsEngine.triggerGlitch(TIMING_CONFIG.glitchDuration);
    await sleep(TIMING_CONFIG.glitchDuration / 2);

    // ── Paso 3: Freeze frame ──────────────────────────────
    await EffectsEngine.freezeScreen(TIMING_CONFIG.freezeDuration);

    // ── Paso 4: Activar overlay de la página ──────────────
    BackgroundSystem.activateVNOverlay();
    BackgroundSystem.initBackground();

    await sleep(400);

    // ── Paso 5: Mostrar skip button ───────────────────────
    const skipBtn = document.getElementById('vn-skip-btn');
    if (skipBtn) {
      skipBtn.classList.remove('vn-hidden');
      skipBtn.addEventListener('click', skipAll);
    }

    // ── Paso 6: Espera antes de que aparezca el personaje ─
    await sleep(TIMING_CONFIG.characterEnterDelay);

    // ── Paso 7: Empezar con la primera escena ─────────────
    await nextScene();
  }

  /* ── Skip ────────────────────────────────────────────────── */

  /**
   * Salta toda la experiencia visual novel.
   */
  function skipAll() {
    console.log('[ScenesController] Skipping entire VN');

    // Detener typewriter actual
    DialogEngine.stop();

    // Saltar directo a la escena final con fade
    const fadeScreen = document.getElementById('vn-fade-screen');
    if (fadeScreen) {
      fadeScreen.classList.remove('vn-hidden');
      AudioEngine.fadeOutBGM(1500);
      requestAnimationFrame(() => {
        fadeScreen.classList.add('fading');
      });
    }
  }

  /* ── Utilidades ─────────────────────────────────────────── */

  /**
   * Promesa de espera.
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise}
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    triggerInterruption,
    nextScene,
    skipAll,
    get currentSceneIndex() { return currentSceneIndex; },
    get isRunning() { return isRunning; },
  };

})();
