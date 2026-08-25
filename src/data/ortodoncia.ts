// Contenido de /ortodoncia-invisible/. Literal de «Sonris - Ortodoncia invisible».
import type { ImageMetadata } from 'astro';
import dentalMonitoring from '../assets/sonris/tratamientos/Dental-Monitoring.webp';
import acelerador from '../assets/sonris/tratamientos/Acelerador.webp';

export const VENTAJAS = [
  ['Estética.', 'Casi nadie nota que los llevas puestos.'],
  ['Indolora.', 'Sin alambres ni brackets que rocen.'],
  ['Predecible.', 'El plan se ve entero antes de empezar.'],
  ['De fácil uso.', 'Te los pones y los quitas tú.'],
  ['Cómoda.', 'Hecha a la forma exacta de tus dientes.'],
  ['Precisa.', 'Cada movimiento se planifica en digital.'],
  ['Higiénica.', 'Te cepillas y usas el hilo como siempre.'],
  ['Sin alergias.', 'Material sin metal.'],
] as const;

export type Plan = {
  nombre: string;
  recomendado?: boolean;
  puntos: { texto: string; incluido: boolean }[];
};

export const PLANES: Plan[] = [
  {
    nombre: 'SONRIS Lite',
    puntos: [
      { texto: 'Apiñamientos sencillos', incluido: true },
      { texto: 'Movimientos de molar a molar en maloclusiones clase I', incluido: true },
      { texto: 'Máximo de 42 a 75 pares de alineadores', incluido: true },
      { texto: 'Alineadores limitados', incluido: false },
    ],
  },
  {
    nombre: 'SONRIS Moderado',
    puntos: [
      { texto: 'Apiñamientos moderados', incluido: true },
      { texto: 'De molar a molar, corrigiendo ligeras maloclusiones clase II y III', incluido: true },
      { texto: 'Máximo de 60 a 120 pares de alineadores', incluido: true },
      { texto: 'Alineadores limitados', incluido: false },
    ],
  },
  {
    nombre: 'SONRIS Integral',
    recomendado: true,
    puntos: [
      { texto: 'Corrige todo tipo de maloclusiones y mueve todos los dientes', incluido: true },
      { texto: 'Trata clases I, II y III', incluido: true },
      { texto: 'Casos de extracciones y de cirugía ortognática, sin brackets', incluido: true },
      { texto: 'Alineadores ilimitados durante 5 años', incluido: true },
    ],
  },
  {
    nombre: 'SONRIS Alpha',
    puntos: [
      {
        texto: 'Tecnología patentada con alineadores distintos de día y de noche, que acorta los tiempos hasta un 40 %',
        incluido: true,
      },
      { texto: 'Corrige todo tipo de maloclusiones', incluido: true },
      { texto: 'Ideal en casos de extracciones', incluido: true },
      { texto: 'Alineadores ilimitados durante 5 años', incluido: true },
    ],
  },
  {
    nombre: 'SONRIS GS',
    puntos: [
      { texto: 'Tecnología patentada para maloclusiones que antes exigían cirugía ortognática', incluido: true },
      { texto: 'Asimetrías faciales, apnea obstructiva del sueño y avances mandibulares', incluido: true },
      { texto: 'Sin necesidad de operación', incluido: true },
      { texto: 'Alineadores ilimitados durante 5 años', incluido: true },
    ],
  },
];

export const PASOS_CLINICOS = [
  {
    titulo: 'Historia clínica y exploración',
    texto: 'Exploración intraoral y extraoral, y tu historia clínica completa.',
  },
  {
    titulo: 'Pruebas complementarias',
    texto:
      'Fotografías intraorales y faciales, ortopantomógrafo y escáner intraoral iTero, con simulación virtual de tu estado actual y del resultado final.',
  },
  {
    titulo: 'Planificación digital y fabricación',
    texto:
      'Planificamos movimiento a movimiento y enviamos a fabricación el ClinCheck aprobado. Los alineadores llegan al centro en dos o tres semanas.',
  },
  {
    titulo: 'Preparación de los dientes',
    texto: 'Limpieza oral, un ligero contorneado si hace falta y colocación de los ataches.',
  },
  {
    titulo: 'Colocación de los alineadores',
    texto: 'Te los colocamos y te damos las indicaciones de uso.',
  },
];

// `imagen` es opcional: la tarjeta sin ella se queda con el placeholder al pasar
// el cursor.
export const TECNOLOGIA: { titulo: string; texto: string; video: string; imagen?: ImageMetadata }[] = [
  {
    titulo: 'Escáner intraoral 3D iTero',
    texto: 'Escanea tu boca sin moldes y genera la simulación virtual del punto de partida y del resultado.',
    video: 'https://youtu.be/eyB4-qctl80',
  },
  {
    titulo: 'Dental Monitoring',
    texto: 'Una app en tu móvil que monitoriza el tratamiento cada semana y minimiza el número de visitas.',
    video: 'https://youtu.be/eOVLFONmDng',
    imagen: dentalMonitoring,
  },
  {
    titulo: 'Acelerador',
    texto: 'Reduce el tiempo de tratamiento hasta un 40 %. Está especialmente indicado en pacientes con problemas periodontales.',
    video: 'https://www.youtube.com/watch?v=kDc9r9gz2V8',
    imagen: acelerador,
  },
];

export const PRIMERA_VISITA = [
  'Te recibimos y repasamos contigo las medidas de higiene del centro.',
  'Rellenas el cuestionario y firmas en la sala de espera.',
  'Pasas a gabinete: exploración, valoración completa y plan de tratamiento sin compromiso.',
  'Te damos el presupuesto y ves la previsualización de tu sonrisa.',
];

export const PRUEBAS_INCLUIDAS = [
  'Radiografía panorámica',
  'Radiografía lateral de cráneo',
  'Fotografías intra y extraorales',
  'Escáner intraoral 3D iTero',
  'Simulación virtual',
];

/** Solo las preguntas con respuesta redactada y firmada. Las siete que
 *  faltan están inventariadas en PENDIENTES.md y vuelven cuando lleguen. */
export const FAQ = [
  {
    pregunta: '¿Qué son los alineadores invisibles?',
    respuesta:
      'Férulas transparentes hechas a medida que corrigen problemas oclusales y de posición dental. Te las cambias cada una o dos semanas según tu plan.',
  },
  {
    pregunta: '¿Cuántas horas al día hay que llevarlos?',
    respuesta: 'Entre 21 y 22 horas al día. Solo te los retiras para comer, beber o cepillarte los dientes.',
  },
];
