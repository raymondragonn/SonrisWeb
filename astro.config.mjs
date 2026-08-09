// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { UTILIDAD_SLUGS } from './src/data/utilidad-slugs.js';

export default defineConfig({
  site: 'https://sonris.es',
  // Dentro del contenedor el bind mount de macOS no propaga los eventos de inotify,
  // así que el HMR solo se entera de los cambios sondeando. Fuera de Docker no.
  vite: process.env.DOCKER_DEV ? { server: { watch: { usePolling: true, interval: 300 } } } : {},
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Sin redirects en el build: las URLs antiguas solo existen en producción y
  // allí las 301 las declara el host, con las reglas que genera
  // `npm run redirecciones`. Aquí, cualquier ruta desconocida cae en /404/.
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES' } },
      // Fuera del sitemap todo lo que va con noindex: las cuatro páginas de
      // utilidad no tienen texto definitivo hasta que lo firme la asesoría.
      filter: (page) => !UTILIDAD_SLUGS.some((s) => page.endsWith(`/${s}/`)),
    }),
  ],
});
