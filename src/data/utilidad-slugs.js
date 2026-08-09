// Slugs con noindex, en JS plano porque astro.config los necesita antes de
// que exista el pipeline de TypeScript. Deben coincidir con src/data/legal.ts
// y con la ruta de indicaciones post-tratamiento.
export const UTILIDAD_SLUGS = [
  'aviso-legal',
  'politica-de-privacidad',
  'politica-de-cookies',
  'indicaciones-post-tratamiento',
];
