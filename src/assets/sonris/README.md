# Assets de sonris.es

Volcado completo de la biblioteca de medios de sonris.es vía WP REST API. **338 archivos**, 54.3 MB. Originales a resolución máxima (sin thumbnails de WordPress).

| Carpeta | Nº | Peso | Contenido |
|---|---:|---:|---|
| `blog/` | 85 | 11.6 MB | Imágenes de artículos del blog (2020-2026) |
| `tratamientos/` | 61 | 3.6 MB | Fotos por tratamiento (hero, detalle, iconografía asociada) |
| `casos/` | 49 | 0.9 MB | Antes/después: pares Inicio/Final, vista Externa e Interna |
| `iconos/` | 43 | 0.1 MB | Iconos SVG: sociales, contacto, tratamientos, UI |
| `equipo/` | 39 | 5.8 MB | Doctores, staff y galerías de equipo |
| `clinica/` | 29 | 0.9 MB | Instalaciones, entrada, tecnología, heros y secciones de página |
| `marcas/` | 26 | 0.7 MB | Alineadores y partners: Invisalign, Spark, ClearCorrect, sellos y acreditaciones |
| `video/` | 2 | 30.3 MB | Vídeos MP4 del sitio |
| `documentos/` | 2 | 0.5 MB | PDFs descargables |
| `logos/` | 2 | 0.0 MB | Logotipo Sonris (SVG + WebP) |

## manifest.json

Un registro por archivo con: `id` (ID de WordPress), `categoria`, `archivo` (ruta relativa), `origen` (URL original), `mime`, `alt`, `titulo`, `ancho`, `alto`, `bytes`.

Útil para buscar por alt/dimensiones antes de elegir una imagen:

```bash
jq -r '.[] | select(.categoria=="equipo") | "\(.archivo)  \(.ancho)x\(.alto)  \(.alt)"' manifest.json
```

## Uso en Astro

Al estar bajo `src/`, se optimizan con `astro:assets` y solo se compila lo que se importa:

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/sonris/tratamientos/Ortodoncia-Invisible-Hero.webp';
---
<Image src={hero} alt="Ortodoncia invisible" />
```

Para servirlos sin procesar (p. ej. iconos SVG inline o el logo), muévelos a `public/`.

## Reproducir la descarga

```bash
curl -s 'https://sonris.es/wp-json/wp/v2/media?per_page=100&page=N'
```

La clasificación es por patrón de nombre de archivo (ver `manifest.json` para el origen exacto de cada uno); lo que no encaja en ninguna regla cae en `blog/`.
