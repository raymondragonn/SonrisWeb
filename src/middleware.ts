// Versión en inglés. Corre al compilar cada página:
//  1. Fija el idioma antes de renderizar (lo leen c(), ld() y <Cms>).
//  2. En las páginas /en/, sobre el HTML ya compilado: enlaces internos a sus
//     rutas inglesas, y los textos sin clave editable (alt, aria-label, textos
//     fijos de plantillas, JSON-LD) por su traducción de frases-en.json.
// Solo cambia frases que coinciden enteras: nunca trozos de una frase.

import { defineMiddleware } from 'astro:middleware';
import { fijarIdioma } from './i18n/idioma';
import { aIngles, esIngles } from './i18n/rutas.js';
import FRASES from './i18n/frases-en.json';

const frases = FRASES as Record<string, string>;
const ATRIBUTOS = /\s(alt|aria-label|title|placeholder|data-titulo|data-proveedor)="([^"]*)"/g;

// Entidades que Astro escribe en texto y atributos; las frases están en claro.
const decodificar = (s: string) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const codificar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function frase(texto: string): string | undefined {
  const limpio = decodificar(texto).replace(/\s+/g, ' ').trim();
  return limpio ? frases[limpio] : undefined;
}

function etiqueta(tag: string): string {
  return tag
    // Los enlaces con hreflang (selector de idioma) apuntan a propósito al otro idioma.
    .replace(/\shref="(\/[^"]*)"/, (m, href: string) => (/\shreflang=/.test(tag) ? m : ` href="${aIngles(href)}"`))
    .replace(ATRIBUTOS, (m, nombre: string, valor: string) => {
      const en = frase(valor);
      return en === undefined ? m : ` ${nombre}="${codificar(en)}"`;
    });
}

function jsonLd(bloque: string): string {
  return bloque.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/, (m, abre: string, json: string, cierra: string) => {
    const recorrer = (n: unknown): unknown =>
      typeof n === 'string'
        ? (frases[n] ?? n)
        : Array.isArray(n)
          ? n.map(recorrer)
          : n && typeof n === 'object'
            ? Object.fromEntries(Object.entries(n).map(([k, v]) => [k, recorrer(v)]))
            : n;
    return abre + JSON.stringify(recorrer(JSON.parse(json))) + cierra;
  });
}

export function traducirHtml(html: string): string {
  return html
    .split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>)/)
    .map((trozo) => {
      if (trozo.startsWith('<script')) return trozo.includes('application/ld+json') ? jsonLd(trozo) : trozo;
      if (trozo.startsWith('<style') || trozo.startsWith('<!--')) return trozo;
      if (trozo.startsWith('<')) return etiqueta(trozo);
      const en = frase(trozo);
      if (en === undefined) return trozo;
      // Conserva los espacios de alrededor: separan palabras de etiquetas vecinas.
      const [, antes, , despues] = trozo.match(/^(\s*)([\s\S]*?)(\s*)$/) as RegExpMatchArray;
      return antes + codificar(en) + despues;
    })
    .join('');
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const en = esIngles(ctx.url.pathname);
  fijarIdioma(en ? 'en' : 'es');
  const respuesta = await next();
  if (!en || !respuesta.headers.get('content-type')?.includes('text/html')) return respuesta;
  return new Response(traducirHtml(await respuesta.text()), respuesta);
});
