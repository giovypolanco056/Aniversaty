/* ================================================================
   MAIN.JS
   Punto de entrada principal de la experiencia.

   Se encarga de:
     1. Esperar que el DOM esté listo
     2. Inicializar todos los sistemas en orden correcto
     3. Iniciar la música de cumpleaños
     4. Programar el evento de interrupción
     5. Conectar eventos de teclado (atajos)
     6. Gestionar el primer click del usuario (para Web Audio)
================================================================ */

(function () {
  'use strict';

  /* ── Variables de estado del main ──────────────────────── */
  let audioInitialized = false;
  let vnStarted        = false;
  let interruptTimer   = null;

  /* ── Función principal ───────────────────────────────────── */

  /**
   * Se ejecuta cuando el DOM está completamente cargado.
   */
  function onDOMReady() {
    console.log('[Main] DOM ready — initializing systems');

    // ── 1. Inicializar todos los motores ──────────────────
    initializeSystems();

    // ── 2. Escuchar el primer gesto del usuario ───────────
    // Web Audio API requiere un gesto del usuario para activarse.
    // Esperamos el primer click o toque para inicializar el audio.
    document.addEventListener('click',    handleFirstInteraction, { once: true });
    document.addEventListener('touchend', handleFirstInteraction, { once: true });

    // ── 3. Programar la interrupción ──────────────────────
    // La interrupción ocurre después del delay inicial configurado.
    scheduleInterruption();

    // ── 4. Atajos de teclado ──────────────────────────────
    document.addEventListener('keydown', handleKeyDown);

    console.log('[Main] All systems ready. Interruption in',
      TIMING_CONFIG.initialDelay / 1000, 'seconds');
  }

  /* ── Inicialización de sistemas ──────────────────────────── */

  /**
   * Inicializa todos los subsistemas en el orden correcto.
   * El orden importa porque algunos dependen de otros.
   */
  function initializeSystems() {
    // 1. Motores sin dependencias entre sí
    EffectsEngine.init();
    BackgroundSystem.init();
    CharacterEngine.init();
    DialogEngine.init();
    ScenesController.init();

    console.log('[Main] All engines initialized');
  }

  /* ── Primer gesto del usuario ────────────────────────────── */

  /**
   * Maneja el primer click/tap del usuario para activar Web Audio.
   */
  function handleFirstInteraction() {
    if (audioInitialized) return;
    audioInitialized = true;

    // Inicializar el contexto de audio
    AudioEngine.init();

    // Reproducir música de cumpleaños
    AudioEngine.playBGM('birthdayBGM', { fade: true })
      .then(() => {
        console.log('[Main] Birthday BGM started');
      })
      .catch(() => {
        // La música no es esencial; continuar sin ella
        console.info('[Main] Could not start BGM (audio file may be missing)');
      });
  }

  /* ── Programar la interrupción ───────────────────────────── */

  /**
   * Programa el evento de interrupción después del delay configurado.
   */
  function scheduleInterruption() {
    interruptTimer = setTimeout(() => {
      if (!vnStarted) {
        startVisualNovel();
      }
    }, TIMING_CONFIG.initialDelay);
  }

  /**
   * Inicia la experiencia visual novel.
   * Puede llamarse también manualmente desde la consola para testing:
   * window.__VN_DEBUG.start()
   */
  function startVisualNovel() {
    if (vnStarted) return;
    vnStarted = true;

    console.log('[Main] Starting visual novel experience');

    // Asegurar que el audio esté inicializado
    if (!audioInitialized) {
      AudioEngine.init();
      audioInitialized = true;
    }

    // Iniciar la secuencia de interrupción
    ScenesController.triggerInterruption();
  }

  /* ── Atajos de teclado ───────────────────────────────────── */

  /**
   * Maneja eventos de teclado durante la experiencia.
   * @param {KeyboardEvent} e
   */
  function handleKeyDown(e) {
    switch (e.key) {
      // Enter o Espacio: avanzar diálogo
      case 'Enter':
      case ' ':
        e.preventDefault();
        // DialogEngine maneja el avance internamente vía click,
        // pero podemos simular un click en la caja de diálogo
        document.getElementById('vn-dialog-box')?.click();
        break;

      // Escape: saltar toda la experiencia
      case 'Escape':
        ScenesController.skipAll();
        break;

      // M: toggle mute
      case 'm':
      case 'M':
        const muted = AudioEngine.toggleMute();
        console.log('[Main] Audio', muted ? 'muted' : 'unmuted');
        break;
    }
  }

  /* ── Debug helpers ───────────────────────────────────────── */

  /**
   * Herramientas de debug expuestas en window.__VN_DEBUG.
   * Útiles durante el desarrollo.
   * Ejecuta desde la consola del navegador:
   *   window.__VN_DEBUG.start()           → forzar inicio
   *   window.__VN_DEBUG.scene(5)          → ir a la escena 5
   *   window.__VN_DEBUG.skip()            → saltar todo
   *   window.__VN_DEBUG.listSprites()     → ver sprites configurados
   */
  window.__VN_DEBUG = {
    start: startVisualNovel,

    scene: (index) => {
      console.log(`[Debug] Jumping to scene ${index}`);
      ScenesController.nextScene();
    },

    skip: () => ScenesController.skipAll(),

    mute: () => AudioEngine.toggleMute(),

    listSprites: () => {
      console.table(CHARACTER_SPRITES);
    },

    listScenes: () => {
      console.table(SCENES.map(s => ({
        id: s.id, sprite: s.sprite, background: s.background, lines: s.dialog.length
      })));
    },

    reload: () => location.reload(),
  };

  /* ── Punto de entrada ────────────────────────────────────── */

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
  } else {
    // El DOM ya está listo (script cargado con defer o al final del body)
    onDOMReady();
  }

})();
