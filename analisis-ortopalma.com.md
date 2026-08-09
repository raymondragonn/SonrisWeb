# Análisis del sitio web ortopalma.com

> Análisis realizado el 2026-07-23 mediante inspección en vivo del sitio (HTML renderizado + hojas de estilo CSS reales). Ortopalma es la Clínica Dental Susana Palma, en Ciudad Real, España. Titular legal: **SUSANA PALMA ORTODONCIA, S.L.** (NIF B13467626).

## ⚠️ Hallazgo de seguridad prioritario

Durante el análisis de `/blog-dental-ciudad-real/` se detectaron **dos entradas de blog publicadas en el WordPress del sitio que no tienen ninguna relación con odontología**:

| Título | URL | Verificado |
|---|---|---|
| "Myth: Desktop AI is Just a Browser Tab — Why Downloading Claude for macOS or Windows Changes the Game" | `https://ortopalma.com/myth-desktop-ai-is-just-a-browser-tab-why-downloading-claude-for-macos-or-windows-changes-the-game/` | HTTP 200, `<title>` confirmado en vivo |
| "Mit: „Logowanie do BGK24 jest jak w zwykłym banku" — Rzeczywistość i wybory dla firm" (en polaco, sobre banca) | `https://ortopalma.com/mit-logowanie-do-bgk24-jest-jak-w-zwyklym-banku-rzeczywistosc-i-wybory-dla-firm/` | HTTP 200 |

Confirmé con `curl` que ambas URLs devuelven código **200** y un `<title>` real generado por WordPress (no es un falso positivo del extractor). Esto es un patrón clásico de **inyección de contenido SEO parásito ("spam SEO injection")**: un atacante que comprometió el WordPress (vía plugin/tema vulnerable, credenciales débiles, etc.) publica posts sobre temas totalmente ajenos al negocio (IA, banca, casinos, réplicas, etc.) para aprovechar la autoridad de dominio del sitio legítimo y posicionar esas páginas en buscadores.

**Recomendación:** el propietario del sitio debería auditar cuanto antes el panel de WordPress (usuarios administradores, plugins/temas desactualizados, integridad de archivos) y eliminar/desindexar estas entradas. No he intentado explotar ni profundizar más allá de confirmar su existencia.

## 1. Stack técnico

- **CMS:** WordPress
- **Page builder:** Elementor + Elementor Pro + Royal Elementor Addons
- **Tema:** Astra + child theme "Orto Palma" (sin overrides de color propios detectados)
- **Plugins relevantes:** Max Mega Menu, Widget Google Reviews, Sticky Header Effects for Elementor
- **Sistema de citas:** externo, `beta.gestiondeclinica.es` (software de gestión de clínica de terceros)
- **Sitio hermano/formación:** `https://susanapalma.com` (enlazado desde el menú "Formación")

## 2. Paleta de colores (extraída del CSS real)

A diferencia de un sitio con color de marca vibrante, ortopalma.com usa una paleta **mayormente monocromática (negro/gris/blanco)**, coherente con el logo en negro sobre fondo blanco:

| Color | Hex | Uso observado |
|---|---|---|
| ⚫ Negro grisáceo (acento global) | `#191C1F` | Definido como `--e-global-color-accent` de Elementor; reemplaza el naranja por defecto — es el color de texto/acento dominante del sitio. |
| ⚪ Blanco | `#FFFFFF` | Fondo principal en todas las secciones. |
| Gris oscuro | `#333333`, `#505A63` | Texto de cuerpo y encabezados secundarios. |
| Gris medio | `#8D969E`, `#BDC3C9`, `#7A7A7A`, `#54595F` | Texto secundario, bordes, subtítulos (algunos son valores de fábrica de Elementor sin personalizar). |
| Gris claro | `#DDDDDD`, `#E8E8E8`, `#F1F1F1` | Separadores, fondos de tarjetas/bloques alternos. |
| 🔵 Azul | `#109CDE` | Detectado en el CSS del menú principal (Max Mega Menu) — probable color de hover/estado activo en la navegación. |
| 🟢 Verde | `#31AA1A` | Uso puntual en un icono (post ID 2720) — probablemente vinculado a WhatsApp o a un icono de confirmación/check. |

**Resumen visual:** identidad muy neutra — blanco, negro y escala de grises — con toques puntuales de azul (menú) y verde (icono de contacto/WhatsApp). No hay un color de marca dominante y vibrante como en otros sitios del sector (p. ej. el naranja de sonris.es).

## 3. Mapa de rutas (ruteo)

| Ruta | Tipo | Título de página |
|---|---|---|
| `/` | Home | Clínica Dental en Ciudad Real \| Ortopalma |
| `/tratamientos-dentales-ciudad-real/` | Índice de tratamientos | Tratamientos dentales en Ciudad Real \| Clínica Susana Palma |
| `/tratamientos-dentales-ciudad-real/ortodoncia-ciudad-real/` | Tratamiento | Ortodoncia en Ciudad Real |
| `/tratamientos-dentales-ciudad-real/ortodoncia-ciudad-real/ortodoncia-invisible-ciudad-real/` | Sub-tratamiento | Ortodoncia invisible en Ciudad Real |
| `/tratamientos-dentales-ciudad-real/estetica-dental-ciudad-real/` | Tratamiento | Estética dental en Ciudad Real |
| `/tratamientos-dentales-ciudad-real/implantes-dentales-ciudad-real/` | Tratamiento | Implantes dentales en Ciudad Real |
| `/tratamientos-dentales-ciudad-real/cirugia-oral-ciudad-real/` | Tratamiento | Cirugía oral en Ciudad Real |
| `/dentista-infantil-ciudad-real/ortodoncia-infantil-ciudad-real/` | Tratamiento infantil | Ortodoncia infantil en Ciudad Real |
| `/centro-medico-dental-en-ciudad-real/` | Institucional | Centro médico dental integral en Ciudad Real |
| `/opiniones-pacientes/` | Testimonios | Opiniones de pacientes (título no confirmado literal) |
| `/equipo-medico-dental-ciudad-real/` | Institucional | Equipo Médico Ortopalma |
| `/blog-dental-ciudad-real/` (+ `/page/2/`) | Blog | Blog dental Ciudad Real |
| `/aviso-legal` | Legal | Aviso Legal - Ortopalma |
| `/politica-de-cookies` | Legal | Política de Cookies - Ortopalma |
| *(externo)* `susanapalma.com` | Sitio hermano (formación) | — |
| *(externo)* `beta.gestiondeclinica.es/...` | Sistema de citas online | — |

**Subtratamientos mencionados en el menú/contenido pero sin verificación individual de su HTML** (detectados como enlaces salientes desde las páginas de tratamiento): ortodoncia lingual, brackets autoligado, brackets a medida, ortodoncia acelerada, rehabilitación masticatoria-respiratoria, rehabilitación neuro-oclusal (RNO), apnea del sueño, bruxismo/ATM, carillas dentales, carillas lumineers, blanqueamiento dental, sensibilidad dental, periodoncia, odontología general, endodoncia.

**Artículos de blog detectados:**
- `/masticar-sin-una-muela/`
- `/perdida-hueso-dental/`
- `/dolor-al-morder-causas/`
- `/dientes-torcidos-adultos/`
- `/10-trucos-para-el-uso-diario-de-alineadores-invisalign/`
- `/consejos-para-tu-ortodoncia-invisible/`
- `/todo-lo-que-debes-de-saber-sobre-implantes-dentales/`
- ⚠️ 2 artículos de spam ajenos al tema (ver sección de hallazgo de seguridad arriba)

## 4. Navegación global (idéntica en todas las páginas)

**Menú principal:** Tratamientos (mega menú desplegable) · Ortodoncia · Ortodoncia Invisible · Estética dental · Implantes Dentales · Cirugía · Centro de atención infantil · Centro médico · Testimonios · Equipo profesional · Formación (externo → `susanapalma.com`) · Blog. Botón CTA fijo "Pedir Cita".

**Footer:**
- Google Maps embebido/enlazado: `https://www.google.com/maps/place/Calle+Postas+10,+13001+Ciudad+Real,+España`
- Redes sociales: Instagram, Facebook, YouTube
- WhatsApp: `https://wa.me/34667541476`
- Enlaces legales: `/aviso-legal`, `/politica-de-cookies`
- Logos de financiación europea: Next Generation UE, Plan de Recuperación (indica que el negocio recibió fondos europeos)

**Contacto directo (repetido en todas las páginas):**
- Teléfono: `926 21 24 20` (`tel:926212420`)
- WhatsApp: `+34 667 541 476`
- Dirección: Calle Postas, 10, 13001 Ciudad Real, España
- Horario: Lunes a viernes, 10:00–20:30h

**CTA recurrente en el cuerpo de todas las páginas:**
- Botón "Pedir Cita" / "Cita Telefónica" → sistema externo `https://beta.gestiondeclinica.es/30/AreaPrivada/getapp.html?cif=CIFB-134676&idc=774f9974-bd4b-4c62-92fe-6bb96b473fd8` (no es un formulario propio del sitio, redirige a un software de gestión de clínicas de terceros)
- Bloque "Algunos de nuestros tratamientos" (Ortodoncia, Ortodoncia Invisible, Estética, Odontopediatría, RNO)
- CTA de cierre "¡No esperes más! 3…2…1… ¡Sonríe!"
- Widget de reseñas de Google (4.7★ / 656 reseñas)

## 5. Detalle por ruta/página

### `/` (Home)
- **Secciones:** Hero "Vamos a conseguir tu mejor sonrisa" → "Descubre el Poder de Tu Sonrisa" (tratamientos principales) → "Más de 20 años haciendo sonreír" → Presentación Dra. Susana Palma → Reserva de citas online → Testimonios → Centro de Atención Infantil → Centro médico (servicios de salud integral) → Equipo → Opiniones → Tratamientos destacados → Contacto/Footer.
- **Imágenes:** `logo_negro-1024x153.png`, miniaturas de tratamiento (`1-...jpg` a `6-...jpg` vía Elementor thumbs), `KIDS.png`, `logo-1-1024x153.png` (footer, versión blanca), `next-generation-ue-1.png`, `planrecuperacion-1.png`, `logo-fondo-negro.png`.

### `/tratamientos-dentales-ciudad-real/`
- **Secciones:** Hero "Nuestro enfoque multidisciplinar para tu sonrisa" → 6 tarjetas de servicio → Centro de Atención Infantil → Instalaciones (escáner intraoral 3D) → 6 razones para elegir Ortopalma → Google Reviews (10+ testimonios) → Solicitud de cita gratuita → Grid de tratamientos → CTA final → Footer.
- **Imágenes:** fotos de instalaciones (`Centro_Medico_5.jpg`, `Centro_Medico_2-1.jpg`), 9 fotos de perfil de reseñadores de Google con su nombre como alt.
- **Hallazgo:** contiene rutas legacy sin migrar (`/index.php/tratamientos/...`, `/clinica`, `/cirugia/`) — posible deuda técnica de una migración de URLs anterior.

### `/tratamientos-dentales-ciudad-real/ortodoncia-ciudad-real/`
- **Secciones:** Hero "Ortodoncia Exclusiva" → Introducción y proceso → 5 tipos de ortodoncia (Invisible, Brackets Autoligado, Brackets a Medida 3D, Lingual, Acelerada) → Tratamientos complementarios (RNO, ATM, Bruxismo, Apnea) → Equipo (Dra. Susana Palma, Dr. Víctor Guerrero, Dra. Emma Sentís, con nº de colegiado) → FAQ (duración 6-24 meses, financiación hasta 24 meses) → CTA → Grid tratamientos → Footer.
- **Imágenes:** `Susana-1024x683.jpg`, `Victor-683x1024.jpg`, `Emma-683x1024.jpg`.
- **Enlace anómalo:** referencia a una URL de estructura antigua (`tratamientos-dentales-en-ciudad-real/ortodoncia-en-ciudad-real-ortopalma/...`) — posible URL huérfana tras cambio de slugs.

### `/tratamientos-dentales-ciudad-real/ortodoncia-ciudad-real/ortodoncia-invisible-ciudad-real/`
- **Secciones:** Hero → Qué es → Ventajas (estética, comodidad, higiene, predicción digital 3D) → Cómo se realiza (estudio 3D → planificación → entrega alineadores → revisiones) → FAQ (duración 6-18 meses) → Por qué elegir la clínica → CTA "Solicita tu estudio" → Grid tratamientos → Footer.
- **Imágenes:** `1.-Susana-1024x915.png`, `2.-Susna-y-Helena-1024x683.jpg` (con alt descriptivo), `3.-Emma-1024x683.jpg`.

### `/tratamientos-dentales-ciudad-real/estetica-dental-ciudad-real/`
- **Secciones:** Hero → Introducción → Carillas Dentales (porcelana/composite) → Blanqueamiento Dental (LED, hasta 7 tonos) → Por qué elegir la clínica → Proceso en 4 pasos → Dra. Verónica De La Cruz (col. 13012046) → FAQ (duración hasta 10 años) → CTA → Grid tratamientos → Footer.
- **Imágenes:** `2-Vero-1024x683.jpg` (alt descriptivo), `Estetica_denTl_ciudad_real_1-...jpg`.
- **Hallazgo:** el mismo enlace legacy (`carillas-dentales-en-ciudad-real-porcelana-y-composite-ortopalma-v3/`) se usa tanto para "Carillas" como para "Blanqueamiento" — posible enlace mal etiquetado o duplicado.

### `/tratamientos-dentales-ciudad-real/implantes-dentales-ciudad-real/`
- **Secciones:** Hero → Qué es un implante → Ventajas y proceso → Materiales (titanio, TAC 3D) → "Recupera tu sonrisa en 3 pasos" → Carga inmediata → 6 beneficios → Dra. Laura Sainz (col. 28007414) → FAQ → Financiación (24 meses sin intereses) → CTA → Grid tratamientos → Footer.
- **Imágenes:** `cuadrado_1/2/3.jpg`, `Implantes-1_cuadrada.jpg`, `Implantes-2_cuadrada.jpg`, `Dra.-Laura-Sainz.jpg`.
- **Hallazgo:** anclas internas (`#implantes-dentales`, `#implantes-de-carga-inmediata`) apuntan sobre una URL legacy distinta de la canónica actual — indicio de contenido no actualizado tras la migración de slugs. También se detectó posible slug duplicado de periodoncia (`/periodoncia-ciudad-real/` vs `/periodoncia-en-ciudad-real-tratamiento-periodontitis/`).

### `/tratamientos-dentales-ciudad-real/cirugia-oral-ciudad-real/`
- **Secciones:** Hero → Introducción → Ventajas → Cómo se realiza → 4 tipos de cirugía (muelas del juicio, cirugía periodontal, quistes/tumores, elevación de seno maxilar) → Sedación consciente → Procedimiento y recuperación → FAQ → Dra. Laura Sainz → "+5.000 cirugías realizadas" → CTA → Grid tratamientos → Footer.
- **Imágenes:** `2-Laura-1024x683.jpg`, `2.-Salma-1-1024x683.jpg`, `3.-sala-1.jpg`, `Odontologia_3.jpg`.

### `/dentista-infantil-ciudad-real/ortodoncia-infantil-ciudad-real/`
- **Secciones (la más extensa del sitio):** Hero → Qué es → Edad de inicio (6 años; revisiones desde los 3) → Tipos según edad (preventiva/interceptiva/correctiva) → Aparatos (removibles, funcionales, brackets, Invisalign First) → Señales de alerta → Beneficios de tratamiento temprano → ¿Duele? → Cuidados → Precio y financiación → Por qué elegir Ortopalma (único Centro de Atención Infantil de Ciudad Real, instalaciones temáticas) → Diferencias ortodoncia infantil vs. adultos → FAQ → Casos de éxito → CTA → Grid tratamientos → Footer.
- **Imágenes:** única página con alt text descriptivo consistente, p. ej. `Ortodoncia-infantil-en-Ciudad-Real-para-ninos-en-Clinica-Dental-Susana-Palma.png`.

### `/centro-medico-dental-en-ciudad-real/`
- **Secciones:** Hero → Enfoque integral → Atención personalizada (Endocrino, Fisioterapia, Otorrino, Psicología, Logopedia) → Áreas de tratamiento → Equipo (Dra. Susana Palma) → Instalaciones y tecnología (TAC 3D, salas con sedación consciente) → Beneficios → Opiniones (Google Reviews 4.7★/656) → Contacto → Grid tratamientos → CTA → Footer.
- **Imágenes:** `Centro_Medico_1jpg.jpg`, `Centro_Medico_2.jpg`, 8 fotos de reseñadores de Google.

### `/opiniones-pacientes/`
- **Secciones:** Testimonios en vídeo de 7 pacientes (Belén Trujillo Navarro, Esther Muñoz Delgado, Fernando Torres Palomares, Javier Ramirez Moreno, Julia de la Calle Rodriguez, Lourdes Torroba Chicharro, Sara Feo Ortega) embebidos desde YouTube → Grid de tratamientos → CTA → Contacto → Footer.
- **Imágenes:** solo logos genéricos; sin miniaturas propias de los vídeos.

### `/equipo-medico-dental-ciudad-real/`
- **Secciones:** Listado de **13 profesionales** con foto, nombre, número de colegiado y botón individual "Pedir Cita": Francisco Llerena (Director Gerente), Dra. Susana Palma (Directora Médica, col. 5275), Dr. Desiderio Carrasco, Dra. Laura Sainz, Dra. Rocío Aguirre, Dr. Rubén Velasco, Dra. Verónica De La Cruz, Dr. Alejandro García-Bermejo de la Cruz, Dra. Liliana María Pacheco, Dr. Víctor Guerrero Alvarado, Dra. Sindy Li Zhu, Dr. Fernando Bariñaga, Dra. Salma Lamoun-Jebari.
- **Imágenes:** una foto individual por profesional; ninguna tiene alt text.

### `/blog-dental-ciudad-real/` (+ `/page/2/`)
- **Secciones:** Filtros por categoría ("Todas las entradas", "Principal", "Talleres") → listado de artículos con paginación → Grid tratamientos → Contacto → Footer.
- **Imágenes:** una portada por artículo (ver lista en sección 3).
- ⚠️ Contiene las 2 entradas de spam SEO descritas en la sección de hallazgo de seguridad.

### `/aviso-legal`
- **Secciones:** Datos identificativos (SUSANA PALMA ORTODONCIA S.L., NIF B13467626, dirección, teléfono) → Derechos de propiedad intelectual (email `dpd@ortopalma.com`) → Exención de responsabilidades (cookies, política de enlaces, IP/estadísticas) → Ley aplicable y jurisdicción (Juzgados de Ciudad Real) → Grid tratamientos → CTA → Footer.
- **Hallazgo:** también contiene rutas legacy adicionales (`/index.php/tratamientos/ortodoncia/`, `/tratamientos/`, `/clinica`, `/blog`).

### `/politica-de-cookies`
- **Secciones:** Qué son las cookies → Tipos utilizados (esenciales, análisis/Google Analytics, funcionalidad, publicidad, terceros) → Tabla de cookies (`_ga` 2 años, `_gid` 24h, `_gat` 1 min, `cookie_notice_accepted` 1 año) → Cómo gestionarlas (enlaces a guías oficiales de Chrome/Firefox/IE/Safari/Opera) → Contacto (`dpd@ortopalma.com`) → Grid tratamientos → Footer.

## 6. Imágenes — patrones generales

- Todas las imágenes se sirven desde `https://ortopalma.com/wp-content/uploads/AAAA/MM/` (WordPress nativo).
- Predominan `.jpg` para fotos de personas/instalaciones y `.png` para logos e imágenes con transparencia; Elementor genera además miniaturas optimizadas bajo `/wp-content/uploads/elementor/thumbs/`.
- **Alt text prácticamente ausente**: la gran mayoría de fotos (tratamientos, doctores, instalaciones, logos institucionales) no tienen atributo `alt`. Las únicas excepciones consistentes son las fotos de perfil de reseñas de Google (alt = nombre del reseñador) y un puñado de imágenes puntuales con alt descriptivo completo (p. ej. en la página de ortodoncia infantil e implantes). Esta es una brecha de accesibilidad/SEO transversal a casi todo el sitio — contrasta con sonris.es, que sí usa alt de forma más sistemática (aunque con relleno de SEO local).
- Logos de financiación europea (Next Generation UE, Plan de Recuperación) aparecen en el footer de todas las páginas, indicando que el negocio recibió fondos públicos de recuperación.

## 7. Hallazgos / inconsistencias a revisar

1. **🔴 Crítico — Spam SEO inyectado en el blog** (ver sección superior): 2 artículos ajenos al negocio, publicados y accesibles públicamente. Requiere auditoría de seguridad de WordPress cuanto antes.
2. **URLs legacy sin migrar**: múltiples páginas (implantes, cirugía, ortodoncia invisible, estética, tratamientos, aviso legal) enlazan internamente a rutas antiguas con el patrón `tratamientos-dentales-en-ciudad-real/...` (con "en") en vez de la estructura canónica actual `tratamientos-dentales-ciudad-real/...`, sobre todo en anclas (`#cirugia-periodontal`, `#implantes-de-carga-inmediata`, etc.) — indicio de que el sitio migró de estructura de URLs sin actualizar todos los enlaces internos.
3. **Posible slug duplicado**: `/periodoncia-ciudad-real/` vs. `/periodoncia-en-ciudad-real-tratamiento-periodontitis/`.
4. **Enlace mal etiquetado**: en la página de estética, tanto "Carillas" como "Blanqueamiento" apuntan al mismo URL legacy de carillas.
5. **Alt text ausente** en la gran mayoría de fotografías de tratamientos y del equipo médico.
6. **Meta description no detectable** en ninguna de las páginas analizadas (a confirmar con inspección directa del `<head>`, ya que podría deberse a la herramienta de extracción usada).
7. El CTA "Pedir Cita" depende enteramente de un **sistema externo de terceros** (`beta.gestiondeclinica.es`) en vez de un formulario propio del sitio — funcionalmente válido, pero es una dependencia externa a tener en cuenta.

---
*Metodología: fetch en vivo del HTML renderizado de cada ruta + descarga directa de las hojas de estilo CSS generadas por Elementor (`wp-content/uploads/elementor/css/post-*.css`) para extraer los colores hexadecimales reales en uso + verificación directa por `curl` de las URLs de blog anómalas detectadas.*
