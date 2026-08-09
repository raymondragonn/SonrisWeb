// Datos únicos de la clínica. Cualquier dato de contacto sale de aquí:
// si cambia el teléfono, cambia en un sitio y en todo el marcado + JSON-LD.

export const SITE = {
  url: 'https://sonris.es',
  nombre: 'Sonris',
  razonSocial: 'MASTER SMILE S.L.',
  cif: 'B88526173',
  /** Datos registrales y nº de registro sanitario del centro: si están vacíos
   *  no se imprimen en las páginas legales. Ver PENDIENTES.md. */
  registroMercantil: '',
  registroSanitario: '',
  lang: 'es-ES',
  descripcion:
    'Ortodoncia invisible en Sanchinarro, Madrid. Dirección médica de la Dra. Isabel Vélez, con la máxima categoría de proveedor de ortodoncia invisible. Primera visita gratuita.',
} as const;

export const CONTACTO = {
  telefono: '910 459 517',
  telefonoE164: '+34910459517',
  whatsapp: '658 746 117',
  whatsappE164: '34658746117',
  whatsappUrl: 'https://wa.me/34658746117',
  email: 'hola@sonris.es',
  calle: 'Avenida Isabel de Valois 55',
  cp: '28050',
  ciudad: 'Madrid',
  distrito: 'Hortaleza',
  barrio: 'Sanchinarro',
  lat: 40.494262,
  lng: -3.659298,
  mapsUrl: 'https://maps.app.goo.gl/LMEeA8qrgTKvEyZY8',
  /** Embed directo a la ficha (CID del negocio): sin redirección intermedia,
   *  que es la que llega con X-Frame-Options: SAMEORIGIN. */
  mapsEmbed: 'https://www.google.com/maps/embed?origin=mfe&pb=!1m4!3m2!1m1!4s7633014916460953178!6i17!3m1!1ses!5m1!1ses',
  horario: 'Lunes a viernes, de 12:00 a 20:00 h',
  horarioCorto: '12:00–20:00 h',
} as const;

export const DIRECCION_MEDICA = {
  nombre: 'Dra. Isabel Vélez',
  colegiado: '28007651',
  cargo: 'Directora médica',
} as const;

export const REDES = [
  { nombre: 'Instagram', sigla: 'IG', url: 'https://instagram.com/sonris.spain' },
  { nombre: 'LinkedIn', sigla: 'LI', url: 'https://www.linkedin.com/company/centro-sonris' },
  { nombre: 'Facebook', sigla: 'FB', url: 'https://facebook.com/Sonris.spain' },
  { nombre: 'TikTok', sigla: 'TT', url: 'https://www.tiktok.com/@Clinicasonris' },
  { nombre: 'YouTube', sigla: 'YT', url: 'https://youtube.com/@clinicasonris' },
  { nombre: 'X', sigla: 'X', url: 'https://x.com/sonris_spain' },
] as const;

export const REDES_CONTACTO = REDES.map((r) => ({ nombre: r.nombre, url: r.url }));

export const NAV = [
  { nombre: 'Inicio', href: '/' },
  { nombre: 'Ortodoncia invisible', href: '/ortodoncia-invisible/' },
  { nombre: 'Tratamientos', href: '/tratamientos/' },
  { nombre: 'Dra. Isabel Vélez', href: '/dra-isabel-velez/' },
  { nombre: 'Sobre nosotros', href: '/sobre-nosotros/' },
] as const;

export const UTILIDAD_NAV = [
  { nombre: 'Aviso legal', href: '/aviso-legal/' },
  { nombre: 'Política de privacidad', href: '/politica-de-privacidad/' },
  { nombre: 'Política de cookies', href: '/politica-de-cookies/' },
] as const;
