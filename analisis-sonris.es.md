# Análisis del sitio web sonris.es

> Análisis realizado el 2026-07-23 mediante inspección en vivo del sitio (HTML renderizado + hojas de estilo CSS reales). Sonris es una clínica dental especializada en **ortodoncia invisible**, ubicada en Sanchinarro, Madrid. Titular legal: **MASTER SMILE S.L.** (CIF B88526173).

## 1. Stack técnico

- **CMS:** WordPress
- **Page builder:** Elementor + Elementor Pro
- **Tema:** Astra
- **Plugins relevantes:** All in One SEO (AIOSEO), Complianz GDPR (gestor de cookies), Jet Tabs, Swiper
- **Tour virtual:** Matterport (`https://my.matterport.com/show/?m=tmYDb9otn5k`)
- **Reseñas:** Widget Trustindex / Google Reviews

## 2. Paleta de colores (extraída del CSS real, no inferida)

El sitio **no personalizó los "Global Colors" de Elementor** (esos siguen en los valores de fábrica `#6EC1E4` / `#54595F` / `#61CE70` / `#7A7A7A` y apenas se usan). El color de marca real se aplica **hardcodeado por elemento**. Frecuencias contadas sobre las hojas de estilo que generan el header/footer global y el home:

| Color | Hex | Uso observado |
|---|---|---|
| 🟠 Naranja/ámbar (marca) | `#EB6B0A` | Color principal de marca: encabezados, botones, iconos, subtítulos destacados. Es el color más repetido con diferencia en todo el sitio. |
| ⚪ Blanco | `#FFFFFF` | Fondo principal de la mayoría de secciones. |
| ⚫ Negro | `#000000` | Texto de cuerpo principal. |
| Gris muy claro | `#F7F7F7`, `#EFEFEF` | Fondos de secciones alternas (efecto "zebra" entre bloques). |
| Durazno/crema claro | `#FEE1CB`, `#EDB992`, `#FFBC7D` | Acentos suaves, fondos de tarjetas/badges relacionados con el naranja de marca. |
| Gris medio | `#A1A1A1` | Texto secundario / subtítulos. |
| Dorado/beige (uso puntual) | `#D3B574` | Aparece en una plantilla específica de Elementor (post-207), uso más acotado. |
| Azul marino oscuro (uso puntual) | `#16163F` | Mismo caso, aparición puntual en una plantilla específica. |

**Resumen visual:** sitio de fondo predominantemente **blanco**, texto **negro/gris oscuro**, con un **naranja ámbar (#EB6B0A)** como color de marca para CTAs, títulos destacados e iconografía — es el color que da identidad al sitio.

## 3. Mapa de rutas (ruteo)

| Ruta | Tipo | Título de página |
|---|---|---|
| `/` | Home | Sonris \| Ortodoncia Invisible en Madrid |
| `/ortodoncia-invisalign/` | Tratamiento principal | Ortodoncia Invisalign en Madrid |
| `/como-ponerse-el-alineador/` | Informativa | ¿Cómo ponerse el alineador? |
| `/tratamientos/` | Índice de tratamientos | Tratamientos |
| `/cirugia-ortognatica/` | Tratamiento | Cirugía Ortognática |
| `/endodoncia-2/` | Tratamiento | Endodoncia |
| `/estetica-dental-2/` | Tratamiento | Estética Dental |
| `/blanqueamiento-dental/` | Sub-tratamiento (de Estética) | Blanqueamiento dental |
| `/carillas-dentales/` | Sub-tratamiento (de Estética) | Carillas Dentales |
| `/implantes-dentales/` | Tratamiento | Implantes Dentales |
| `/odontologia-general-2/` | Tratamiento | Odontología General |
| `/cirugia-oral/` | Tratamiento | Cirugía Oral |
| `/periodoncia/` | Tratamiento | Periodoncia |
| `/indicaciones-post-tratamiento/` | Informativa | Indicaciones Post Tratamiento |
| `/centro-ortodoncia-invisible-madrid/` | Institucional | Centro Especializado en Ortodoncia Invisible en Madrid ("Sonris") |
| `/identifica-tu-caso/` | Informativa/comercial | Identifica tu caso |
| `/ventajas-ortodoncia-invisible/` | Informativa/comercial | Ventajas de la Ortodoncia Invisible |
| `/equipo/` | Institucional | Equipo |
| `/primera-consulta-gratuita/` | Comercial (landing) | 1ª Consulta Gratuita |
| `/tecnologia/` | Institucional | Tecnología |
| `/financiacion-ortodoncia-invisible-madrid/` | Comercial | Financiación |
| `/contacto-sonris/` | Contacto | Contacto |
| `/blog/` (+ `/blog/page/2/`, paginado) | Blog (índice) | Blog |
| `/aviso-legal/` | Legal | Aviso Legal |
| `/politica-de-privacidad/` | Legal | Política de privacidad |
| `/politica-de-cookies/` | Legal | Política de Cookies |
| *(externo)* `my.matterport.com/show/?m=tmYDb9otn5k` | Tour virtual 3D | — |

**Artículos de blog detectados** (URLs propias, fuera del menú principal):
- `/mitos-y-verdades-sobre-las-carillas-dentales-todo-lo-que-debes-saber/`
- `/que-es-la-cirugia-ortognatica-y-cuando-es-necesaria/`
- `/implantes-dentales-beneficios-procedimiento-y-cuidados-esenciales/`
- `/ortodoncia-invisible-en-madrid-soluciones-esteticas-y-eficaces/`
- `/ortodoncia-invisible-vs-brackets-tradicionales-cual-elegir/`
- `/cepillo-dientes-electrico-manual-cual-mejor/`
- `/dientes-montados-maloclusion-dental/`
- `/tipos-carillas-dentales/`
- `/que-es-lengua-geografica/`
- `/ortodoncia-para-adultos-hasta-que-edad-puedo-llevarla/`
- `/como-evitar-sarro-dental/`
- `/stripping-dental-ortodoncia-que-es-para-que-utilizamos/`

**Inconsistencia detectada:** en algunas páginas el footer enlaza a `/politica-privacidad/` (sin "de") en lugar de `/politica-de-privacidad/` — variante de URL que probablemente redirige o es un enlace roto según configuración de WordPress.

## 4. Navegación global (idéntica en las ~25 páginas)

**Menú principal (header):** Inicio · Ortodoncia Invisible · ¿Cómo ponerse el alineador? · Tratamientos (con submenú a los 8 tratamientos) · Sonris (centro) · Tour Virtual (Matterport, externo) · Identifica tu caso · Ventajas · Equipo · 1ª Visita · Tecnología · Financiación · Contacto · Blog.

**Footer (en todas las páginas):**
- Logo + zonas de cobertura (Sanchinarro, Las Tablas, La Moraleja, Valdebebas, y listas SEO locales de barrios: Alcobendas, San Sebastián de los Reyes, Majadahonda, Las Rozas, Torrelodones, Hortaleza, etc.)
- Enlaces rápidos a servicios
- Datos de contacto
- Redes sociales
- Certificaciones: SEDO, ISO, EAS (logos)
- Enlaces legales: Aviso Legal, Política de Privacidad, Política de Cookies
- Gestor de consentimiento de cookies (Complianz): categorías Funcional, Preferencias, Estadísticas, Marketing — enlaza a `cookiedatabase.org/tcf/purposes/`

**Contacto directo (repetido en header/footer/widget flotante en todas las páginas):**
- Teléfono: `910 459 517` (`tel:+34910459517`)
- WhatsApp: `658 746 117` (`https://wa.me/34658746117`)
- Email: `hola@sonris.es`
- Dirección: Avenida Isabel de Valois 55, Madrid 28050 (Hortaleza) — `https://maps.app.goo.gl/ef8K7XG9W2qR1zJY7`
- Horario: Lunes a Viernes, 12:00h a 20:00h

**Redes sociales (idénticas en todas las páginas):**
- Instagram: `instagram.com/sonris.spain`
- LinkedIn: `linkedin.com/company/centro-sonris/`
- Facebook: `facebook.com/Sonris.spain`
- Twitter/X: `twitter.com/sonris_spain`
- TikTok: `tiktok.com/@Clinicasonris`
- YouTube: `youtube.com/@clinicasonris`

**CTAs recurrentes en el cuerpo de casi todas las páginas:**
- Formulario "Primera Visita Gratuita" (Nombre, Teléfono, Email + checkbox RGPD)
- Formulario "Contacta con nosotros" (Nombre, Teléfono, Email, Mensaje)
- Bloque "Financia tu tratamiento" → `/financiacion-ortodoncia-invisible-madrid/`
- Grid "Nuestros tratamientos" (8 tarjetas: Ortodoncia Invisible, Estética Dental, Implantes Dentales, Cirugía Oral, Cirugía Ortognática, Endodoncia, Periodoncia, Odontología General)
- Botón "Llámanos" (`tel:+34910459517`) y "Encuéntranos" (Google Maps)

## 5. Detalle por ruta/página

### `/` (Home)
- **Secciones:** Hero con formulario "Estudio de Ortodoncia GRATUITO" → Propuesta de valor (profesionales, resultados garantizados, tecnología) → 5 tipos de tratamiento (Lite/Moderado/Integral/Alpha/GS) → Ventajas diferenciadoras (Simulación Virtual con iTero, Dental Monitoring, Acelerador -40% tiempo) → Primera Visita en 4 pasos → 8 tratamientos complementarios → Blog (3 artículos) → Footer.
- **Imágenes clave:** `Logo.webp`, `Sonris-FULL.svg`, iconos SVG de ventajas (`fi_users.svg`, `fi_check-circle.svg`, `fi_cast.svg`), sellos de sistema (`Invisalign-Lite.svg`, `In.-Comprehensive.svg`), `Financiacion.png`, `Dental-Monitoring.webp`, `Gallery-5.webp`, 3 miniaturas de blog, logos de certificación (SEDO, ISO, EAS).
- **Enlaces salientes:** todo el menú + Matterport (tour virtual externo) + los 3 posts de blog + redes sociales.

### `/ortodoncia-invisalign/`
- **Secciones:** Hero "Sonríe sin preocuparte de nada" → Qué es la ortodoncia invisible → 8 ventajas → 5 planes de tratamiento (Lite/Moderado/Integral/Alpha/GS) → Presentación del centro → Marcas trabajadas (Invisalign, Smartee, AngelAligner, Spark) → Primera visita gratuita → Cómo funciona (5 pasos) → Invisalign First (niños) / Invisalign Teen → FAQ (8 preguntas) → Grid tratamientos → Contacto → Footer.
- **Imágenes:** `Ortodoncia-Invisible-1.webp`, `Grupo-2129-3.jpg`, logos de marcas de alineadores (Invisalign, Smartee, AngelAligner, Spark), iconos de tratamientos complementarios.
- **Enlaces propios:** descargables/landing de Invisalign First e Invisalign Teen; ancla `#formulario`.

### `/como-ponerse-el-alineador/`
- **Secciones:** Header + H1 "¿Cómo ponerse el alineador?" con guía instructiva (el detalle paso a paso no se pudo extraer del render en texto). Footer estándar.
- **Imágenes:** las genéricas de header/footer (Logo, iconos de contacto Email/Phone/WhatsApp/Location, certificaciones).

### `/tratamientos/`
- **Secciones:** Hero "Tu Clínica Dental en Sanchinarro" → Galería de 8 tarjetas de tratamiento → Primera visita gratuita → Financiación → Contacto → "Nuestros pacientes opinan" (Trustindex) → Blog (3 artículos) → Footer.
- **Imágenes:** miniaturas propias de cada tratamiento (`Implantes-dentales-img.webp`, `Cirugia-Oral-img.webp`, `Peridonicia-3.webp`, etc.) + las 3 portadas de blog.

### `/cirugia-ortognatica/`
- **Secciones:** Hero "Mejora la armonía y la estética de tu rostro" → Qué es → 7 problemas corregidos (retrognatia, prognatismo, mentón, apnea del sueño, asimetrías, sonrisa gingival, mordida abierta) → 11 beneficios → Cirugías maxilares/bimaxilares → Formularios → Grid tratamientos → Footer.
- **Imágenes:** secuencia `Cirugia-Ortognatica-2.webp` a `-9.webp`, `MORIDA-ABIERTA.jpg`.

### `/endodoncia-2/`
- **Secciones:** Hero "Evita la extracción" → Qué es → Tipos (unirradicular/birradicular/multirradicular) → 8 beneficios → Formularios → Financiación → Grid tratamientos → FAQ (enlace) → Contacto → Footer.
- **Imágenes:** `Endodoncia-1.webp`, `Endodoncia-2.webp`, `Endodoncia-3.webp`.

### `/estetica-dental-2/`
- **Secciones:** Hero "Disfruta de la sonrisa que siempre has deseado" → Qué es la estética dental → 2 sub-tratamientos con enlace "Más info" (Blanqueamiento y Carillas) → 7 beneficios → Formularios → Grid tratamientos → Footer.
- **Imágenes:** `Estetica-Dental-1.webp` a `-4.webp`.
- **Enlaces propios:** `/blanqueamiento-dental/`, `/carillas-dentales/`.

### `/blanqueamiento-dental/`
- **Secciones:** Hero "Blanqueamiento dental en Sanchinarro" (causas de manchado: café, té, vino, tabaco) → Tecnología (lámpara Philips Zoom, "4 tonos más blancos en una sesión") → Qué es → Cómo mantenerlo → 7 beneficios → Formularios → Grid tratamientos → Footer.
- **Imágenes:** `blanqueamiento-dental-1.jpg`, `about-markting-agency-copia2/3.jpg`. Reutiliza (posible error de plantilla) imágenes de Periodoncia y Carillas.

### `/carillas-dentales/`
- **Secciones:** Hero "Sonríe sin complejos" → Qué son → Tipos (Composite vs. Porcelana) → 7 beneficios → Formularios → Grid tratamientos → Footer.
- **Imágenes:** `Carillas-Dentales-1.webp`, `Carillas-Dentales-2.webp`.

### `/implantes-dentales/`
- **Secciones:** Hero "Recupera tu sonrisa" → Qué son (titanio, osteointegración) → Técnicas (Carga Inmediata, All on Four) → 4 ventajas → Formularios → Grid tratamientos → FAQ → Footer.
- **Imágenes:** `Implantes-Dentales-1.webp` a `-4.webp`.

### `/odontologia-general-2/`
- **Secciones:** Hero "Tu sonrisa es nuestra prioridad" → Qué es → Técnicas (Empastes, Endodoncias) → 12+ beneficios → Formularios → Grid tratamientos → FAQ → Footer.
- **Imágenes:** `Odontologia-General-1.webp` a `-4.webp`.

### `/cirugia-oral/`
- **Secciones:** Hero "Mejora tu calidad de vida" → Qué es → Tipos (Injerto de encía, Frenectomía, Extracción muelas del juicio) → 5 beneficios → Formularios → Grid tratamientos → FAQ → Footer.
- **Imágenes:** `Cirugia-Oral-1.webp`, `-2.webp`, `-4.webp`, `-5.webp`.

### `/periodoncia/`
- **Secciones:** Hero "Siempre cuidando de tus encías" → Qué es → Enfermedades (Gingivitis reversible / Periodontitis-piorrea) → 11 beneficios → Formularios → Grid tratamientos → Footer.
- **Imágenes:** `Peridonicia-1.webp` a `-3.webp` *(nota: typo real "Peridonicia" en los nombres de archivo del sitio, en vez de "Periodoncia")*.

### `/indicaciones-post-tratamiento/`
- **Secciones (única página con contenido de cuidados post-operatorios, con imágenes editoriales propias de 2025):** Post-Blanqueamiento (48h) → Post-Extracción (gasa 30-45min, evitar alcohol/tabaco 48-72h) → Post-Implantes (frío 6-12h, reposo 24-48h) → Post-Ortodoncia Invisible (22h/día, limpieza diaria) → Post-Limpieza Dental (24h de cuidados) → Formulario → Grid tratamientos → Footer.
- **Imágenes:** únicas del sitio con fecha 2025/05, específicas por tratamiento (`cuidados-despues-del-blanqueamiento-dental.jpg`, `impl-dentales-destcada.jpg`, `que-es-una-limpieza-dental-profunda.jpg`, etc.)

### `/centro-ortodoncia-invisible-madrid/` ("Sonris", página institucional del centro)
- **Secciones:** Hero "Centro Especializado en Ortodoncia Invisible en Madrid" (+25 años de trayectoria) → Tour virtual (Matterport) → Instalaciones → Ventajas de Sonris (Tecnología digital, Trato cercano, Trayectoria) → Centro ecológico → Testimonios de pacientes → Blog (3 posts).
- **Imágenes:** galería exclusiva `Gallery-1.webp` a `Gallery-6.webp`, sello `Diamond-Invisalign-Provider.webp`. Ninguna imagen de esta página tenía alt text.

### `/identifica-tu-caso/`, `/ventajas-ortodoncia-invisible/`, `/equipo/`, `/primera-consulta-gratuita/`, `/tecnologia/`, `/financiacion-ortodoncia-invisible-madrid/`
- Páginas satélite del embudo comercial de ortodoncia invisible; comparten la misma plantilla de header/footer/formularios/grid de tratamientos que el resto del sitio. Contenido específico centrado en: autoevaluación del caso del paciente, listado de ventajas de la ortodoncia invisible, presentación del equipo clínico, landing de primera consulta gratuita, apartado de tecnología (escáner iTero, Dental Monitoring) y condiciones/planes de financiación.

### `/contacto-sonris/`
- **Secciones:** Datos de contacto completos, horario (L-V 12:00-20:00h), enlace "Cómo llegar" a Google Maps (coordenadas ≈ 40.494262, -3.659298), formulario Nombre/Teléfono/Email/Mensaje + checkbox RGPD.
- Sin iframe de mapa embebido detectado, solo enlace saliente.

### `/blog/` (+ `/blog/page/2/`)
- **Secciones:** Listado de 12 artículos por página (título + imagen + "Continuar leyendo »") con paginación → Primera visita gratuita → Grid tratamientos → Contacto → Footer.
- **Imágenes:** una portada por artículo (ver lista de artículos en la sección 3).

### `/aviso-legal/`
- **Secciones:** Objeto y Aceptación, Identificación (MASTER SMILE S.L., CIF B88526173, registro mercantil), Condiciones de Acceso, Exclusión de Garantías, referencia a Política de Privacidad, Procedimiento ante Actividades Ilícitas, Publicaciones.
- Sin imágenes propias, solo las de header/footer.

### `/politica-de-privacidad/`
- **Secciones:** Introducción (RGPD UE 2016/679, LSSI-CE 34/2002), Responsable, Delegado de Protección de Datos, Finalidad del tratamiento, Plazo de conservación (máx. 5 años), Legitimación, Destinatarios, Derechos del usuario (incluye reclamación ante AEPD), Seguridad y cookies.
- ⚠️ **Hallazgo:** la sección "Delegado de protección de datos" contiene un **placeholder de plantilla sin rellenar**: *"NOMBRE DE LA EMPRESA QUE AYUDO..."* — parece contenido de plantilla legal genérica no personalizado.

### `/politica-de-cookies/`
- **Secciones:** Explicación de tecnologías de cookies, 4 categorías de consentimiento (Funcional, Preferencias, Estadísticas, Marketing), botones Aceptar/Denegar/Ver preferencias/Guardar preferencias, enlace a `cookiedatabase.org/tcf/purposes/`.

## 6. Imágenes — patrones generales

- Todas las imágenes se sirven desde `https://sonris.es/wp-content/uploads/AAAA/MM/` (WordPress nativo, sin CDN externo detectado).
- Formatos: `.webp` predominante (imágenes de servicio/marca), `.jpg` para fotos editoriales de blog/post-tratamiento, `.svg` para iconografía (contacto, ventajas, marcas de alineadores).
- **Alt text inconsistente:** muchas imágenes decorativas o de icono no tienen `alt`. Dos imágenes recurrentes (`logo-150.webp` y `Contact-1024x682.webp`) usan como `alt` **listados de barrios de Madrid** (ej. "majadahonda, las rozas, torrelodones, hortaleza...") en lugar de una descripción de la imagen — es relleno de SEO local, no accesibilidad real.
- **Reutilización cruzada entre páginas de tratamiento:** por ejemplo, `/blanqueamiento-dental/` incluye imágenes de Periodoncia y Carillas que no corresponden temáticamente — indicio de bloques de plantilla compartidos sin curar por página.
- Certificaciones (`SEDO.webp`, `ISO.webp`, `EAS.webp`) aparecen en el footer de absolutamente todas las páginas.

## 7. Hallazgos / inconsistencias a revisar

1. **Placeholder sin completar** en `/politica-de-privacidad/` (sección DPO).
2. **Doble ruta de política de privacidad**: `/politica-privacidad/` (sin "de") aparece enlazada en algunos footers junto a la ruta canónica `/politica-de-privacidad/`.
3. **Typo consistente en nombres de archivo:** "Peridonicia" en vez de "Periodoncia" (reutilizado incluso en páginas ajenas al tratamiento).
4. **Alt text SEO-relleno** con listas de barrios en vez de descripciones reales de imagen (impacto en accesibilidad).
5. Ninguna meta description fue detectable en el `<head>` de las páginas analizadas — a confirmar con inspección directa de código fuente, ya que podría deberse a cómo AIOSEO las inyecta.
6. `/como-ponerse-el-alineador/` no reveló el contenido específico del tutorial de colocación (posible carga dinámica no capturada).

---
*Metodología: fetch en vivo del HTML renderizado de cada ruta + descarga directa de las hojas de estilo CSS generadas por Elementor (`wp-content/uploads/elementor/css/post-*.css`) para extraer los colores hexadecimales reales en uso, evitando inferencias no verificadas.*
