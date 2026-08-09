// Genera las reglas de redirección para cada host a partir de una sola fuente
// (src/data/redirecciones.js), en deploy/. Elige el archivo del host que uses.
// Ejecuta: npm run redirecciones
import { mkdirSync, writeFileSync } from 'node:fs';
import { REDIRECCIONES } from '../src/data/redirecciones.js';

const DEPLOY = new URL('../deploy/', import.meta.url).pathname;
mkdirSync(DEPLOY, { recursive: true });

const r301 = REDIRECCIONES.filter((r) => r.codigo === 301 && r.a);
const r410 = REDIRECCIONES.filter((r) => r.codigo === 410);

const cabecera = (comentario) =>
  [
    `${comentario} Generado por scripts/generar-redirecciones.mjs. No editar a mano.`,
    `${comentario} Fuente: src/data/redirecciones.js`,
    `${comentario} ${r301.length} reglas 301 + ${r410.length} regla 410, más normalización de barra final y www.`,
    '',
  ].join('\n');

// Netlify y Cloudflare Pages comparten sintaxis de _redirects.
writeFileSync(
  `${DEPLOY}_redirects`,
  cabecera('#') +
    [
      'https://www.sonris.es/*  https://sonris.es/:splat  301!',
      'http://sonris.es/*       https://sonris.es/:splat  301!',
      '',
      ...r301.map((r) => `${r.de.padEnd(48)} ${r.a}  301!`),
      ...r410.map((r) => `${r.de.padEnd(48)} /404  410!`),
      '',
    ].join('\n')
);

// Vercel.
writeFileSync(
  `${DEPLOY}vercel.json`,
  JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      trailingSlash: true,
      cleanUrls: false,
      redirects: [
        ...r301.map((r) => ({ source: r.de.replace(/\/$/, ''), destination: r.a, permanent: true })),
        ...r301.map((r) => ({ source: r.de, destination: r.a, permanent: true })),
      ],
    },
    null,
    2
  ) + '\n'
);

// nginx.
writeFileSync(
  `${DEPLOY}sonris.nginx.conf`,
  cabecera('#') +
    [
      '# Normalización: primero www y esquema, luego barra final. Se aplican',
      '# antes que la tabla, así que un origen sin barra no genera dos saltos.',
      'server {',
      '  listen 443 ssl;',
      '  server_name www.sonris.es;',
      '  return 301 https://sonris.es$request_uri;',
      '}',
      '',
      'server {',
      '  listen 443 ssl;',
      '  server_name sonris.es;',
      '  root /var/www/sonris/dist;',
      '',
      '  # Barra final obligatoria.',
      '  rewrite ^([^.]*[^/])$ $1/ permanent;',
      '',
      ...r301.map((r) => `  location = ${r.de} { return 301 ${r.a}; }`),
      ...r410.map((r) => `  location = ${r.de} { return 410; }`),
      '',
      '  error_page 404 /404.html;',
      '  location / { try_files $uri $uri/index.html =404; }',
      '}',
      '',
    ].join('\n')
);

// nginx dentro del contenedor: sin ssl ni www, de eso se encarga el borde
// (proxy, balanceador o CDN). Aquí solo la tabla, la barra final y la 404.
writeFileSync(
  `${DEPLOY}nginx-docker.conf`,
  cabecera('#') +
    [
      'server {',
      '  listen 80;',
      '  # Sin esta línea, localhost dentro del contenedor resuelve a ::1 y no',
      '  # hay nadie escuchando: el healthcheck da connection refused.',
      '  listen [::]:80;',
      '  server_name _;',
      '  root /usr/share/nginx/html;',
      '  index index.html;',
      '',
      '  # Location relativo: nginx no ve el host ni el puerto públicos cuando',
      '  # está detrás de un proxy o publicado en otro puerto, y con absolute_redirect',
      '  # on los reconstruiría mal.',
      '  absolute_redirect off;',
      '',
      '  # Barra final obligatoria, salvo en archivos con extensión.',
      '  rewrite ^([^.]*[^/])$ $1/ permanent;',
      '',
      ...r301.map((r) => `  location = ${r.de} { return 301 ${r.a}; }`),
      ...r410.map((r) => `  location = ${r.de} { return 410; }`),
      '',
      '  # Los assets con hash en el nombre son inmutables; el HTML, no.',
      '  # Un solo add_header por location: expires escribiría un segundo',
      '  # Cache-Control y la respuesta saldría con la cabecera duplicada.',
      '  location /_astro/ {',
      '    add_header Cache-Control "public, max-age=31536000, immutable" always;',
      '  }',
      '  location ~* \\.(png|svg|jpg|jpeg|webp|woff2)$ {',
      '    add_header Cache-Control "public, max-age=2592000" always;',
      '  }',
      '',
      '  gzip on;',
      '  gzip_types text/plain text/css application/javascript application/json image/svg+xml application/xml;',
      '  gzip_min_length 1024;',
      '',
      '  error_page 404 /404.html;',
      '',
      '  # Las rutas del sitio son directorios (/contacto/), así que una regex',
      '  # sobre .html no las alcanza: el no-cache del HTML vive aquí.',
      '  location / {',
      '    add_header Cache-Control "no-cache" always;',
      '    try_files $uri $uri/index.html =404;',
      '  }',
      '}',
      '',
    ].join('\n')
);

// Apache.
writeFileSync(
  `${DEPLOY}.htaccess`,
  cabecera('#') +
    [
      'RewriteEngine On',
      '',
      '# https y sin www.',
      'RewriteCond %{HTTPS} off [OR]',
      'RewriteCond %{HTTP_HOST} ^www\\. [NC]',
      'RewriteRule ^(.*)$ https://sonris.es/$1 [R=301,L]',
      '',
      '# Barra final obligatoria.',
      'RewriteCond %{REQUEST_FILENAME} !-f',
      'RewriteRule ^(.*[^/])$ /$1/ [R=301,L]',
      '',
      ...r301.map((r) => `Redirect 301 ${r.de} ${r.a}`),
      ...r410.map((r) => `Redirect 410 ${r.de}`),
      '',
      'ErrorDocument 404 /404.html',
      '',
    ].join('\n')
);

console.log(
  `✓ deploy/: _redirects, vercel.json, sonris.nginx.conf, nginx-docker.conf y .htaccess (${r301.length} × 301, ${r410.length} × 410)`
);
