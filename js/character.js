/* ================================================================
   CHARACTER.JS
   Motor del personaje chibi/pixel-art.

   Funcionalidades:
     - Cargar y mostrar sprites desde CHARACTER_SPRITES
     - Animación de entrada y salida
     - Posicionamiento configurable (center, left, right, peeking)
     - Animaciones idle (respiración, bob)
     - Parpadeo automático
     - Transiciones suaves entre sprites
================================================================ */

const CharacterEngine = (() => {

  /* ── Referencias ─────────────────────────────────────────── */
  let container    = null;
  let spriteEl     = null;
  let currentSprite = null;
  let blinkInterval = null;
  let idleActive    = false;

  /* ── Inicialización ──────────────────────────────────────── */

  function init() {
    container = document.getElementById('vn-character-container');
    spriteEl  = document.getElementById('vn-character-sprite');

    if (!container || !spriteEl) {
      console.error('[CharacterEngine] DOM elements not found');
      return;
    }
  }

  /* ── Carga de sprites ────────────────────────────────────── */

  /**
   * Cambia el sprite del personaje con una transición suave.
   * @param {string}  spriteKey  - Clave en CHARACTER_SPRITES
   * @param {Object}  options    - { immediate, onLoad }
   * @returns {Promise}
   */
  function setSprite(spriteKey, options = {}) {
    return new Promise((resolve) => {
      const src = CHARACTER_SPRITES[spriteKey];
      if (!src) {
        console.warn(`[CharacterEngine] Sprite not found: ${spriteKey}`);
        resolve();
        return;
      }

      if (currentSprite === spriteKey && spriteEl.src) {
        resolve();
        return;
      }

      const { immediate = false } = options;
      const duration = immediate ? 0 : TIMING_CONFIG.spriteTransitionDuration;

      // Fade out del sprite actual
      spriteEl.style.transition = `opacity ${duration / 2}ms ease, transform ${duration / 2}ms ease`;
      spriteEl.style.opacity    = '0';
      spriteEl.style.transform  = 'translateY(8px)';

      setTimeout(() => {
        // Precargar la nueva imagen
        const img = new Image();
        img.onload = () => {
          spriteEl.src    = img.src;
          currentSprite   = spriteKey;

          // Fade in del nuevo sprite
          spriteEl.style.transition = `opacity ${duration / 2}ms ease, transform ${duration / 2}ms ease`;
          requestAnimationFrame(() => {
            spriteEl.style.opacity   = '1';
            spriteEl.style.transform = 'translateY(0)';
          });

          if (options.onLoad) options.onLoad();
          resolve();
        };

        img.onerror = () => {
          // Si la imagen no carga, mostrar un placeholder visual
          console.warn(`[CharacterEngine] Could not load sprite: ${src}`);
          showFallbackSprite(spriteKey);
          resolve();
        };

        img.src = src;
      }, immediate ? 0 : duration / 2);
    });
  }

  /**
   * Muestra un placeholder SVG cuando la imagen no está disponible.
   * Útil durante el desarrollo cuando aún no tienes los sprites.
   * @param {string} spriteKey - Para personalizar el emoji del placeholder
   */
  function showFallbackSprite(spriteKey) {
    // Emojis de placeholder por tipo de expresión
    const fallbackEmojis = {
      Smiling:         '😊',
      Thinking:        '🤔',
      Talking:         '😮',
      Crying:          '😢',
      GivingCard:      '💌',
      LoveInEyes:      '😍',
      Kissing:         '😘',
      Peeking:         '👀',
      MissingSitDown:  '😔',
      Angry:           '😤',
      TalkingOnSide:   '😏',
      Concerned:       '😟',
      Singing:         '🎵',
      MissingStanding: '🥺',
      Talking2:        '💬',
      Showing:         '🫶',
    };

    const emoji = fallbackEmojis[spriteKey] || '🙂';

    // Crear SVG de placeholder que simula pixel-art
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
        <!-- Fondo con efecto pixel -->
        <rect width="200" height="280" fill="none"/>

        <!-- Cuerpo chibi simplificado -->
        <g transform="translate(100, 140)">
          <!-- Sombra -->
          <ellipse cx="0" cy="90" rx="35" ry="8" fill="rgba(0,0,0,0.2)"/>

          <!-- Cuerpo -->
          <rect x="-22" y="30" width="44" height="55" rx="8" fill="#c2185b"/>

          <!-- Cabeza -->
          <circle cx="0" cy="0" r="38" fill="#f5cba7"/>

          <!-- Pelo -->
          <rect x="-38" y="-38" width="76" height="20" rx="10" fill="#3d2000"/>
          <rect x="-38" y="-24" width="12" height="30" rx="6" fill="#3d2000"/>
          <rect x="26" y="-24" width="12" height="30" rx="6" fill="#3d2000"/>

          <!-- Emoji de expresión -->
          <text x="0" y="16" text-anchor="middle" font-size="36">${emoji}</text>

          <!-- Brazos -->
          <rect x="-35" y="40" width="13" height="35" rx="6" fill="#f5cba7"/>
          <rect x="22" y="40" width="13" height="35" rx="6" fill="#f5cba7"/>

          <!-- Piernas -->
          <rect x="-20" y="82" width="16" height="30" rx="8" fill="#4a148c"/>
          <rect x="4" y="82" width="16" height="30" rx="8" fill="#4a148c"/>

          <!-- Pies -->
          <ellipse cx="-12" cy="116" rx="11" ry="7" fill="#1a237e"/>
          <ellipse cx="12" cy="116" rx="11" ry="7" fill="#1a237e"/>
        </g>

        <!-- Indicador "placeholder" -->
        <text x="100" y="270" text-anchor="middle"
              font-family="monospace" font-size="9"
              fill="rgba(240,98,146,0.6)">
          ${spriteKey}
        </text>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    spriteEl.src = url;
    spriteEl.style.opacity   = '1';
    spriteEl.style.transform = 'translateY(0)';
    currentSprite = spriteKey;
  }

  /* ── Posicionamiento ─────────────────────────────────────── */

  /**
   * Establece la posición del personaje en la pantalla.
   * @param {string} position - 'center' | 'left' | 'right' | 'peeking'
   */
  function setPosition(position) {
    if (!container) return;

    // Limpiar todas las clases de posición
    container.classList.remove('peeking');
    spriteEl.classList.remove('entering-left', 'entering-right');

    switch (position) {
      case 'center':
        container.style.left      = '50%';
        container.style.right     = 'auto';
        container.style.bottom    = '0';
        container.style.transform = 'translateX(-50%)';
        break;

      case 'left':
        container.style.left      = '8%';
        container.style.right     = 'auto';
        container.style.bottom    = '0';
        container.style.transform = 'none';
        spriteEl.style.transform  = 'scaleX(-1)'; // Mirror para mirar hacia dentro
        break;

      case 'right':
        container.style.left      = 'auto';
        container.style.right     = '8%';
        container.style.bottom    = '0';
        container.style.transform = 'none';
        break;

      case 'peeking':
        // Asomarse desde la esquina inferior derecha
        container.style.left      = 'auto';
        container.style.right     = '-10px';
        container.style.bottom    = '140px';
        container.style.transform = 'none';
        container.classList.add('peeking');
        break;
    }
  }

  /* ── Visibilidad ─────────────────────────────────────────── */

  /**
   * Muestra el personaje con animación.
   * @param {string} position - Posición inicial ('center', 'peeking', etc.)
   * @returns {Promise}
   */
  function show(position = 'center') {
    return new Promise(resolve => {
      if (!container || !spriteEl) { resolve(); return; }

      setPosition(position);

      // Si es peeking, la animación la maneja CSS
      if (position === 'peeking') {
        spriteEl.style.opacity   = '';
        spriteEl.style.transform = '';
        setTimeout(resolve, 900);
        return;
      }

      // Animación de entrada desde abajo
      spriteEl.style.opacity   = '0';
      spriteEl.style.transform = 'translateY(40px)';

      requestAnimationFrame(() => {
        spriteEl.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275)';
        spriteEl.style.opacity    = '1';
        spriteEl.style.transform  = 'translateY(0)';
        setTimeout(resolve, 650);
      });
    });
  }

  /**
   * Oculta el personaje con animación.
   * @returns {Promise}
   */
  function hide() {
    return new Promise(resolve => {
      if (!spriteEl) { resolve(); return; }
      stopIdle(); // limpia idle + glitch listener
      spriteEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      spriteEl.style.opacity    = '0';
      spriteEl.style.transform  = 'translateY(30px)';
      setTimeout(resolve, 450);
    });
  }

  /* ── Animación idle ──────────────────────────────────────── */

  /**
   * Activa la flotación idle + dispara glitch al final de cada ciclo.
   * La animación CSS dura 4s; escuchamos animationiteration para
   * lanzar uno de los 6 efectos glitch en ese instante.
   */
  function startIdle() {
    if (!spriteEl || idleActive) return;
    idleActive = true;
    spriteEl.classList.add('idle');

    // Al terminar cada ciclo de flotar → glitch aleatorio
    spriteEl.addEventListener('animationiteration', onIdleCycleEnd);
  }

  /**
   * Desactiva la animación idle y el listener de glitch.
   */
  function stopIdle() {
    if (!spriteEl) return;
    idleActive = false;
    spriteEl.classList.remove('idle');
    spriteEl.removeEventListener('animationiteration', onIdleCycleEnd);
    _clearGlitchClasses();
  }

  /* ── Glitch idle variado ──────────────────────────────────── */

  // Las 6 variantes de glitch definidas en el CSS
  const GLITCH_VARIANTS = [
    'glitch-idle-1',
    'glitch-idle-2',
    'glitch-idle-3',
    'glitch-idle-4',
    'glitch-idle-5',
    'glitch-idle-6',
  ];

  // Último índice usado, para evitar repetir el mismo dos veces seguidas
  let _lastGlitchIndex = -1;

  /**
   * Se ejecuta al final de cada ciclo de animación idle (4s).
   * Elige una variante de glitch distinta a la anterior y la aplica.
   */
  function onIdleCycleEnd() {
    if (!spriteEl || !idleActive) return;

    // Elegir variante sin repetir la anterior
    let idx;
    do {
      idx = Math.floor(Math.random() * GLITCH_VARIANTS.length);
    } while (idx === _lastGlitchIndex);
    _lastGlitchIndex = idx;

    const glitchClass = GLITCH_VARIANTS[idx];

    // Pausar el idle para que el glitch tome el control del transform
    spriteEl.classList.remove('idle');
    _clearGlitchClasses();
    spriteEl.classList.add(glitchClass);

    // Obtener la duración real de la animación glitch desde CSS
    // (fallback a 400ms si no se puede leer)
    const duration = _getAnimDuration(glitchClass) || 450;

    setTimeout(() => {
      if (!spriteEl) return;
      _clearGlitchClasses();
      // Reanudar idle si el personaje sigue activo
      if (idleActive) {
        spriteEl.classList.add('idle');
      }
    }, duration);
  }

  /**
   * Elimina todas las clases de glitch del sprite.
   */
  function _clearGlitchClasses() {
    if (!spriteEl) return;
    GLITCH_VARIANTS.forEach(c => spriteEl.classList.remove(c));
  }

  /**
   * Lee la duración de la animación CSS de una clase.
   * Necesita que el elemento tenga la clase aplicada brevemente,
   * así que usamos un valor fijo por índice para ser más rápidos.
   */
  function _getAnimDuration(glitchClass) {
    const durations = {
      'glitch-idle-1': 350,
      'glitch-idle-2': 400,
      'glitch-idle-3': 300,
      'glitch-idle-4': 450,
      'glitch-idle-5': 250,
      'glitch-idle-6': 500,
    };
    return durations[glitchClass] || 400;
  }

  /* ── Parpadeo (mantenido por compatibilidad, ya no se usa en idle) ─ */

  /** @deprecated — el glitch idle reemplaza al parpadeo */
  function startBlinking() { /* no-op */ }
  function stopBlinking()  { /* no-op */ }
  function blink() {
    if (!spriteEl) return;
    spriteEl.classList.add('blinking');
    setTimeout(() => spriteEl.classList.remove('blinking'), 150);
  }

  /* ── Transición completa de escena ──────────────────────── */

  /**
   * Cambia sprite y posición para una nueva escena.
   */
  async function transitionToScene(spriteKey, position) {
    const positionChanged = container &&
      (position === 'peeking') !== container.classList.contains('peeking');

    if (positionChanged) {
      await hide();
      setPosition(position);
      await setSprite(spriteKey);
      await show(position);
    } else {
      await setSprite(spriteKey);
      if (!spriteEl || parseFloat(spriteEl.style.opacity || 1) < 0.5) {
        await show(position);
      }
    }

    startIdle();
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    setSprite,
    setPosition,
    show,
    hide,
    startIdle,
    stopIdle,
    startBlinking,
    stopBlinking,
    blink,
    transitionToScene,
    get currentSprite() { return currentSprite; },
  };

})();