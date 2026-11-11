// GA4, solo con consentimiento. Sin PUBLIC_GA_ID no se carga nada y el sitio
// sigue sin analítica, como dicen las políticas en ese caso. Es un sitio de
// páginas sueltas: cada carga es un page_view y gtag lo envía solo.
// Nadie fuera de este archivo llama a gtag: todo pasa por medir().

const GA_ID = import.meta.env.PUBLIC_GA_ID as string | undefined;
const CLAVE = 'sonris-cookies';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
    [k: `ga-disable-${string}`]: boolean;
  }
}

function aceptadas(): boolean {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || 'null')?.v === 'aceptadas';
  } catch {
    return false;
  }
}

function iniciar() {
  if (!GA_ID) return;
  // Volver a aceptar tras haber retirado el consentimiento reactiva la medición.
  window[`ga-disable-${GA_ID}`] = false;
  // La sesión de administrador no cuenta como visita.
  // Estado en window y no en el módulo: la isla del formulario puede cargar
  // su propia copia de este archivo.
  if (window.gtag || document.cookie.includes('sonris_edit=1')) return;
  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag exige el objeto arguments, no un array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, debug_mode: import.meta.env.DEV });
}

/** Al retirar el consentimiento: para la medición y borra las cookies _ga. */
function detener() {
  if (!GA_ID) return;
  window[`ga-disable-${GA_ID}`] = true;
  const dominio = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((c) => {
    const nombre = c.split('=')[0].trim();
    if (!nombre.startsWith('_ga')) return;
    for (const d of ['', `; domain=.${dominio}`, `; domain=${dominio}`])
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
  });
}

export function medir(nombre: string, params: Record<string, unknown> = {}) {
  if (!GA_ID || !window.gtag || window[`ga-disable-${GA_ID}`]) return;
  window.gtag('event', nombre, params);
}


/** Clics en CTA: botones primarios y secundarios, teléfono, WhatsApp y correo.
 *  Un solo oyente para todo el sitio, sin tocar cada componente. */
function oirCtas() {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const tipo = href.startsWith('tel:')
      ? 'telefono'
      : /wa\.me|whatsapp/.test(href)
        ? 'whatsapp'
        : href.startsWith('mailto:')
          ? 'email'
          : a.matches('[data-primary], [data-secondary]')
            ? 'boton'
            : null;
    if (!tipo) return;
    const texto = (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    medir('cta_click', {
      cta_id: `${tipo}_${seccionDe(a)}`,
      cta_text: texto,
      section: seccionDe(a),
      destination: href,
    });
  });
}

function seccionDe(el: Element): string {
  const s = el.closest('section');
  if (s) return s.id || s.getAttribute('aria-labelledby') || 'seccion';
  if (el.closest('footer')) return 'pie';
  if (el.closest('header')) return 'cabecera';
  if (el.closest('[data-mobilebar]')) return 'barra_movil';
  return 'pagina';
}

/** Profundidad de scroll: 25, 50, 75 y 90 %, una vez por página. */
function oirScroll() {
  const marcas = [25, 50, 75, 90];
  const hechas = new Set<number>();
  let encolado = false;
  const medirScroll = () => {
    encolado = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 100;
    marcas.forEach((m) => {
      if (pct < m || hechas.has(m)) return;
      hechas.add(m);
      medir('scroll_depth', { percent: m, page_path: location.pathname });
    });
  };
  addEventListener(
    'scroll',
    () => {
      if (encolado) return;
      encolado = true;
      requestAnimationFrame(medirScroll);
    },
    { passive: true }
  );
}

/** Vídeos que reproduce la persona. Los del hero arrancan solos en bucle y
 *  silenciados: esos no cuentan. */
function oirVideos() {
  document.addEventListener(
    'play',
    (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement) || v.autoplay) return;
      medir('video_play', {
        video_id: (v.currentSrc || v.src || '').split('/').pop() || 'video',
        section: seccionDe(v),
      });
    },
    true
  );
}

// El formulario (isla de React) importa medir() y se renderiza también en el
// build, donde no hay document.
if (GA_ID && typeof document !== 'undefined') {
  if (aceptadas()) iniciar();
  // El aviso de cookies anuncia cada decisión, también al cambiarla desde el pie.
  document.addEventListener('sonris:cookies', (e) => {
    if ((e as CustomEvent).detail === 'aceptadas') iniciar();
    else detener();
  });
  oirCtas();
  oirScroll();
  oirVideos();
}
