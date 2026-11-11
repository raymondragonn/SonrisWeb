# Modo Edición — Sonris

> **Documento de traspaso.** Plan de implementación listo para ejecutar. No hay código
> escrito todavía.
>
> - **Repositorio:** `~/Dev/projects/sonris/sonris-site-web-front` (rama principal, sin ramas ni worktrees)
> - **Referencia:** el modo edición de GR Cárdenas
>   (`~/Dev/projects/grcardenas/grcardenas-site-web-front`, `docs/PLAN-MODO-EDICION.md`,
>   `backend/php/lib/*.php`, `frontend/public/editor.js`). Se reutiliza su núcleo; este
>   documento describe **solo lo que cambia** para Sonris y por qué.
> - **Orden:** fases en secuencia. **Detenerse al terminar la Fase 3** (piloto: home, header,
>   footer, `Seo.astro` y `llms.txt`) y validar el flujo completo antes de marcar el resto.
> - **Verificación:** al final. Ninguna fase se da por terminada sin su comprobación.
>
> **Estado (rama `feat/modo-edicion`):** fases 1 a 4 hechas, la 5 casi completa
> (falta el panel estructurado de horario y dirección) y la 6 hecha. Todo el sitio es
> editable: 17 rutas + 404, 1180 marcadores. Pendiente: Fase 7 (exportar/traer
> contenido) y la revisión visual del usuario.
>
> Fase 4, decisiones:
> - Islas: `AntesDespues` → componente Astro; `MenuMovil` y `FocoTratamientos` reciben
>   los textos como slots escritos uno a uno (Astro no admite nombres de slot
>   dinámicos; un `throw` al compilar avisa si cambia el número de enlaces o de
>   tratamientos).
> - Títulos, descripciones y migas compuestos (tratamientos, legales, contacto,
>   indicaciones) se forman con segmentos de las claves de las que salen: no tienen
>   campo propio en Ajustes y nunca se desfasan.
> - Contenido inerte en `<template data-cms-bloque>` (titular alterno del hub,
>   testimonios): el editor lo muestra en una caja editable.
> - No editables: nombre y colegiado de la directora médica, razón social, CIF,
>   dirección y horario (datos de identidad del JSON-LD), reseñas de Google, URL del
>   tour 3D y del mapa, enlaces de redes, el formulario y los textos del JSON-LD que no
>   se ven en la página (MedicalProcedure de ortodoncia).
>
> Cambios respecto al plan original, decididos al implementar:
> - Piloto en `/ortodoncia-invisible/` (no la home): es la única con FAQ + `FAQPage`,
>   `MedicalProcedure`, migas y los dos tipos de isla. Por eso `Acordeon` (→ `Faq.astro`
>   con `<details>`) y `CarruselPlanes` (→ `Planes.astro`) se adelantaron a la Fase 3.
>   El FAQ del hub de tratamientos ya usa `Faq.astro`, todavía sin claves.
> - **Horario y dirección no son editables como texto**: el JSON-LD los guarda
>   estructurados (horas de apertura) y junto a las coordenadas; un texto libre los
>   contradiría. Irán al panel "Datos de la clínica" con campos estructurados.
>   Teléfono, WhatsApp y email sí se editan desde el piloto.
> - El menú de navegación y el botón "Reservar visita" del header aún no son
>   editables: el menú móvil los recibe por props. Van con la Fase 4.
> - Los anchos del `srcset` de una imagen se leen del HTML compilado la primera vez y
>   se guardan en `imagenes.json`: leerlos después del HTML publicado haría que cada
>   reemplazo heredara los del anterior.
> - Añadido tras el piloto: **vídeos propios** (`<CmsVideo>`, MP4/WebM hasta 50 MB,
>   portada opcional; sin recompresión: no hay ffmpeg en Hostinger), **enlaces de
>   YouTube** (clave `….youtube`, reproductor incrustado derivado con `@yt`) e
>   **imágenes de fondo** (`fondo()` en el `style`). Toda imagen lleva
>   `data-cms-min` con su resolución mínima: el servidor rechaza las más pequeñas y el
>   editor avisa antes de subir (y si la proporción obliga a recortar).
> - Entorno local: un solo contenedor `dev` en el 8080 (Apache + PHP + recompilación
>   automática al guardar código). Sin recarga en caliente.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Qué se edita | **Todos los textos** (páginas, FAQ, tratamientos, planes, contacto, horario, legales, título y descripción de cada página, textos alternativos) **e imágenes** |
| Qué no se edita | Los textos del **formulario de contacto** (isla `FormularioCita`), las **reseñas de Google** (vienen de la API en el build y sus condiciones no permiten modificarlas) y las URLs de las redes |
| Imágenes | Reemplazar imágenes fijas, incluidas las de los carruseles de `ui.ts`. **Sin** añadir ni quitar fotos de un carrusel: no se ha pedido; se añade después si hace falta |
| Publicación | **Al instante**, como en GR: PHP reescribe el HTML publicado al pulsar Publicar |
| Acceso | **Una sola cuenta** de administrador, `password_hash()`, sin base de datos (igual que GR) |
| Hosting | **Hostinger compartido**, PHP 8, subida por FTP, sin CDN ni nada delante |

## Cómo funciona (resumen)

Idéntico a GR en lo esencial:

1. Cada fragmento editable va entre comentarios marcadores que sobreviven a la compilación:
   `<!--cms:inicio.hero.titulo-->Texto<!--/cms-->`.
2. El administrador entra por una dirección discreta; una cookie legible hace que `Base.astro`
   descargue `editor.js`. El visitante normal no descarga ni un byte del editor.
3. Al publicar, PHP guarda en `storage/contenido.json` (escritura atómica) y reescribe los
   `.html` publicados sustituyendo lo que hay entre marcadores. El visitante recibe HTML
   estático puro.
4. Si `contenido.json` se pierde, el sitio muestra el texto del código fuente: lo editado es una
   capa encima, nunca un reemplazo.

## Por qué no basta con copiar GR

Sonris tiene cuatro cosas que GR no tiene, y cada una rompería SEO/GEO si se parchea solo el
texto visible:

| Problema | Consecuencia si no se trata |
|---|---|
| **JSON-LD rico** (`Dentist`+`MedicalClinic`, `Physician`, `FAQPage`, `MedicalProcedure`, `BreadcrumbList`) generado desde los mismos datos que el texto visible | El texto visible dice una cosa y la ficha estructurada otra. Es la contradicción que más penaliza en posicionamiento local y en buscadores generativos. **GR tampoco lo resuelve hoy:** su JSON-LD tiene el teléfono fijo en `Layout.astro` |
| **Atributos derivados**: `tel:+34…`, `wa.me/34…`, el E.164 del JSON-LD, `geo.placename` | Cambiar el teléfono visible dejaría el enlace y la ficha con el número viejo |
| **Islas de React** que reciben el texto por props (`Acordeon`, `PestanasVariantes`, `CarruselPlanes`, `FocoTratamientos`) | React vuelve a pintar desde las props serializadas al hidratar: el usuario vería el texto viejo y un rastreador sin JS el nuevo |
| **Imágenes con `srcset`** (`widths`/`sizes` de `astro:assets`) | GR sustituye por un `<img>` único de 2000 px: en móvil se descargaría la grande y empeoraría el LCP |
| **`public/llms.txt`** con los datos citables escritos a mano | Los buscadores generativos leerían datos distintos de los del sitio |

Las soluciones están en las fases 1 a 3.

---

## Arquitectura

### Tipos de marcador

| Marcador | Dónde | Lo emite | Lo aplica PHP |
|---|---|---|---|
| Texto | `<!--cms:k-->…<!--/cms-->` | `Cms.astro` (igual que GR) | Sustitución entre comentarios, con `htmlspecialchars` |
| Imagen | `<!--cms-img:k-->…<!--/cms-img-->` | `CmsImage.astro` | Reescribe `src`, `srcset`, `width`, `height`, `alt`; conserva `sizes`, `loading`, `decoding`, clases y estilos |
| Atributo | `data-cms-attr="href:contacto.telefono@tel"` en el propio elemento | Ayudante `cmsAttr()` | Sustituye el valor del atributo indicado, aplicando el derivado (`@tel`) |
| JSON-LD | Mapa `data-cms-ld='{"@graph.0.telephone":"contacto.telefono@e164"}'` en el `<script type="application/ld+json">` | Ayudante `ld(k, valor)` en `Seo.astro` y en el `jsonLd` de cada página | `json_decode` → cambia las rutas del mapa → `json_encode` con `JSON_HEX_TAG` (un texto nunca puede cerrar el `<script>`) |
| `<head>` | `<title>`, `description`, `og:*`, `twitter:*` | `<meta name="cms-pagina">` (como `gr-pagina`) | Por etiqueta, como `sustituirMeta()` de GR, **ampliado a `og:title`, `og:description`, `twitter:*` y el `name`/`description` del `WebPage` del JSON-LD** |
| Texto plano | `llms.txt` | Se compila como `llms.txt` + plantilla `storage/llms.tpl` con `{{k}}` | Se regenera entero en cada publicación |

**Regla de oro: un dato, una clave, en todos los sitios.** El nombre de un tratamiento aparece
en el hub, en la home, en las migas, en su `MedicalProcedure` y en el `BreadcrumbList`: todos
usan `tratamientos.<slug>.nombre`. Una pregunta del FAQ es la misma clave en el `<summary>`
visible y en el `FAQPage`.

### Ayudante `ld()` para el JSON-LD

`Seo.astro` ya monta un único `grafo` (línea 127). Los valores editables se envuelven:

```ts
telephone: ld('contacto.telefono@e164', CONTACTO.telefonoE164),
```

`ld()` devuelve un objeto marcado; antes de `JSON.stringify(grafo)`, un recorrido sustituye cada
marca por su valor y anota la ruta (`@graph.0.telephone`). El mapa sale en `data-cms-ld`. Sin
contenido editado, el JSON-LD resultante es **byte a byte** el de hoy.

### Derivados

Un dato de contacto se escribe una vez y PHP calcula sus formas. Tabla fija en
`lib/Derivados.php`, **no configurable** (es una lista corta que no cambia):

| Sufijo | Ejemplo de entrada `910 459 517` | Salida |
|---|---|---|
| (ninguno) | texto visible | `910 459 517` |
| `@e164` | JSON-LD | `+34910459517` |
| `@tel` | `href` | `tel:+34910459517` |
| `@wa` | `href` (WhatsApp) | `https://wa.me/34658746117` |

El editor valida los teléfonos (9 dígitos españoles) **antes** de publicar: un número mal escrito
rompería tres sitios a la vez.

### Islas: el texto editable nunca viaja en props

| Isla | Cambio |
|---|---|
| `Acordeon` (FAQ en ortodoncia y tratamientos) | Se sustituye por `<details>`/`<summary>` nativos. Sin JS, mejor para SEO, y los marcadores funcionan. Se conserva el aspecto con CSS |
| `PestanasVariantes` | Los paneles se pintan en el HTML del servidor; la isla (o `ui.ts`) solo muestra/oculta por `id` |
| `CarruselPlanes`, `FocoTratamientos` | Las tarjetas se pintan en el HTML; el comportamiento pasa a leer el DOM existente (mejora progresiva) |
| `AntesDespues` | Las imágenes de los casos salen al HTML con `CmsImage`; la isla solo controla el deslizador |
| `MenuMovil` | Recibe `NAV`: los nombres del menú se editan en el header de escritorio; el menú móvil los lee del DOM en vez de las props |
| `FormularioCita` + `Aviso` | **Sin cambios.** Fuera del alcance por decisión del cliente |

Criterio de aceptación de cada isla: visualmente idéntica y `grep` del texto en el HTML compilado
(el rastreador sin JS lo ve).

### Imágenes

`Imagenes.php` de GR, con un cambio: al reemplazar una imagen marcada, lee los anchos de su
`srcset` actual (`520w`, `1040w`…) y genera **esos mismos anchos** en WebP con GD, más el ancho
máximo para `src`. Conserva `sizes`. Resultado equivalente al de `astro:assets`.

Validación de subida igual que GR (`finfo`, tamaño y píxeles máximos, nombre saneado) y **texto
alternativo obligatorio**. La imagen Open Graph (`/og/sonris-og.png`) entra como imagen editable
en el panel "Ajustes de esta página", exportada a 1200×630 PNG/JPEG (WebP no es seguro para OG).

### Estructura en el servidor

```
public_html/                  (lo que sale de dist/)
├── */index.html              reescritos por PHP al publicar
├── llms.txt                  regenerado al publicar
├── api/                      entrar, salir, clave, guardar, subir-imagen, republicar, exportar
├── lib/  bin/  tests/        bloqueados por .htaccess
├── storage/                  bloqueado: contenido.json, imagenes.json, admin.json, llms.tpl
└── subidas/                  público, sin ejecución de PHP
```

### Código fuente y sitio publicado no se separan

En GR, tras cada FTP hay que visitar `republicar.php`, y el repositorio conserva los textos
viejos. Aquí:

- `api/exportar.php` (con sesión) descarga `contenido.json` + `imagenes.json` + `subidas/`.
- `npm run traer-contenido` los baja a `src/data/editado/` y el build los aplica **en Astro**
  antes de compilar: el HTML nuevo nace ya con lo editado.
- `republicar.php` se conserva como red de seguridad (idempotente), no como paso obligatorio.

---

## Archivos

### Nuevos

| Archivo | Qué hace |
|---|---|
| `backend/php/lib/Auth.php` | **Copiado de GR** sin cambios de fondo |
| `backend/php/lib/Contenido.php` | GR + marcadores de atributo, JSON-LD, `<head>` ampliado y `llms.txt` |
| `backend/php/lib/Derivados.php` | Tabla de sufijos `@e164`, `@tel`, `@wa` |
| `backend/php/lib/Imagenes.php` | GR + generación de `srcset` con los anchos originales |
| `backend/php/api/*.php` | Los de GR + `exportar.php` |
| `backend/php/bin/crear-admin.php` | Alta inicial por consola |
| `backend/php/tests/test-*.php` | `assert` sin framework: sustitución, JSON-LD, derivados, idempotencia, escapado |
| `src/components/Cms.astro`, `CmsImage.astro` | Como GR; `CmsImage` pasa `widths`/`sizes` a `<Image>` |
| `src/lib/cms.ts` | `ld()`, `cmsAttr()` y la lectura de `src/data/editado/` |
| `public/editor.js`, `public/editor.css` | Editor de GR + panel de contacto + ajustes ampliados |
| `scripts/copiar-backend.mjs` | Postbuild: copia el PHP a `dist/`, no toca `storage/` |
| `scripts/traer-contenido.mjs` | Descarga lo editado del servidor antes de compilar |
| `Dockerfile` (servicio `web`) | `php:8.3-apache` con GD+WebP, `mod_rewrite`, `AllowOverride All` — el de GR |

### Modificados

| Archivo | Cambio |
|---|---|
| `src/components/Seo.astro` | `ld()` en todos los valores editables; `cms-pagina`; OG editable |
| `src/layouts/Base.astro` | Línea de carga del editor (cookie) |
| `src/pages/**`, `Header`, `Footer`, `BarrasFijas`, `CtaFinal` | Envolver textos e imágenes |
| `src/data/*.ts` | Sin cambiar el contenido; solo se leen a través de `src/lib/cms.ts` |
| `src/islands/*` | Ver tabla de islas |
| `scripts/generar-redirecciones.mjs` | El `.htaccess` generado añade: bloqueo de `storage/`, `lib/`, `bin/`, `tests/`; `Cache-Control: no-cache` para `.html` (sin él, el navegador puede servir el HTML viejo y el cambio no sería instantáneo); `subidas/` sin PHP |
| `scripts/comprobar.mjs` | Nueva comprobación 12: cada marcador abre y cierra, sin anidar, y cada `data-cms-ld` apunta a rutas existentes |
| `docker-compose.yml` | Servicios `build` + `web` (Apache+PHP) como GR; `dev` se conserva para maquetar |
| `public/llms.txt` | Pasa a generarse desde la plantilla con claves |

---

## Fases

### Fase 1 — Entorno y backend base
Docker `build` + `web` (Apache + PHP 8.3) copiado de GR y adaptado a `dist/` con formato
directorio. Portar `Auth.php`, `Contenido.php`, `Imagenes.php` y los endpoints. Añadir
`Derivados.php`. Tests en verde.

### Fase 2 — Marcadores nuevos
`src/lib/cms.ts` con `ld()` y `cmsAttr()`. Aplicación en PHP de atributos, JSON-LD, `<head>`
ampliado y `llms.txt`. Test específico: tras editar `contacto.telefono`, el texto, los `href`, el
JSON-LD y `llms.txt` coinciden, y el JSON-LD sigue siendo JSON válido.

### Fase 3 — Piloto (DETENERSE AQUÍ)
Marcar home, `Header`, `Footer`, `BarrasFijas`, `CtaFinal`, `Seo.astro` completo y `llms.txt`.
Convertir `FocoTratamientos` (única isla de la home con texto). Validar el flujo completo con el
editor (Fase 5 mínima: texto e imagen fija) antes de seguir.

### Fase 4 — Islas y resto de páginas
Islas según la tabla. Después: ortodoncia invisible, hub y 7 tratamientos (`[slug].astro`),
Dra. Vélez, sobre nosotros, contacto (sin el formulario), las 3 legales (bloques completos,
como en GR), indicaciones post-tratamiento y 404.

### Fase 5 — Editor
`editor.js` de GR más:
- **Panel "Datos de la clínica"**: teléfono, WhatsApp, email, dirección, horario. Son datos que
  viven en muchos sitios y no siempre se ven en pantalla; se editan en un solo lugar con
  validación de formato.
- **"Ajustes de esta página"**: título (~60), descripción (~155) con contador, imagen OG.
- Protecciones de GR: aviso al vaciar un `h1` o una pregunta del FAQ, `alt` obligatorio, texto
  plano al pegar, aviso al salir con cambios sin publicar.
- Aviso en textos legales: "este texto lo revisa la asesoría antes de cambiarlo".

### Fase 6 — Imágenes
Reemplazo con `srcset` equivalente; imagen OG; casos de `AntesDespues`.

### Fase 7 — Despliegue
`exportar.php` + `traer-contenido`. README con el procedimiento de FTP: **no borrar
`storage/` ni `subidas/`**, compilar después de `npm run traer-contenido`. Documentar la
recuperación de contraseña (`bin/crear-admin.php` o borrar `admin.json`).

---

## Impacto en SEO y GEO

| Elemento | Impacto |
|---|---|
| Texto indexable | Ninguno: HTML ya renderizado, igual que hoy |
| JSON-LD (`Dentist`, `FAQPage`, `MedicalProcedure`…) | Ninguno: se actualiza con las mismas claves que el texto |
| Datos de contacto (NAP) | Ninguno: un valor, todas sus formas derivadas |
| `llms.txt` | Ninguno: se regenera con lo publicado |
| Imágenes | Neutro: mismos anchos de `srcset`, WebP, dimensiones explícitas |
| Velocidad para el visitante | Ninguno: el editor no se descarga sin sesión |
| FAQ con `<details>` | Positivo: el contenido deja de depender de JS |
| Redirecciones, canónicas, sitemap | Sin cambios: no se edita la estructura ni las URLs |

El riesgo que queda es humano (textos peores, un `h1` vacío, un título de 200 caracteres) y lo
cubren las protecciones del editor. Como advertía el plan de GR: la herramienta amplifica lo que
se escriba con ella.

## Riesgos

1. **Caché de Hostinger.** Los planes compartidos pueden activar la caché del servidor desde
   hPanel. Si está activa, el cambio no se ve al instante: comprobarlo antes de dar la Fase 3
   por buena, y desactivarla o purgarla al publicar.
2. **`php_flag` en `.htaccess`.** Hostinger sirve con LiteSpeed; la protección de `subidas/`
   debe apoyarse también en `<FilesMatch>` + `Require all denied` (GR ya lo hace así), no solo en
   `php_flag engine off`.
3. **Subir por FTP sin `traer-contenido`** revierte la vista a los textos del código hasta
   visitar `republicar.php`. No se pierde nada (sigue en `contenido.json`).
4. **Una sola credencial**, sin recuperación por correo (igual que GR).
5. **Publicidad sanitaria.** El cliente podrá editar afirmaciones médicas y textos legales. El
   editor avisa, pero la responsabilidad del contenido es suya.

## Verificación

1. `npm run build && npm run comprobar` en verde, incluida la comprobación 12.
2. `php backend/php/tests/test-*.php` en verde.
3. `docker compose up --build dev` → `http://localhost:8080/entrar` (un solo contenedor: Apache + PHP + recompilación automática). Usar Docker, no
   `npm run dev`: el modo edición necesita Apache + PHP sirviendo el HTML compilado.
4. Editar el teléfono → confirmar en **todas** las páginas: texto visible, `href="tel:…"`,
   `telephone` del JSON-LD y `llms.txt`.
5. Editar una pregunta y su respuesta del FAQ → coinciden el `<summary>` visible y el
   `FAQPage`; validar con la prueba de resultados enriquecidos de Google.
6. Editar el nombre de un tratamiento → hub, home, migas, `MedicalProcedure` y
   `BreadcrumbList`.
7. En ventana privada (sin sesión): el visitante ve lo nuevo; `editor.js` no aparece en la red.
8. Con JS desactivado: los textos editados de las islas convertidas se ven igual.
9. Reemplazar la imagen del hero → mismo `srcset` (mismos anchos), `sizes` intacto; Lighthouse
   móvil: LCP y CLS no empeoran.
10. `republicar.php` dos veces → HTML idéntico. Recompilar tras `traer-contenido` → mismo HTML
    que el publicado.
11. Seguridad (como GR): sin sesión o sin CSRF se rechaza; un `.php` renombrado a `.jpg` se
    rechaza; un texto con `<script>` o `</script>` se muestra como texto también dentro del
    JSON-LD; `/storage/admin.json` da 403.
12. En Hostinger, antes de entregar: editar un texto y comprobar que se ve al instante sin caché
    intermedia.
