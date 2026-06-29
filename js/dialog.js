/* ================================================================
   DIALOG.JS
   Motor de diálogos estilo visual novel.

   Funcionalidades:
     - Efecto typewriter (texto aparece carácter por carácter)
     - Avance de líneas al hacer click / tap
     - Soporte de pausas en puntuación ( . ! ? ... )
     - Cursor parpadeante durante la escritura
     - Indicador de "siguiente" cuando el texto termina
     - Callback al terminar todas las líneas de una escena
     - Skip: mostrar todo el texto instantáneamente
================================================================ */

const DialogEngine = (() => {

  /* ── Referencias DOM ─────────────────────────────────────── */
  let dialogBox      = null;
  let dialogText     = null;
  let nextIndicator  = null;
  let nameBox        = null;
  let tapZone        = null;   // Zona de tap pantalla completa (móvil)
  let tapHint        = null;   // "toca para continuar"

  /* ── Estado interno ─────────────────────────────────────── */
  let currentLines     = [];
  let currentLineIndex = 0;
  let isTyping         = false;
  let typewriterTimer  = null;
  let onAllLinesEnd    = null;
  let isSkipping       = false;
  let lastTapTime      = 0;    // Anti-doble-tap

  /* ── Inicialización ──────────────────────────────────────── */

  function init() {
    dialogBox     = document.getElementById('vn-dialog-box');
    dialogText    = document.getElementById('vn-dialog-text');
    nextIndicator = document.getElementById('vn-next-indicator');
    nameBox       = document.getElementById('vn-character-name');
    tapZone       = document.getElementById('vn-tap-zone');
    tapHint       = document.getElementById('vn-tap-hint');

    if (!dialogBox) {
      console.error('[DialogEngine] Dialog box not found');
      return;
    }

    // ── Click en la caja de diálogo ───────────────────────
    dialogBox.addEventListener('click', handleAdvance);

    // ── Touch en la caja (previene el doble disparo click+touch) ─
    dialogBox.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleAdvance();
    }, { passive: false });

    // ── Zona de tap pantalla completa (móvil/tablet) ──────
    if (tapZone) {
      tapZone.addEventListener('click', handleAdvance);
      tapZone.addEventListener('touchend', (e) => {
        // Evitar que el toque también dispare el click
        e.preventDefault();
        const now = Date.now();
        if (now - lastTapTime < 120) return; // debounce 120ms
        lastTapTime = now;
        handleAdvance();
      }, { passive: false });
    }
  }

  /* ── Mostrar / ocultar la caja ───────────────────────────── */

  /**
   * Muestra la caja de diálogo con animación.
   */
  function showBox() {
    if (!dialogBox) return;
    dialogBox.classList.remove('vn-hidden');
    requestAnimationFrame(() => {
      dialogBox.classList.add('visible');
    });
    // Activar zona de tap pantalla completa
    if (tapZone) tapZone.classList.remove('vn-hidden');
    if (tapHint) tapHint.classList.remove('vn-hidden');
  }

  /**
   * Oculta la caja de diálogo.
   * @param {boolean} immediate - Si true, sin transición
   */
  function hideBox(immediate = false) {
    if (!dialogBox) return;
    if (immediate) {
      dialogBox.classList.add('vn-hidden');
      dialogBox.classList.remove('visible');
    } else {
      dialogBox.classList.remove('visible');
      setTimeout(() => dialogBox.classList.add('vn-hidden'), 500);
    }
    // Desactivar zona de tap
    if (tapZone) tapZone.classList.add('vn-hidden');
    if (tapHint) tapHint.classList.add('vn-hidden');
  }

  /* ── Nombre del personaje ────────────────────────────────── */

  /**
   * Actualiza el nombre mostrado en la cajita superior.
   * @param {string} name - Nombre a mostrar
   */
  function setCharacterName(name) {
    const nameText = document.getElementById('vn-name-text');
    if (nameText) nameText.textContent = name;
  }

  /* ── Cargar líneas de una escena ─────────────────────────── */

  /**
   * Carga las líneas de diálogo de una escena y empieza a mostrarlas.
   * @param {string[]} lines    - Array de strings
   * @param {Function} onEnd    - Callback al terminar todas las líneas
   */
  function loadLines(lines, onEnd = null) {
    currentLines     = lines || [];
    currentLineIndex = 0;
    onAllLinesEnd    = onEnd;
    isSkipping       = false;

    showBox();
    showCurrentLine();
  }

  /* ── Mostrar la línea actual ─────────────────────────────── */

  /**
   * Empieza a mostrar la línea en el índice actual con typewriter.
   */
  function showCurrentLine() {
    if (currentLineIndex >= currentLines.length) {
      // Todas las líneas terminaron
      hideNextIndicator();
      if (onAllLinesEnd) {
        // Pequeña pausa antes del callback
        setTimeout(() => {
          if (onAllLinesEnd) onAllLinesEnd();
        }, TIMING_CONFIG.pauseAfterLine);
      }
      return;
    }

    const line = currentLines[currentLineIndex];
    if (!line) {
      // Línea vacía = pequeña pausa
      setTimeout(advanceLine, 400);
      return;
    }

    // Limpiar el texto anterior
    clearText();
    hideNextIndicator();

    // Iniciar typewriter
    typewriteLine(line, () => {
      // Callback cuando terminó de escribir esta línea
      isTyping = false;
      showNextIndicator();
    });
  }

  /* ── Typewriter ──────────────────────────────────────────── */

  /**
   * Anima el texto carácter por carácter.
   * @param {string}   text      - Texto a escribir
   * @param {Function} onComplete - Callback al terminar
   */
  function typewriteLine(text, onComplete) {
    if (!dialogText) return;
    isTyping = true;

    let charIndex  = 0;
    let charBuffer = '';

    // Cursor parpadeante
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    dialogText.innerHTML = '';
    dialogText.appendChild(cursor);

    const typeNextChar = () => {
      if (isSkipping || charIndex >= text.length) {
        // Mostrar todo el texto de una vez si se saltó
        if (dialogText) {
          const textNode = document.createTextNode(text);
          dialogText.innerHTML = '';
          dialogText.appendChild(textNode);
        }
        if (onComplete) onComplete();
        return;
      }

      const char = text[charIndex];
      charBuffer += char;
      charIndex++;

      // Actualizar el DOM
      if (dialogText) {
        dialogText.innerHTML = '';
        const textNode = document.createTextNode(charBuffer);
        dialogText.appendChild(textNode);
        const cursorEl = document.createElement('span');
        cursorEl.className = 'cursor';
        dialogText.appendChild(cursorEl);
      }

      // Sonido de typewriter (no en todas las teclas para no ser molesto)
      if (char !== ' ' && charIndex % 2 === 0) {
        // Variación de pitch según el tipo de char
        const pitch = char.match(/[aeiou]/i) ? 480 : 560;
        AudioEngine.playTypewriterTick(pitch);
      }

      // Calcular delay para el siguiente carácter
      const delay = getCharDelay(char, text[charIndex]);
      typewriterTimer = setTimeout(typeNextChar, delay);
    };

    // Iniciar la animación
    typeNextChar();
  }

  /**
   * Calcula el delay para cada carácter.
   * Puntúa más lento en . ! ? y ...
   * @param {string} char     - Carácter actual
   * @param {string} nextChar - Siguiente carácter
   * @returns {number} Delay en ms
   */
  function getCharDelay(char, nextChar) {
    const baseSpeed = TIMING_CONFIG.typewriterSpeed;
    const pauseMs   = TIMING_CONFIG.pauseAfterPunctuation;

    // Pausa larga en puntos suspensivos
    if (char === '.' && nextChar === '.') return baseSpeed;
    if (char === '.' && (!nextChar || nextChar === ' ' || nextChar === '\n')) {
      return baseSpeed + pauseMs;
    }
    if (char === '!' || char === '?') return baseSpeed + pauseMs * 0.8;
    if (char === ',')  return baseSpeed + pauseMs * 0.4;
    if (char === ' ')  return baseSpeed * 0.6;
    if (char === '\n') return baseSpeed + pauseMs * 0.6;

    return baseSpeed;
  }

  /* ── Avance de líneas ────────────────────────────────────── */

  /**
   * Maneja el evento de avance (click o tap).
   */
  function handleAdvance() {
    if (isTyping) {
      // Si está escribiendo, mostrar todo el texto de una vez
      skipCurrentTyping();
    } else {
      // Si terminó de escribir, avanzar a la siguiente línea
      advanceLine();
    }
  }

  /**
   * Salta el typewriter de la línea actual y muestra todo el texto.
   */
  function skipCurrentTyping() {
    isSkipping = true;
    if (typewriterTimer) {
      clearTimeout(typewriterTimer);
      typewriterTimer = null;
    }

    // Mostrar el texto completo
    const line = currentLines[currentLineIndex];
    if (dialogText && line) {
      dialogText.innerHTML = '';
      dialogText.appendChild(document.createTextNode(line));
    }

    isTyping  = false;
    isSkipping = false;
    showNextIndicator();
  }

  /**
   * Avanza a la siguiente línea.
   */
  function advanceLine() {
    currentLineIndex++;
    showCurrentLine();
  }

  /* ── Indicador de siguiente ──────────────────────────────── */

  function showNextIndicator() {
    if (nextIndicator) nextIndicator.classList.remove('vn-hidden');
  }

  function hideNextIndicator() {
    if (nextIndicator) nextIndicator.classList.add('vn-hidden');
  }

  /* ── Utilidades ─────────────────────────────────────────── */

  /**
   * Limpia el texto del diálogo.
   */
  function clearText() {
    if (dialogText) dialogText.innerHTML = '';
    // Limpiar timer del typewriter
    if (typewriterTimer) {
      clearTimeout(typewriterTimer);
      typewriterTimer = null;
    }
    isTyping   = false;
    isSkipping = false;
  }

  /**
   * Para completamente el diálogo actual.
   */
  function stop() {
    clearText();
    hideBox();
    hideNextIndicator();
    currentLines     = [];
    currentLineIndex = 0;
    onAllLinesEnd    = null;
  }

  /* ── API pública ─────────────────────────────────────────── */
  return {
    init,
    showBox,
    hideBox,
    setCharacterName,
    loadLines,
    advanceLine,
    skipCurrentTyping,
    clearText,
    stop,
    get isTyping() { return isTyping; },
    get currentLineIndex() { return currentLineIndex; },
    get totalLines() { return currentLines.length; },
  };

})();
