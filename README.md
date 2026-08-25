# Sonris — sitio web

Astro 5 estático + islas de React. Implementación del rediseño definido en el
proyecto de Claude Design «Actualización del sistema de diseño».

```bash
npm install
npm run dev          # servidor local
npm run build        # genera dist/
npm run comprobar    # 11 comprobaciones sobre dist/ (rutas, anclas, SEO, imágenes)
npm run redirecciones # regenera deploy/ con las reglas del host
npm run check        # astro check (TypeScript)
```

## Docker

```bash
docker build -t sonris-website .
docker run -d --name sonris -p 8080:80 sonris-website   # http://localhost:8080
docker logs -f sonris
docker rm -f sonris
```

Dos etapas: `node:22-alpine` compila (`npm ci` en su propia capa, luego
`redirecciones` + `build` + `comprobar`, así que **una comprobación fallida rompe
la imagen**), y `nginx:alpine` sirve. La imagen final son 94 MB y no lleva Node ni
`node_modules`.

nginx usa `deploy/nginx-docker.conf`, generado en la etapa de compilación desde
`src/data/redirecciones.js`: no hay una segunda copia de la tabla que se pueda
desincronizar. Resuelve las 32 × 301, la 410, la barra final, el `no-cache` del
HTML, el `immutable` de `/_astro/` y la 404 de marca. `absolute_redirect off`
deja el `Location` relativo, que es lo correcto detrás de un proxy o una CDN.

TLS, `www` → sin `www` y HTTP → HTTPS quedan **fuera del contenedor**: son del
borde. Las reglas están en `deploy/sonris.nginx.conf` si el borde es también nginx.

## Rutas

Las 17 del mapa de cableado, todas con barra final:

| Ruta | Archivo |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/ortodoncia-invisible/` | `src/pages/ortodoncia-invisible/index.astro` |
| `/tratamientos/` | `src/pages/tratamientos/index.astro` |
| `/tratamientos/<7 slugs>/` | `src/pages/tratamientos/[slug].astro` + `src/data/tratamientos.ts` |
| `/dra-isabel-velez/` | `src/pages/dra-isabel-velez/index.astro` |
| `/sobre-nosotros/` | `src/pages/sobre-nosotros/index.astro` |
| `/contacto/` | `src/pages/contacto/index.astro` |
| `/aviso-legal/` y las otras 2 legales | `src/pages/[legal].astro` + `src/data/legal.ts` |
| `/indicaciones-post-tratamiento/` | `src/pages/indicaciones-post-tratamiento/index.astro` |
| 404 | `src/pages/404.astro` → `dist/404.html` |

Las páginas-escaparate del diseño (Sistema de Diseño, Cableado y redirecciones,
Estados y 404, Responsive y auditoría, Utilidad plantilla) **no** son rutas del
sitio: su contenido está absorbido en el sistema, en las rutas reales y en este
repositorio.

## Islas de React

Solo donde hay estado real. El resto es HTML estático; el header sticky, los
contadores y las cargas diferidas van en `src/scripts/ui.ts`, un módulo sin JSX.

| Isla | Dónde | Directiva |
| --- | --- | --- |
| `MenuMovil` | header, todas las páginas | `client:idle` |
| `FocoTratamientos` | home | `client:visible` |
| `CarruselPlanes` | ortodoncia invisible | `client:visible` |
| `Acordeon` | FAQ de ortodoncia | `client:visible` |
| `PestanasVariantes` | estética dental | `client:visible` |
| `AntesDespues` | Dra. Vélez | `client:visible` |
| `FormularioCita` + `Aviso` | contacto | `client:load` |

## Formulario

Un solo formulario en todo el sitio, en `/contacto/#formulario`. No hay backend:
el paciente elige **WhatsApp** o **correo** y da el último clic él mismo.

- WhatsApp: abre `wa.me` en una pestaña nueva con el mensaje ya escrito.
- Correo: abre el gestor de correo con asunto y cuerpo rellenos, para enviarlo a mano.

En ambos casos aparece una notificación en la esquina inferior derecha que
confirma qué ha pasado, y otra en rojo si la validación falla o el navegador
bloquea la ventana. Validación en cliente con `aria-invalid` y `aria-describedby`
por campo, foco al primero que falle y, en móvil, tres pasos con barra de progreso.

## Redirecciones

Fuente única: `src/data/redirecciones.js` (32 × 301 + 1 × 410).

`npm run redirecciones` genera `deploy/` con las reglas para Netlify y Cloudflare
Pages (`_redirects`), Vercel (`vercel.json`), nginx y Apache. **Copia el archivo
del host que uses**: las 301 son cosa del host, no del build. El sitio estático no
genera páginas de refresco por cada URL antigua; cualquier dirección desconocida
cae en la 404 de marca.

La normalización de barra final y de `www` se resuelve en el host, antes que la
tabla, para que un origen sin barra no encadene dos saltos.

## Reseñas de Google

La sección de reseñas de la home se resuelve **en el build** (`src/lib/resenas.ts`),
con la Places API (New). El visitante recibe HTML plano: ni una llamada a Google
desde su navegador, ni cookies de terceros.

```bash
cp .env.example .env   # y rellena GOOGLE_PLACES_API_KEY
```

Sin clave, `obtenerResenas()` devuelve `null` y la sección no se pinta: el build
no falla. Un error de red o de cuota se registra en consola y tiene el mismo
efecto. `GOOGLE_PLACE_ID` es opcional; si falta, la ficha se localiza por nombre
y dirección.

Google entrega **hasta cinco reseñas** y no permite conservarlas más de 30 días,
así que hay que reconstruir el sitio dentro de ese plazo para mantenerlas al día.

## SEO y GEO

- Canónica, `hreflang es-ES`, Open Graph y Twitter Card en `src/components/Seo.astro`.
- JSON-LD como un solo `@graph` por página: `Dentist` + `MedicalClinic` con NAP,
  geo, horarios y área de servicio; `Person` + `Physician` para la dirección médica;
  `WebSite`; `WebPage` con `BreadcrumbList`; y, por página, `MedicalProcedure`,
  `ItemList` o `FAQPage`.
- `FAQPage` solo incluye preguntas con respuesta real: las pendientes no entran.
- `sitemap-index.xml` con las 13 rutas indexables; las 4 de utilidad y la 404 van
  con `noindex` y quedan fuera.
- `public/llms.txt` con los datos citables de la clínica y las advertencias sobre
  qué no debe inferirse (precios, financiación, garantía de resultado).
- Sin dependencias de fuentes bloqueantes más allá de Google Fonts con `preconnect`;
  el mapa de Google y el tour de Matterport no cargan hasta que el visitante lo pide.

## Contenido pendiente

El sitio **no publica avisos de encargo**: los recuadros «CONTENIDO PENDIENTE» se
han retirado del marcado. El inventario íntegro de lo que falta, con la ruta y el
punto exacto donde vuelve cada pieza, está en [`PENDIENTES.md`](PENDIENTES.md).

En resumen: fotografía real (las 35 imágenes son marcadores de color liso en
`public/img/`, con el `alt` definitivo ya escrito), texto legal de las 4 páginas
de utilidad, las 7 respuestas de FAQ que faltan, los 6 casos antes/después con
consentimiento, el vídeo de colocación y la imagen Open Graph.
# SonrisWeb
