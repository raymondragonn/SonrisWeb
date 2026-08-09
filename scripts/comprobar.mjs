// Comprobación del cableado, sobre el build de dist/.
// Ejecuta: npm run comprobar (después de npm run build).
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { REDIRECCIONES } from '../src/data/redirecciones.js';
import { UTILIDAD_SLUGS } from '../src/data/utilidad-slugs.js';

const DIST = new URL('../dist/', import.meta.url).pathname;
assert.ok(existsSync(DIST), 'No hay dist/: ejecuta antes npm run build');

const RUTAS_CANONICAS = [
  '/',
  '/ortodoncia-invisalign/',
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

// 7. Las páginas sin contenido definitivo van con noindex y fuera del sitemap.
const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
for (const s of UTILIDAD_SLUGS) {
  assert.match(html(`/${s}/`), /name="robots" content="noindex/, `/${s}/ debería ir con noindex`);
  assert.ok(!sitemap.includes(`/${s}/`), `/${s}/ no debería estar en el sitemap`);
}
assert.match(readFileSync(join(DIST, '404.html'), 'utf8'), /name="robots" content="noindex/);

// 8. El sitemap lista exactamente las 13 rutas indexables.
const enSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(enSitemap.length, 13, `El sitemap tiene ${enSitemap.length} rutas, esperaba 13`);

// 9. Todo <img> lleva alt, width y height (regla de la auditoría).
for (const r of RUTAS_CANONICAS) {
  for (const img of html(r).match(/<img[^>]*>/g) || []) {
    assert.match(img, /\salt=/, `<img> sin alt en ${r}: ${img.slice(0, 90)}`);
    assert.match(img, /\swidth=/, `<img> sin width en ${r}: ${img.slice(0, 90)}`);
    assert.match(img, /\sheight=/, `<img> sin height en ${r}: ${img.slice(0, 90)}`);
  }
}

// 10. Los ficheros que citan las máquinas están donde toca.
for (const f of ['robots.txt', 'llms.txt', 'sitemap-index.xml']) {
  assert.ok(existsSync(join(DIST, f)), `Falta ${f}`);
}

// 11. Las imágenes referenciadas existen.
const disponibles = new Set(readdirSync(join(DIST, 'img')));
for (const r of RUTAS_CANONICAS) {
  for (const [, src] of html(r).matchAll(/<img[^>]+src="\/img\/([^"]+)"/g)) {
    assert.ok(disponibles.has(src), `Imagen inexistente /img/${src} en ${r}`);
  }
}

console.log(`✓ ${RUTAS_CANONICAS.length} rutas, ${REDIRECCIONES.length} redirecciones y 11 comprobaciones en orden`);
