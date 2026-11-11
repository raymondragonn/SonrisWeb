// Correspondencia de rutas español → inglés. JS plano: lo leen astro.config,
// el middleware, las páginas y los scripts de comprobación.
// Las anclas (#como-funciona) son las mismas en los dos idiomas.

export const RUTAS_EN = {
  '/': '/en/',
  '/ortodoncia-invisible/': '/en/invisible-orthodontics/',
  '/tratamientos/': '/en/treatments/',
  '/tratamientos/estetica-dental/': '/en/treatments/cosmetic-dentistry/',
  '/tratamientos/implantes-dentales/': '/en/treatments/dental-implants/',
  '/tratamientos/cirugia-ortognatica/': '/en/treatments/orthognathic-surgery/',
  '/tratamientos/endodoncia/': '/en/treatments/endodontics/',
  '/tratamientos/cirugia-oral/': '/en/treatments/oral-surgery/',
  '/tratamientos/periodoncia/': '/en/treatments/periodontics/',
  '/tratamientos/odontologia-general/': '/en/treatments/general-dentistry/',
  '/dra-isabel-velez/': '/en/dr-isabel-velez/',
  '/sobre-nosotros/': '/en/about-us/',
  '/contacto/': '/en/contact/',
  '/indicaciones-post-tratamiento/': '/en/aftercare-instructions/',
  '/aviso-legal/': '/en/legal-notice/',
  '/politica-de-privacidad/': '/en/privacy-policy/',
  '/politica-de-cookies/': '/en/cookie-policy/',
};

const RUTAS_ES = Object.fromEntries(Object.entries(RUTAS_EN).map(([es, en]) => [en, es]));

/** Slug final de una ruta: '/tratamientos/endodoncia/' → 'endodoncia'. */
export const slugDe = (ruta) => ruta.split('/').filter(Boolean).pop() ?? '';

export const esIngles = (ruta) => ruta === '/en/' || ruta.startsWith('/en/');

/** Ruta en inglés de una española; deja igual lo que no está en el mapa. */
export function aIngles(ruta) {
  const [base, ancla] = ruta.split('#');
  const en = RUTAS_EN[base];
  return en ? en + (ancla !== undefined ? `#${ancla}` : '') : ruta;
}

/** Ruta en español de una inglesa. */
export function aEspanol(ruta) {
  const [base, ancla] = ruta.split('#');
  const es = RUTAS_ES[base];
  return es ? es + (ancla !== undefined ? `#${ancla}` : '') : ruta;
}
