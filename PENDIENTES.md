# Contenido pendiente

Listado de todos los avisos de encargo que estaban publicados dentro del sitio y
se han retirado del marcado. Son notas para el cliente, no contenido para el
paciente. Aquí quedan íntegras, con la ruta y el punto exacto donde volverá el
material cuando llegue.

Nada de esto se ha rellenado con texto plausible: donde faltaba material, se ha
retirado el hueco, no se ha inventado.

---

## 1. Bloques en recuadro punteado

### `/` — Home
> Ocho huecos en esta página, a la espera de material real: retrato del hero
> (paciente adulta, alta clave), valoración media de Google y número de reseñas
> con fecha, alcance real de la garantía o cambio de titular, lista del
> equipamiento de la clínica, cuatro fotos de los tratamientos destacados, widget
> de Google Reviews por API, tres reseñas reales con nombre y fecha, y mapa
> embebido con nota de aparcamiento.

Estaba al final de la sección `#doctora`.

### `/ortodoncia-invisalign/` — sección `#como-funciona`
Etiqueta: **Vídeo pendiente**
> Vídeo vertical de colocación del alineador y su póster. Hasta que llegue, el
> marco queda maquetado y sin reproductor.

Ocupaba el marco 9/16 de la tarjeta «Cómo ponerse el alineador». El marco sigue
ahí, con el marcador de imagen.

### `/tratamientos/` — final de la rejilla
> Siete huecos: una fotografía propia por tratamiento, sin reutilizar imágenes
> entre páginas.

### `/tratamientos/<slug>/` — las 7 rutas, sección `#que-es`
Etiqueta: **Contenido pendiente · texto clínico**
> Texto clínico definitivo de «qué es \<tratamiento\>», firmado y fechado por la
> Dra. Vélez, y fotografía propia de la ruta.

Se repetía en estética dental, implantes dentales, cirugía ortognática,
endodoncia, cirugía oral, periodoncia y odontología general.

### `/dra-isabel-velez/` — sección de reconocimientos
> Sello Diamond Provider vectorial y los nueve logos de marca en sus colores
> propios, además de los de SEDO, EAS e IASAO.

### `/sobre-nosotros/` — final de `#equipo`
> Cuatro retratos del equipo y sus cuatro trayectorias, foto de recepción para el
> hero, cuatro fotos de instalaciones, póster del tour Matterport y la decisión
> sobre el argumento «centro ecológico»: sin las medidas reales, se retira del
> sitio nuevo.

### `/contacto/` — tarjeta «En coche»
> Nota real de aparcamiento: plazas propias, zona SER y calles con hueco cerca.

### `/contacto/` — tarjeta «En transporte público»
> Líneas y paradas de transporte público con sus distancias reales a pie.

### `/aviso-legal/`, `/politica-de-privacidad/`, `/politica-de-cookies/`
El cuerpo de las tres páginas ya está redactado conforme a LSSI-CE 34/2002,
RGPD 2016/679, LOPDGDD 3/2018 y Ley 41/2002 (`src/data/legal.ts`). Falta que la
asesoría jurídica de MASTER SMILE S.L. lo revise y firme, y estos datos:

> **Datos registrales** (`SITE.registroMercantil`): Registro Mercantil de Madrid,
> tomo, folio y hoja. Mientras esté vacío, la línea no se imprime, y el art. 10
> LSSI exige publicarla.

> **Nº de registro sanitario del centro** (`SITE.registroSanitario`): código CS
> de la Comunidad de Madrid. Obligatorio en la publicidad sanitaria (RD
> 1907/1996) y hoy no aparece en ninguna página.

> **Delegado de Protección de Datos**: designarlo o declarar que no procede. Si
> se designa, hay que publicar su vía de contacto en la política de privacidad.

> **Banner de consentimiento de cookies**: el mapa de Google (`/contacto/`) y el
> tour de Matterport (`/sobre-nosotros/`) se cargan al abrir la página, sin pedir
> permiso previo. El art. 22.2 LSSI exige consentimiento **antes** de instalar
> cookies no necesarias. O se recupera la carga bajo botón, o se implanta un
> banner con rechazo tan accesible como la aceptación.

Las tres siguen con `noindex` y fuera del sitemap hasta la revisión jurídica.

### `/indicaciones-post-tratamiento/`
Ya no pertenece al bloque legal del pie: es página propia
(`src/pages/indicaciones-post-tratamiento/index.astro`) y se entra desde
`/tratamientos/`.

> Hacen falta las hojas de indicaciones reales que la clínica entrega hoy en mano,
> una por intervención (colocación de ataches, extracción, injerto de encía,
> blanqueamiento), firmadas por la Dra. Vélez y fechadas. No se redactan desde
> fuera: son instrucciones clínicas. Sigue con `noindex`.

### `/tratamientos/estetica-dental/` — pestañas
Un bloque por pestaña, dentro del panel:

**Blanqueamiento**
> Protocolo real de blanqueamiento de la clínica: técnica, número de sesiones y
> cuidados posteriores. Antes se ilustraba con fotos de periodoncia: hace falta
> fotografía propia.

**Carillas**
> Material, indicaciones y mantenimiento de las carillas, validados por la Dra.
> Vélez. Fotografía propia pendiente.

### `/dra-isabel-velez/` — comparador antes/después
> Seis casos antes/después con consentimiento firmado del paciente. Hasta que
> lleguen, el comparador funciona sobre la trama de marcador: ningún resultado
> clínico está representado aquí.

### `/ortodoncia-invisalign/` — sección `#faq`
Siete de las nueve preguntas se publicaban sin respuesta, con este aviso dentro
del acordeón. Las preguntas se han retirado; vuelven en cuanto haya respuesta
firmada:

| Pregunta | Aviso que llevaba |
| --- | --- |
| ¿Es doloroso el tratamiento? | Respuesta pendiente de redactar y firmar por la Dra. Vélez. |
| ¿Se puede fumar con los alineadores puestos? | ídem |
| ¿Se nota al hablar? | ídem |
| ¿Hay que llevar retenedores al acabar? | ídem |
| ¿Qué son los ataches? | ídem |
| ¿Cómo se limpian las férulas? | ídem |
| ¿Tiene coste extra perder un alineador? | Hace falta la política real de reposición de alineadores de la clínica: si se cobra, cuánto y en qué casos. Se publica sin respuesta a propósito, para que quede a la vista que falta. |

Las dos que sí tienen respuesta siguen publicadas: «¿Qué son los alineadores
invisibles?» y «¿Cuántas horas al día hay que llevarlos?».

---

## 2. Notas en prosa, sin recuadro

### `/dra-isabel-velez/` — aside junto al comparador
Titular «Qué falta aquí» y el texto:
> Seis casos antes/después con consentimiento firmado, testimonios nombrados que
> mencionen a la doctora y las tres respuestas de su FAQ.

Sustituido por un aside con la advertencia clínica real y el enlace al equipo.

### Las 4 páginas de utilidad — cierre del cuerpo
> Última revisión: pendiente de la fecha que fije la asesoría jurídica. Hasta
> entonces esta página no se indexa.

### `alt` de imagen que describían el encargo en vez de la foto

| Ruta | `alt` retirado | `alt` que lleva ahora |
| --- | --- | --- |
| `/` | Imagen pendiente: alineador transparente en la mano de la doctora, macro, luz de ventana | Alineador transparente de Sonris en la mano de la doctora |
| `/ortodoncia-invisalign/` | Imagen pendiente: ilustración del tratamiento con alineadores para niños y adolescentes | Tratamiento con alineadores para niños y adolescentes en Sonris |
| `/sobre-nosotros/` | Imagen pendiente: retrato de la Dra. Isabel Vélez, dirección médica | Dra. Isabel Vélez, directora médica de Sonris |
| `/sobre-nosotros/` | Imagen pendiente: retrato de \<nombre\> | \<nombre\>, \<puesto\> en Sonris |
| `/sobre-nosotros/` | Imagen pendiente: \<sala\> de la clínica Sonris | \<Sala\> de la clínica Sonris en Sanchinarro |

### `public/llms.txt` — advertencias al citar
> Varias secciones del sitio llevan bloques marcados «CONTENIDO PENDIENTE»: ese
> material todavía no existe y no debe inferirse ni completarse.

Retirada porque ya no hay tales bloques. Las otras tres advertencias (sin precios,
sin financiación, Diamond Provider no es garantía de resultado) siguen: esas sí
son ciertas del sitio.

---

## 3. Qué falta, en una lista

Por orden de bloqueo para publicar:

1. **Fotografía real.** Las 35 imágenes son marcadores de color liso en
   `public/img/`. Los `alt` definitivos ya están escritos en cada `<img>`.
2. **Revisión jurídica** de las tres páginas legales (el texto ya está escrito),
   datos registrales, nº de registro sanitario, designación de DPD o
   declaración de que no procede, y consentimiento previo de cookies.
3. **Respuestas 3 a 9 del FAQ** de ortodoncia invisible, firmadas y fechadas.
4. **Seis casos antes/después** con consentimiento firmado del paciente.
5. **Vídeo vertical** de colocación del alineador, con su póster.
6. **Texto clínico definitivo** de «qué es» en las 7 rutas de tratamiento.
7. **Protocolo de blanqueamiento** y ficha de carillas.
8. **Sello Diamond Provider** vectorial y los 12 logos de marca y membresía.
9. **Nota de aparcamiento** y líneas de transporte público con distancias.
10. **Imagen Open Graph** real: `public/og/sonris-og.png` es un marcador liso.
11. **Reseñas de Google**: la sección de la home ya está montada y se alimenta de
    la Places API en el build. Falta la **clave** `GOOGLE_PLACES_API_KEY` en `.env`;
    hasta entonces la sección no se pinta.
12. **Trayectorias** de los cuatro miembros del equipo.

## 4. Tres decisiones que no son nuestras

1. La palabra «garantizados» en la home. Sin un documento que diga qué cubre
   exactamente la garantía, la recomendación es «resultados planificados y
   visibles antes de empezar». **Ya aplicado**: el titular no la usa.
2. El argumento «centro ecológico»: con las medidas reales se le hace sitio en
   Sobre nosotros, o se retira. **Ya aplicado**: retirado.
3. Delegado de Protección de Datos: designarlo o declarar que no procede, antes
   de publicar la Política de Privacidad.
