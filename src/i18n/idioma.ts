// Idioma de la página que se está compilando, y traducción de los textos
// editables.
//
// El middleware fija el idioma antes de renderizar cada página. Las páginas
// en inglés son las mismas plantillas que las españolas: c(), ld() y <Cms>
// preguntan aquí qué texto y qué clave emitir.
//
// ponytail: estado de módulo, válido porque el build estático renderiza las
// páginas de una en una (build.concurrency = 1, el valor por defecto). Si se
// sube la concurrencia o se pasa a SSR, hay que llevarlo en Astro.locals.

import EN from './en.json';

export type Idioma = 'es' | 'en';

let actual: Idioma = 'es';

export const idioma = (): Idioma => actual;
export const fijarIdioma = (i: Idioma) => {
  actual = i;
};

const textos = EN as Record<string, string>;

/**
 * Clave y valor editables en el idioma actual. En inglés, solo cambian las
 * claves que tienen traducción: llevan el prefijo «en.», así lo editado en
 * una versión nunca pisa la otra. Las que no se traducen (teléfono, correo,
 * nombres propios) comparten clave y se editan una vez para los dos idiomas.
 */
export function traducir(k: string, v: string): { k: string; v: string } {
  if (actual !== 'en') return { k, v };
  const [clave] = k.split('@');
  const en = textos[clave];
  return en === undefined ? { k, v } : { k: `en.${k}`, v: en };
}

/** Texto fijo de una plantilla según el idioma: t('Reservar', 'Book'). */
export const t = (es: string, en: string) => (actual === 'en' ? en : es);
