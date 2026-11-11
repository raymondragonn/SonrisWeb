// Marcadores del modo edición. Lo que se emite aquí lo lee backend/php/lib/Contenido.php
// al publicar: las dos partes tienen que ponerse de acuerdo en el formato.
//
// Un "segmento" es texto fijo o una referencia {k, v}: la clave editable y el valor
// compilado. Con eso se marcan los sitios donde un comentario HTML no cabe: un
// atributo (href="tel:…"), el <title>, el JSON-LD o llms.txt. Sin nada editado, PHP
// deja el valor compilado tal cual.
//
// Claves: minúsculas, números, punto y guion. Un dato repetido usa la misma clave en
// todos los sitios. "@derivado" pide una forma calculada del dato (ver Derivados.php):
//   contacto.telefono       → 910 459 517
//   contacto.telefono@e164  → +34910459517
//   contacto.telefono@tel   → tel:+34910459517
//   contacto.whatsapp@wa    → https://wa.me/34658746117
//   contacto.email@mailto   → mailto:hola@sonris.es
//   <x>.youtube@yt          → https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0

import { traducir } from '../i18n/idioma';

export type Ref = { k: string; v: string };
export type Segmento = string | Ref;

const CLAVE = /^[a-z0-9][a-z0-9.-]*$/;
const DERIVADOS = new Set(['', 'e164', 'tel', 'wa', 'mailto', 'yt']);

/** Falla en compilación: una clave mal escrita dejaría el campo sin editar, en silencio. */
export function validarClave(k: string): string {
  const [clave, derivado = ''] = k.split('@');
  if (!CLAVE.test(clave) || !DERIVADOS.has(derivado)) {
    throw new Error(`Clave CMS inválida: "${k}". Usa minúsculas, números, punto y guion (ej. inicio.hero.titulo).`);
  }
  return k;
}

/** Referencia a una clave editable con su valor compilado. */
export function c(k: string, v: string | number): Ref {
  // En las páginas en inglés devuelve la clave «en.» y su traducción, si la hay.
  return traducir(validarClave(k), String(v));
}

export function unir(segmentos: Segmento[]): string {
  return segmentos.map((s) => (typeof s === 'string' ? s : s.v)).join('');
}

const lista = (s: Segmento | Segmento[]): Segmento[] => (Array.isArray(s) ? s : [s]);

/**
 * Atributos editables: devuelve los atributos ya compilados más data-cms-attr, para
 * esparcirlos en la etiqueta:
 *
 *   <a {...attrs({ href: c('contacto.telefono@tel', CONTACTO.telefonoE164 ...) })}>
 */
export function attrs(mapa: Record<string, Segmento | Segmento[]>): Record<string, string> {
  const salida: Record<string, string> = {};
  const marca: Record<string, Segmento[]> = {};
  for (const [atributo, valor] of Object.entries(mapa)) {
    marca[atributo] = lista(valor);
    salida[atributo] = unir(marca[atributo]);
  }
  salida['data-cms-attr'] = JSON.stringify(marca);
  return salida;
}

/** Para <title>: <title data-cms-texto={titulo.marca}>{titulo.texto}</title> */
export function textoMarcado(segmentos: Segmento | Segmento[]) {
  const s = lista(segmentos);
  return { texto: unir(s), marca: JSON.stringify(s) };
}

// ------------------------------------------------------------------ JSON-LD

const LD = Symbol('cms-ld');
type MarcaLd = { [LD]: Segmento[] };

/**
 * Valor editable dentro de un objeto JSON-LD. Se resuelve con resolverLd() antes de
 * serializar; ahí se anota su ruta para que PHP sepa dónde escribir.
 */
export function ld(k: string, v: string | number): string {
  return { [LD]: [c(k, v)] } as unknown as string;
}

/** Varios segmentos en un solo valor JSON-LD: ldTexto('Clínica ', c('x', 'y')). */
export function ldTexto(...segmentos: Segmento[]): string {
  return { [LD]: segmentos } as unknown as string;
}

const escaparPuntero = (s: string) => s.replace(/~/g, '~0').replace(/\//g, '~1');

/**
 * Sustituye las marcas por su valor y devuelve el JSON y el mapa puntero → segmentos
 * (RFC 6901). Sin marcas, el JSON es idéntico al de JSON.stringify(grafo).
 */
export function resolverLd(grafo: unknown): { json: string; mapa: string | undefined } {
  const mapa: Record<string, Segmento[]> = {};

  const recorrer = (nodo: unknown, ruta: string): unknown => {
    if (nodo && typeof nodo === 'object' && LD in nodo) {
      const segmentos = (nodo as MarcaLd)[LD];
      mapa[ruta] = segmentos;
      return unir(segmentos);
    }
    if (Array.isArray(nodo)) return nodo.map((n, i) => recorrer(n, `${ruta}/${i}`));
    if (nodo && typeof nodo === 'object') {
      return Object.fromEntries(Object.entries(nodo).map(([k, v]) => [k, recorrer(v, `${ruta}/${escaparPuntero(k)}`)]));
    }
    return nodo;
  };

  const json = JSON.stringify(recorrer(grafo, ''));
  return { json, mapa: Object.keys(mapa).length ? JSON.stringify(mapa) : undefined };
}

// ------------------------------------------------------------ imágenes

/**
 * Tamaño mínimo que debe tener una imagen para reemplazar a otra sin verse peor:
 * el ancho mayor que sirve el sitio y la proporción de su hueco. Viaja en el HTML
 * (data-cms-min="880x580") y lo leen igual el editor y el servidor.
 */
export function minimo(ancho: number, proporcion: number): string {
  return `${Math.round(ancho)}x${Math.round(ancho * proporcion)}`;
}

/**
 * Imagen de fondo (CSS background-image en el style) reemplazable:
 *   <section style={`background-image:url(${lima.src})`} {...fondo('x.fondo', lima)}>
 * Al publicar, PHP cambia solo la url() de ese style.
 */
export function fondo(k: string, img: { attributes: Record<string, unknown> }): Record<string, string> {
  validarClave(k);
  const ancho = Number(img.attributes.width);
  const alto = Number(img.attributes.height);
  if (!ancho || !alto) throw new Error(`fondo("${k}"): la imagen no trae width/height; usa getImage({ width }).`);
  return { 'data-cms-fondo': k, 'data-cms-min': minimo(ancho, alto / ancho) };
}

/** Identificador de página para las claves de <head>: "/tratamientos/x/" → "tratamientos-x". */
export function idPagina(ruta: string): string {
  return ruta.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'inicio';
}
