# 💕 Visual Novel Romántico — Guía Completa

Una experiencia web interactiva estilo visual novel que interrumpe una página de cumpleaños.
Diseñado con amor y demasiadas horas de código.

---

## 📁 Estructura del proyecto

```
visual-novel/
├── index.html                  ← Página principal
├── README.md                   ← Esta guía
│
├── css/
│   ├── birthday-page.css       ← Estilos de la página original
│   └── visual-novel.css        ← Estilos de la experiencia VN
│
├── js/
│   ├── config.js               ← ⭐ CONFIGURA AQUÍ TODO
│   ├── audio.js                ← Motor de audio
│   ├── effects.js              ← Partículas, glitch, canvas
│   ├── backgrounds.js          ← Fondos dinámicos
│   ├── character.js            ← Motor de personaje/sprites
│   ├── dialog.js               ← Motor de diálogos (typewriter)
│   ├── scenes.js               ← Orquestador de escenas
│   └── main.js                 ← Punto de entrada
│
└── assets/
    ├── sprites/                ← TUS IMÁGENES DEL PERSONAJE
    │   ├── Smiling_Me.png
    │   ├── Thinking_Me.png
    │   ├── Talking_Me.png
    │   ├── Crying_Me.png
    │   ├── Card_Me.png
    │   ├── InLove_Me.png
    │   ├── Kissing_Me.png
    │   ├── Peeking_Me.png
    │   ├── Missing_Me.png
    │   ├── Angry_Me.png
    │   ├── TalkingOnSide_Me.png
    │   ├── Concerned_Me.png
    │   ├── Singing_Me.png
    │   ├── MissingStand_Me.png
    │   ├── Talking2_Me.png
    │   └── Showing_Me.png
    │
    ├── backgrounds/            ← Fondos opcionales (imágenes)
    └── audio/
        ├── birthday_bgm.mp3    ← Música de cumpleaños (opcional)
        └── vn_bgm.mp3          ← Música del VN (opcional)
```

---

## 🎨 Cómo agregar tus sprites

1. Coloca tus imágenes PNG en `assets/sprites/`
2. Los nombres predeterminados son los del prompt:
   - `Smiling_Me.png`, `Thinking_Me.png`, `Talking_Me.png`, etc.
3. Si quieres cambiar los nombres, edita `js/config.js`:

```javascript
const CHARACTER_SPRITES = {
  Smiling:    "assets/sprites/MI_IMAGEN_SONRIENDO.png",
  Thinking:   "assets/sprites/MI_IMAGEN_PENSANDO.png",
  // ... etc
};
```

**💡 Mientras no tengas los sprites reales**, el sistema muestra
automáticamente un personaje chibi placeholder con el emoji correspondiente.
¡Así puedes probar toda la experiencia antes de tener los gráficos finales!

---

## 🎵 Cómo agregar música

1. Coloca tus archivos MP3 en `assets/audio/`
2. Actualiza las rutas en `js/config.js`:

```javascript
const AUDIO_CONFIG = {
  birthdayBGM: { src: "assets/audio/tu_musica_cumpleanos.mp3", loop: true, volume: 0.6 },
  vnBGM:       { src: "assets/audio/tu_musica_romantica.mp3",   loop: true, volume: 0.45 },
};
```

**Si no agregas música**, el sistema funciona igualmente (solo sin audio).
Los efectos de sonido del typewriter se generan sintéticamente con Web Audio API.

---

## ⏱️ Ajustar tiempos

En `js/config.js`, sección `TIMING_CONFIG`:

```javascript
const TIMING_CONFIG = {
  initialDelay:    7000,   // Cuántos segundos se ve la página antes del glitch
  typewriterSpeed: 42,     // Velocidad del texto (menos = más rápido)
  // ...
};
```

---

## 📖 Editar diálogos

En `js/config.js`, sección `SCENES`:

```javascript
{
  id: 'peek',
  sprite: 'Peeking',         // Clave de CHARACTER_SPRITES
  background: 'default',     // Clave de SCENE_BACKGROUNDS
  position: 'peeking',       // 'center' | 'left' | 'right' | 'peeking'
  effects: ['glitch_entry'], // Efectos al entrar
  musicShift: null,          // 'vnBGM' para cambiar música
  dialog: [
    "Eh... hola.",           // Cada string = una línea de diálogo
    "Sí.",                   // El usuario hace click para avanzar
    "Tú.",
  ],
},
```

---

## 🌈 Editar fondos

En `js/config.js`, sección `SCENE_BACKGROUNDS`:

```javascript
const SCENE_BACKGROUNDS = {
  mi_fondo_nuevo: {
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #1a0a2e 0%, #0d0718 100%)',
    particles: 'hearts',  // 'hearts' | 'stars' | null
    overlay: null,
  },
};
```

---

## ⌨️ Atajos de teclado

| Tecla   | Acción              |
|---------|---------------------|
| `Enter` | Avanzar diálogo     |
| `Space` | Avanzar diálogo     |
| `Esc`   | Saltar todo el VN   |
| `M`     | Silenciar audio     |

---

## 🐛 Debug desde la consola del navegador

```javascript
window.__VN_DEBUG.start()        // Forzar inicio del VN
window.__VN_DEBUG.skip()         // Saltar al final
window.__VN_DEBUG.mute()         // Toggle silencio
window.__VN_DEBUG.listSprites()  // Ver sprites configurados
window.__VN_DEBUG.listScenes()   // Ver todas las escenas
```

---

## 🌐 Cómo subir online

La experiencia funciona como un sitio web estático. Puedes subirla a:

- **GitHub Pages**: Gratis, solo sube la carpeta al repo
- **Netlify**: Arrastra y suelta la carpeta en netlify.com
- **Vercel**: `vercel deploy` desde la carpeta
- **Cualquier hosting estático**: Todo es HTML/CSS/JS puro

**Importante**: Debes servir la carpeta desde un servidor HTTP
(no abrir el archivo .html directamente en el navegador),
ya que los sprites y el audio usan `fetch()` que requiere servidor.

Para probar localmente:
```bash
# Con Python
python -m http.server 8080

# Con Node.js
npx serve .

# Con VS Code
# Usa la extensión "Live Server"
```

---

## 💡 Tips de diseño

1. **Sprites transparentes (PNG)**: Asegúrate de que tus imágenes
   tengan fondo transparente para que se vean bien sobre cualquier fondo.

2. **Tamaño recomendado**: 300–500px de ancho, altura proporcional.
   El sistema escala automáticamente.

3. **Imagen de peeking**: Para la escena de asomarse, un sprite más
   pequeño (con la mitad del cuerpo visible) funciona mejor.

4. **Consistencia de estilo**: Todos los sprites deberían tener el
   mismo estilo visual (pixel-art, chibi, etc.) para coherencia.

---

*Hecho con 💕 y demasiado JavaScript*
