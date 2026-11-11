// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { UTILIDAD_SLUGS } from './src/data/utilidad-slugs.js';
import { aIngles } from './src/i18n/rutas.js';

// Las de utilidad también en su versión inglesa.
const NOINDEX = UTILIDAD_SLUGS.flatMap((s) => [`/${s}/`, aIngles(`/${s}/`)]);

export default defineConfig({
  site: 'https://sonris.es',
  // Dentro del contenedor el bind mount de macOS no propaga los eventos de inotify,
  // así que el HMR solo se entera de los cambios sondeando. Fuera de Docker no.
  vite: process.env.DOCKER_DEV ? { server: { watch: { usePolling: true, interval: 300 } } } : {},
  // En Docker la salida y la caché viven en un volumen, fuera del árbol de macOS: el
  // mismo sistema de archivos para las dos, porque Astro mueve las imágenes de una
  // a otra con rename(). Fuera de Docker, los valores de siempre.
  outDir: process.env.CMS_SALIDA ?? './dist',
  cacheDir: process.env.CMS_CACHE ?? './node_modules/.astro',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Sin redirects en el build: las URLs antiguas solo existen en producción y
  // allí las 301 las declara el host, con las reglas que genera
  // `npm run redirecciones`. Aquí, cualquier ruta desconocida cae en /404/.
  integrations: [
    react(),
    sitemap({
      // Sin i18n del plugin: con slugs traducidos no sabe emparejar las versiones.
      // Los hreflang van en el <head> de cada página (Seo.astro).
      // Fuera del sitemap todo lo que va con noindex: las cuatro páginas de
      // utilidad no tienen texto definitivo hasta que lo firme la asesoría.
      filter: (page) => !NOINDEX.some((r) => page.endsWith(r)),
    }),
  ],
});
