/* ================================================================
   AUDIO.JS
   Motor de audio de la experiencia visual novel.

   Funcionalidades:
     - Reproducir / pausar música de fondo (BGM)
     - Fade in / fade out de la música
     - Crossfade entre dos pistas
     - Efectos de sonido (SFX) con Web Audio API sintético
     - Sonido de typewriter pixel-art generado sin archivos externos
================================================================ */

const AudioEngine = (() => {

  /* ── Estado interno ─────────────────────────────────────── */
  let audioContext   = null;   // Web Audio API context
  let bgmNode        = null;   // AudioBufferSourceNode del BGM actual
  let bgmGainNode    = null;   // GainNode para volumen del BGM
  let bgmBuffer      = {};     // Cache de buffers de audio ya cargados
  let currentBGMKey  = null;   // Clave del BGM reproduciéndose ahora
  let isMuted        = false;  // Estado de silencio global

  /* ── Inicialización ──────────────────────────────────────── */

  /**
   * Inicializa el contexto de Web Audio API.
   * Debe llamarse en respuesta a un gesto del usuario (click, tap).
   */
  function init() {
    if (audioContext) return; // Ya inicializado
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      bgmGainNode  = audioContext.createGain();
      bgmGainNode.gain.value = 0;
      bgmGainNode.connect(audioContext.destination);
      console.log('[AudioEngine] Context created successfully');
    } catch (e) {
      console.warn('[AudioEngine] Web Audio API not available:', e);
    }
  }

  /* ── Carga de audio ──────────────────────────────────────── */

  /**
   * Precarga un archivo de audio en el cache.
   * @param {string} key    - Clave del AUDIO_CONFIG
   * @param {string} src    - Ruta al archivo de audio
   * @returns {Promise}
   */
  async function preloadAudio(key, src) {
    if (!audioContext || bgmBuffer[key]) return;
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      bgmBuffer[key] = await audioContext.decodeAudioData(arrayBuffer);
      console.log(`[AudioEngine] Preloaded: ${key}`);
    } catch (e) {
      console.warn(`[AudioEngine] Could not preload ${key}:`, e.message);
    }
  }

  /* ── Reproducción de BGM ─────────────────────────────────── */

  /**
   * Reproduce un BGM configurado en AUDIO_CONFIG.
   * @param {string} configKey  - Clave en AUDIO_CONFIG (ej: 'birthdayBGM')
   * @param {Object} options    - { fade: boolean, fadeDuration: ms }
   */
  async function playBGM(configKey, options = {}) {
    if (!audioContext || currentBGMKey === configKey) return;

    const cfg = AUDIO_CONFIG[configKey];
    if (!cfg) {
      console.warn(`[AudioEngine] No config for key: ${configKey}`);
      return;
    }

    // Precarga si no está en cache
    if (!bgmBuffer[configKey] && cfg.src) {
      await preloadAudio(configKey, cfg.src);
    }

    // Si no hay buffer (archivo no disponible), salir silenciosamente
    if (!bgmBuffer[configKey]) {
      console.info(`[AudioEngine] No audio buffer for ${configKey}, skipping BGM`);
      currentBGMKey = configKey; // Marcamos igual para evitar reintentos
      return;
    }

    // Detener BGM anterior si existe
    const { fade = true, fadeDuration = TIMING_CONFIG.musicFadeDuration } = options;
    if (bgmNode) {
      if (fade) {
        fadeOutBGM(fadeDuration / 2);
      } else {
        stopBGM();
      }
    }

    // Crear nueva fuente de audio
    const source = audioContext.createBufferSource();
    source.buffer  = bgmBuffer[configKey];
    source.loop    = cfg.loop !== false;
    source.connect(bgmGainNode);

    // Volumen objetivo
    const targetVolume = isMuted ? 0 : (cfg.volume || 0.5);

    if (fade) {
      bgmGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      bgmGainNode.gain.linearRampToValueAtTime(
        targetVolume,
        audioContext.currentTime + (fadeDuration / 2000)
      );
    } else {
      bgmGainNode.gain.setValueAtTime(targetVolume, audioContext.currentTime);
    }

    source.start(0);
    bgmNode       = source;
    currentBGMKey = configKey;

    console.log(`[AudioEngine] Playing BGM: ${configKey}`);
  }

  /**
   * Baja el volumen gradualmente y para el BGM.
   * @param {number} duration - Duración del fade en ms
   */
  function fadeOutBGM(duration = 1000) {
    if (!audioContext || !bgmNode) return;
    const seconds = duration / 1000;
    bgmGainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + seconds
    );
    setTimeout(() => stopBGM(), duration);
  }

  /**
   * Baja el volumen del BGM actual (sin parar).
   * @param {number} targetVolume - Volumen objetivo (0 a 1)
   * @param {number} duration     - Duración en ms
   */
  function reduceBGMVolume(targetVolume, duration = 1200) {
    if (!audioContext) return;
    const seconds = duration / 1000;
    bgmGainNode.gain.linearRampToValueAtTime(
      isMuted ? 0 : targetVolume,
      audioContext.currentTime + seconds
    );
  }

  /**
   * Para el BGM inmediatamente.
   */
  function stopBGM() {
    if (bgmNode) {
      try { bgmNode.stop(); } catch(e) {}
      bgmNode = null;
    }
    currentBGMKey = null;
  }

  /* ── Efectos de sonido sintéticos ────────────────────────── */

  /**
   * Genera un "tick" de typewriter usando osciladores.
   * Suena como una consola pixel-art retro.
   * @param {number} pitch - Frecuencia base (default 520 Hz)
   */
  function playTypewriterTick(pitch = 520) {
    if (!audioContext || isMuted) return;
    if (!AUDIO_CONFIG.useSyntheticSFX) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode   = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Forma de onda cuadrada para sonido retro
      oscillator.type      = 'square';
      oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
      // Pequeña variación de tono para que no sea monótono
      oscillator.frequency.linearRampToValueAtTime(
        pitch * 0.95,
        audioContext.currentTime + 0.04
      );

      // Envolvente ADSR muy rápida
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.07);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch(e) {
      // Silencioso si falla
    }
  }

  /**
   * Genera un sonido de glitch digital.
   */
  function playGlitchSound() {
    if (!audioContext || isMuted || !AUDIO_CONFIG.useSyntheticSFX) return;

    try {
      // Ruido blanco corto
      const bufferSize = audioContext.sampleRate * 0.2;
      const buffer     = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data       = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);

      // Filtro paso-alto para tono más agudo
      const filter = audioContext.createBiquadFilter();
      filter.type            = 'highpass';
      filter.frequency.value = 800;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start();
    } catch(e) {}
  }

  /**
   * Genera un sonido suave de "corazón" (ding dulce).
   */
  function playHeartSound() {
    if (!audioContext || isMuted || !AUDIO_CONFIG.useSyntheticSFX) return;
    try {
      const osc      = audioContext.createOscillator();
      const gain     = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.3);

      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.6);
    } catch(e) {}
  }

  /* ── Mute / Unmute ───────────────────────────────────────── */

  function toggleMute() {
    isMuted = !isMuted;
    if (audioContext && bgmGainNode) {
      bgmGainNode.gain.setValueAtTime(
        isMuted ? 0 : (AUDIO_CONFIG[currentBGMKey]?.volume || 0.5),
        audioContext.currentTime
      );
    }
    return isMuted;
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    preloadAudio,
    playBGM,
    fadeOutBGM,
    reduceBGMVolume,
    stopBGM,
    playTypewriterTick,
    playGlitchSound,
    playHeartSound,
    toggleMute,
    get isMuted() { return isMuted; },
  };

})();
