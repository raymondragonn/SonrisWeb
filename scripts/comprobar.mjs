// Comprobación del cableado, sobre el build de dist/.
// Ejecuta: npm run comprobar (después de npm run build).
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { REDIRECCIONES } from '../src/data/redirecciones.js';
import { UTILIDAD_SLUGS } from '../src/data/utilidad-slugs.js';
import { RUTAS_EN, aIngles } from '../src/i18n/rutas.js';

const DIST = process.env.CMS_SALIDA ?? new URL('../dist/', import.meta.url).pathname;
assert.ok(existsSync(DIST), 'No hay dist/: ejecuta antes npm run build');

const RUTAS_CANONICAS = [
  '/',
  '/ortodoncia-invisible/',
  '/tratamientos/',
  '/tratamientos/estetica-dental/',
  '/tratamientos/implantes-dentales/',
  '/tratamientos/cirugia-ortognatica/',
  '/tratamientos/endodoncia/',
  '/tratamientos/cirugia-oral/',
  '/tratamientos/periodoncia/',
  '/tratamientos/odontologia-general/',
  '/dra-isabel-velez/',
  '/sobre-nosotros/',
  '/contacto/',
  ...UTILIDAD_SLUGS.map((s) => `/${s}/`),
];

const html = (ruta) => readFileSync(join(DIST, ruta, 'index.html'), 'utf8');

// 1. Las 17 rutas del mapa de cableado existen en el build.
for (const r of RUTAS_CANONICAS) {
  assert.ok(existsSync(join(DIST, r, 'index.html')), `Falta la ruta ${r}`);
}
assert.equal(RUTAS_CANONICAS.length, 17, 'El mapa de cableado son 17 rutas');

// 2. La 404 se genera en la raíz, donde la buscan los hosts estáticos.
assert.ok(existsSync(join(DIST, '404.html')), 'Falta 404.html');

// 3. Cada destino de redirección es una ruta final: ni cadenas ni bucles.
const destinos = REDIRECCIONES.filter((r) => r.codigo === 301).map((r) => r.a);
const origenes = new Set(REDIRECCIONES.map((r) => r.de));
for (const d of destinos) {
  const base = d.split('#')[0];
  assert.ok(!origenes.has(base), `Cadena de redirección: ${base} es a la vez origen y destino`);
  assert.ok(RUTAS_CANONICAS.includes(base), `Destino inexistente: ${base}`);
}

// 4. Toda ancla usada como destino existe como id real en su página.
for (const d of destinos.filter((x) => x.includes('#'))) {
  const [base, ancla] = d.split('#');
  assert.match(html(base), new RegExp(`id="${ancla}"`), `Ancla #${ancla} inexistente en ${base}`);
}

// 5. Un solo h1 por página, y ningún href vacío.
for (const r of RUTAS_CANONICAS) {
  const doc = html(r);
  const h1 = doc.match(/<h1[\s>]/g) || [];
  assert.equal(h1.length, 1, `${r} tiene ${h1.length} h1`);
  assert.ok(!/href="#"/.test(doc) && !/href=""/.test(doc), `${r} tiene un href vacío`);
}

// 6. Canónica correcta y única en cada página.
for (const r of RUTAS_CANONICAS) {
  const canon = html(r).match(/<link rel="canonical" href="([^"]+)"/g) || [];
  assert.equal(canon.length, 1, `${r} no tiene exactamente una canónica`);
  assert.ok(canon[0].includes(`https://sonris.es${r}`), `Canónica incorrecta en ${r}`);
}

// 6b. Versión en inglés: cada ruta tiene su gemela, con su canónica y lang="en",
// y las dos se enlazan con hreflang.
for (const r of RUTAS_CANONICAS) {
  const en = aIngles(r);
  assert.ok(RUTAS_EN[r], `Falta la ruta inglesa de ${r} en src/i18n/rutas.js`);
  assert.ok(existsSync(join(DIST, en, 'index.html')), `Falta la ruta ${en}`);
  const doc = html(en);
  assert.ok(doc.includes(`<link rel="canonical" href="https://sonris.es${en}"`), `Canónica incorrecta en ${en}`);
  assert.match(doc, /<html lang="en"/, `${en} no lleva lang="en"`);
  assert.ok(html(r).includes(`hreflang="en" href="https://sonris.es${en}"`), `${r} no enlaza su versión inglesa`);
  assert.equal((doc.match(/<h1[\s>]/g) || []).length, 1, `${en} no tiene un solo h1`);
}

// 7. Las páginas sin contenido definitivo van con noindex y fuera del sitemap.
const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
for (const s of UTILIDAD_SLUGS) {
  assert.match(html(`/${s}/`), /name="robots" content="noindex/, `/${s}/ debería ir con noindex`);
  assert.ok(!sitemap.includes(`/${s}/`), `/${s}/ no debería estar en el sitemap`);
  assert.match(html(aIngles(`/${s}/`)), /name="robots" content="noindex/, `${aIngles(`/${s}/`)} debería ir con noindex`);
  assert.ok(!sitemap.includes(aIngles(`/${s}/`)), `${aIngles(`/${s}/`)} no debería estar en el sitemap`);
}
assert.match(readFileSync(join(DIST, '404.html'), 'utf8'), /name="robots" content="noindex/);

// 8. El sitemap lista exactamente las 13 rutas indexables, en los dos idiomas.
const enSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(enSitemap.length, 26, `El sitemap tiene ${enSitemap.length} rutas, esperaba 26 (13 × 2 idiomas)`);

// 9. Todo <img> lleva alt, width y height (regla de la auditoría).
for (const r of RUTAS_CANONICAS) {
  for (const img of html(r).match(/<img[^>]*>/g) || []) {
    assert.match(img, /\salt(=|[\s>])/, `<img> sin alt en ${r}: ${img.slice(0, 90)}`);
    assert.match(img, /\swidth=/, `<img> sin width en ${r}: ${img.slice(0, 90)}`);
    assert.match(img, /\sheight=/, `<img> sin height en ${r}: ${img.slice(0, 90)}`);
  }
}

// 10. Los ficheros que citan las máquinas están donde toca.
for (const f of ['robots.txt', 'llms.txt', 'sitemap-index.xml']) {
  assert.ok(existsSync(join(DIST, f)), `Falta ${f}`);
}

// 11. Las imágenes referenciadas existen, incluidas las que el script carga
// tarde por data-src (los fotogramas del alineador) y las de subcarpetas.
for (const r of RUTAS_CANONICAS) {
  for (const [, src] of html(r).matchAll(/-?src="\/img\/([^"]+)"/g)) {
    assert.ok(existsSync(join(DIST, 'img', src)), `Imagen inexistente /img/${src} en ${r}`);
  }
}

// 12. Marcadores del modo edición bien formados. Un marcador roto no falla al
// compilar: el texto simplemente deja de ser editable, o PHP toma el cierre de otro.
const decodificar = (v) =>
  JSON.parse(v.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
const buscar = (obj, puntero) =>
  puntero
    .slice(1)
    .split('/')
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((n, p) => (n != null && p in Object(n) ? n[p] : undefined), obj);

let marcadores = 0;
for (const r of [...RUTAS_CANONICAS, ...RUTAS_CANONICAS.map(aIngles), '404']) {
  const doc = r === '404' ? readFileSync(join(DIST, '404.html'), 'utf8') : html(r);
  for (const tipo of ['cms', 'cms-img', 'cms-video']) {
    let abierto = null;
    for (const [m, clave] of doc.matchAll(new RegExp(`<!--(?:${tipo}:([a-z0-9][a-z0-9.-]*)|/${tipo})-->`, 'g'))) {
      if (clave) {
        assert.equal(abierto, null, `Marcador ${tipo}:${clave} anidado dentro de ${abierto} en ${r}`);
        abierto = clave;
        marcadores++;
      } else {
        assert.notEqual(abierto, null, `Cierre ${m} sin apertura en ${r}`);
        abierto = null;
      }
    }
    assert.equal(abierto, null, `Marcador ${tipo}:${abierto} sin cierre en ${r}`);
  }
  for (const [, v] of doc.matchAll(/data-cms-(?:attr|texto)="([^"]*)"/g)) decodificar(v);
  // Un solo data-cms-attr por etiqueta: dos attrs() en el mismo elemento dejan el
  // atributo repetido y PHP solo vería uno de ellos. Se unen en una sola llamada.
  for (const [etiqueta] of doc.matchAll(/<[a-zA-Z][^>]*>/g)) {
    assert.ok((etiqueta.match(/\sdata-cms-attr=/g) ?? []).length <= 1, `data-cms-attr repetido en ${r}: ${etiqueta.slice(0, 120)}…`);
  }
  for (const [, mapa, json] of doc.matchAll(/<script\b[^>]*\sdata-cms-ld="([^"]*)"[^>]*>(.*?)<\/script>/gs)) {
    const datos = JSON.parse(json);
    for (const puntero of Object.keys(decodificar(mapa))) {
      assert.ok(buscar(datos, puntero) !== undefined, `JSON-LD de ${r}: la ruta ${puntero} no existe`);
    }
  }
}
assert.ok(existsSync(join(DIST, 'cms-plantillas/llms.json')), 'Falta la plantilla de llms.txt del modo edición');

console.log(
  `✓ ${RUTAS_CANONICAS.length} rutas, ${REDIRECCIONES.length} redirecciones y 13 comprobaciones en orden (${marcadores} marcadores editables)`
);
