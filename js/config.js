
/* ================================================================
   CONFIG.JS  —  Generado por el Editor Visual Novel
   Última edición: 28/6/2026, 10:22:09 a. m.
================================================================ */

const CHARACTER_SPRITES = {
  Smiling:           "assets/sprites/Smiling_Me.png",
  Thinking:          "assets/sprites/Thinking_Me.png",
  Talking:           "assets/sprites/Talking_Me.png",
  Crying:            "assets/sprites/Crying_Me.png",
  GivingCard:        "assets/sprites/Card_Me.png",
  LoveInEyes:        "assets/sprites/InLove_Me.png",
  Kissing:           "assets/sprites/Kissing_Me.png",
  Peeking:           "assets/sprites/Peeking_Me.png",
  MissingSitDown:    "assets/sprites/Missing_Me.png",
  Angry:             "assets/sprites/Angry_Me.png",
  TalkingOnSide:     "assets/sprites/TalkingOnSide_Me.png",
  Concerned:         "assets/sprites/Concerned_Me.png",
  Singing:           "assets/sprites/Singing_Me.png",
  MissingStanding:   "assets/sprites/MissingStand_Me.png",
  Talking3:          "assets/sprites/Talking3_Me.png",
  Showing:           "assets/sprites/Showing_Me.png",
};

const SCENE_BACKGROUNDS = {
  default:      { type: 'gradient', gradient: 'linear-gradient(180deg, #1a0a2e 0%, #0d0718 100%)', particles: null },
  cozy:         { type: 'gradient', gradient: 'linear-gradient(180deg, #2d1b4e 0%, #1a0e2e 50%, #0d0718 100%)', particles: 'stars', overlay: 'rgba(255, 160, 90, 0.06)' },
  night_sky:    { type: 'gradient', gradient: 'linear-gradient(180deg, #050a1a 0%, #0a1628 40%, #1a0a2e 100%)', particles: 'stars', overlay: null },
  hearts_fill:  { type: 'gradient', gradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d0a1e 100%)', particles: 'hearts', overlay: null },
  glitch_start: { type: 'gradient', gradient: 'linear-gradient(180deg, #0d0718 0%, #1a0a2e 100%)', particles: null, overlay: null },
};

const AUDIO_CONFIG = {
  birthdayBGM:    { src: "assets/audio/birthday_bgm.mp3", loop: true, volume: 0.6 },
  vnBGM:          { src: "assets/audio/vn_bgm.mp3",       loop: true, volume: 0.45 },
  sfx:            { textSound: null, sceneChange: null, glitch: null, heartBeat: null },
  useSyntheticSFX: true,
};

const TIMING_CONFIG = {
  initialDelay:              7000,   // Espera antes del glitch (ms)
  typewriterSpeed:           42,   // Velocidad del texto (ms/char)
  pauseAfterPunctuation:     320,   // Pausa en puntuación (. ! ?) (ms)
  glitchDuration:            400,   // Duración del glitch (ms)
  freezeDuration:            800,   // Freeze de pantalla (ms)
  characterEnterDelay:       600,   // Espera antes de que aparezca el personaje (ms)
  musicFadeDuration:         1200,   // Fade de música (ms)
  spriteTransitionDuration:  400,   // Transición entre sprites (ms)
  pauseAfterLine:            500,   // Pausa al terminar una línea (ms)
  autoAdvance:            false,
  autoAdvanceDelay:       3500,
};

const SCENES = [
  {
    id: 'peek',
    sprite: 'Peeking',
    background: 'glitch_start',
    position: 'peeking',
    effects: ['glitch_entry'],
    musicShift: null,
    dialog: [
      "Eh... hola.",
      "Sí.",
      "Tú.",
      "La que escaneó este QR pensando que iba a encontrar exactamente lo mismo de siempre.",
    ],
  },

  {
    id: 'thinking',
    sprite: 'Thinking',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Seguramente te estarás preguntando...",
    ],
  },

  {
    id: 'talking',
    sprite: 'Talking3',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Ohhh Giovy guapo hermoso y bello",
      "Hombre de mis sueños y dueño de mi",
      "¿Qué es esto y para qué?",
      "Bueno, para explicar eso primero debo presentarme",
    ],
  },

  {
    id: 'introduction',
    sprite: 'Smiling',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: 'vnBGM',
    dialog: [
      "Soy el moreno.",
      "Bueno...",
      "Una representación virtual del moreno.",
      "Aunque debo admitir que el original es un poco más guapo.",
      "Y también bastante más alto.",
    ],
  },

  {
    id: 'surprise',
    sprite: 'Talking',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Sé que esto es raro.",
      "Pero quería sorprenderte.",
      "Y después de descartar opciones completamente normales...",
      "Como escribirte una carta.",
      "O grabarte un video.",
      "O aparecer en tu casa vestido de Yoongi...",
      "Decidí aparecer dentro de tu pantalla.",
    ],
  },

  {
    id: 'confession',
    sprite: 'Talking3',
    background: 'default',
    position: 'center',
    effects: ['soft_hearts'],
    musicShift: null,
    dialog: [
      "Porque hay algo que he descubierto desde que te conozco.",
      "Y es que nunca encuentro suficientes maneras de decirte cuánto te amo.",
    ],
  },

  {
    id: 'conversations',
    sprite: 'Showing',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Así que pensé...",
      "¿Por qué no hacer lo que mejor sabemos hacer?",
      "Hablar.",
      "Durante demasiado tiempo.",
      "Sobre demasiadas cosas.",
      "Hasta las tres de la mañana.",
    ],
  },

  {
    id: 'letter',
    sprite: 'GivingCard',
    background: 'cozy',
    position: 'center',
    effects: ['warm_glow'],
    musicShift: null,
    dialog: [
      "Y como toda conversación importante merece una carta...",
      "Escribí una para ti.",
      "Bueno.",
      "Técnicamente escribí cientos de páginas.",
      "Pero vamos paso a paso.",
    ],
  },

  {
    id: 'love_eyes',
    sprite: 'LoveInEyes',
    background: 'hearts_fill',
    position: 'center',
    effects: ['hearts_burst'],
    musicShift: null,
    dialog: [
      "Porque sinceramente...",
      "Cada vez que te veo.",
      "Me pasa algo parecido a esto.",
      "Y lo peor es que después de todo este tiempo...",
      "Sigue pasando exactamente igual.",
    ],
  },

  {
    id: 'empathy',
    sprite: 'Concerned',
    background: 'cozy',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Sé que hoy tuvo sus momentos.",
      "Y sé que probablemente todavía tengas miedo.",
      "O dudas.",
      "O simplemente estés cansada.",
      "Y no te culpo.",
    ],
  },

  {
    id: 'understanding',
    sprite: 'MissingStanding',
    background: 'cozy',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Porque si hay algo que he aprendido...",
      "Es que amar a alguien también significa entender que a veces tiene miedo.",
    ],
  },

  {
    id: 'goodbyes',
    sprite: 'MissingSitDown',
    background: 'night_sky',
    position: 'center',
    effects: ['stars_appear'],
    musicShift: null,
    dialog: [
      "Y si soy completamente sincero...",
      "Hay algo que nunca me acostumbro a sentir.",
      "Las despedidas.",
      "Porque no importa si es un Uber.",
      "Un autobús.",
      "Un carro.",
      "Un avión.",
      "O incluso un Allison Lee.",
      "Cualquier cosa que me aleje de ti siempre se siente demasiado lejos.",
    ],
  },

  {
    id: 'hardest_part',
    sprite: 'Crying',
    background: 'night_sky',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Porque la parte más difícil de cada encuentro...",
      "Siempre ha sido el momento de partir.",
    ],
  },

  {
    id: 'gratitude',
    sprite: 'Smiling',
    background: 'cozy',
    position: 'center',
    effects: ['warm_glow'],
    musicShift: null,
    dialog: [
      "Pero también he descubierto algo.",
      "Que incluso después de cada despedida...",
      "Siempre termino agradeciendo.",
    ],
  },

  {
    id: 'divine',
    sprite: 'LoveInEyes',
    background: 'hearts_fill',
    position: 'center',
    effects: ['hearts_burst'],
    musicShift: null,
    dialog: [
      "Porque entre todas las personas del mundo...",
      "Dios decidió cruzar mi camino con el tuyo.",
    ],
  },

  {
    id: 'not_fair',
    sprite: 'Angry',
    background: 'default',
    position: 'center',
    effects: [],
    musicShift: null,
    dialog: [
      "Aunque sigo pensando que no es justo.",
      "No es justo que seas tan linda.",
    ],
  },

  {
    id: 'kiss',
    sprite: 'Kissing',
    background: 'hearts_fill',
    position: 'center',
    effects: ['hearts_burst', 'pixel_kiss'],
    musicShift: null,
    dialog: [
      "Mientras volvemos a vernos...",
      "Aquí tienes un beso virtual.",
    ],
  },

  {
    id: 'finale',
    sprite: 'Showing',
    background: 'cozy',
    position: 'center',
    effects: ['fade_to_black'],
    musicShift: null,
    isFinalScene: true,
    dialog: [
      "Pero en realidad...",
      "No aparecí aquí solo para hablar.",
      "Vine a mostrarte algo.",
    ],
  }
];

const EFFECTS_CONFIG = {
  glitch_entry:   { type: 'glitch',    duration: 400 },
  soft_hearts:    { type: 'particles', emitter: 'hearts',      count: 8,  speed: 'slow'   },
  hearts_burst:   { type: 'particles', emitter: 'hearts',      count: 20, speed: 'medium' },
  warm_glow:      { type: 'overlay',   color: 'rgba(255,160,80,0.07)', fade: 1500 },
  stars_appear:   { type: 'particles', emitter: 'stars',       count: 25, speed: 'slow'   },
  pixel_kiss:     { type: 'particles', emitter: 'kiss_hearts', count: 12, speed: 'medium' },
  fade_to_black:  { type: 'fade',      duration: 3000 },
};
