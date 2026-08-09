# Plan de rediseño — arquitectura de información sonris.es

> Propuesta de nueva arquitectura minimalista, resultado de analizar la redundancia real de contenido en `sonris-contenido-completo.md` (26 rutas actuales → 13 rutas). Objetivo: navbar plano sin menús desplegables, cero bloques de contenido duplicados entre páginas, y una landing de autoridad propia para la Dra. Isabel Vélez.

## Navbar

```
Inicio · Ortodoncia Invisible · Tratamientos · Dra. Isabel Vélez · Sobre Nosotros · Contacto
```

6 ítems, ninguno con desplegable. "Tratamientos" es un clic a una página hub con tarjetas, no un submenú — las 7 páginas de tratamiento siguen existiendo como rutas independientes (necesarias para SEO por intención de búsqueda: "endodoncia Madrid", "implantes dentales Madrid", etc.) pero no cuelgan del navbar; se llega a ellas desde el hub, desde enlaces internos o desde el footer.

---

## Inicio

1. **Hero** — propuesta de valor + CTA primario (formulario único)
2. **Por qué Sonris** — 3 diferenciadores (especialización exclusiva en ortodoncia invisible, resultados garantizados, tecnología)
3. **Ortodoncia Invisible** (teaser corto, no repite los 5 planes) → CTA "Ver tratamiento completo"
4. **Tratamientos** (mini-grid de 3-4 tarjetas destacadas, no las 7) → CTA "Ver todos los tratamientos"
5. **Conoce a la Dra. Isabel Vélez** (foto + línea de autoridad: Diamond Provider, 25+ años) → CTA a su landing
6. **Testimonios** (Google Reviews)
7. **CTA final** de contacto

Sin blog ni financiación como bloques — se eliminaron del sitio por decisión explícita.

---

## Ortodoncia Invisible

1. **Hero** propio del tratamiento
2. **¿Qué es la ortodoncia invisible?** + ventajas generales
3. **Tipos de tratamiento** (SONRIS Lite / Moderado / Integral / Alpha / GS)
4. **Cómo funciona** (5 pasos — incluye embebido el vídeo que antes era la ruta `/como-ponerse-el-alineador/`)
5. **Tecnología del tratamiento** (iTero, Dental Monitoring, aceleradores Orthopulse/VPro5) — contenido específico del proceso Invisalign, no de la clínica en general
6. **Tu primera visita** (radiografías, fotos, escáner iTero, simulación virtual — absorbe la antigua ruta `/primera-consulta-gratuita/`)
7. **Preguntas frecuentes** (los 8 FAQ reales existentes; corregir la pregunta "¿Tiene coste extra perder un alineador?" que hoy no tiene respuesta)
8. **CTA final**

---

## Tratamientos — página hub

1. **Hero** corto
2. **Grid de 7 tarjetas** — cada una enlaza a su propia ruta (fuera del navbar):
   - Estética Dental
   - Implantes Dentales
   - Cirugía Ortognática
   - Endodoncia
   - Cirugía Oral
   - Periodoncia
   - Odontología General
3. **CTA** de contacto

### Apartados internos de cada ruta de tratamiento

| Ruta | Apartados internos |
|---|---|
| Estética Dental | Qué es → Blanqueamiento (pestaña) → Carillas (pestaña) → Beneficios → CTA |
| Implantes Dentales | Qué son → Técnicas (Carga Inmediata / All on Four) → Ventajas → CTA |
| Cirugía Ortognática | Qué es → Problemas que corrige (7 casos) → Beneficios → CTA |
| Endodoncia | Qué es → Tipos (uni/bi/multirradicular) → Beneficios → CTA |
| Cirugía Oral | Qué es → Tipos (injerto de encía / frenectomía / muelas del juicio) → Beneficios → CTA |
| Periodoncia | Qué es → Enfermedades (gingivitis / periodontitis) → Beneficios → CTA |
| Odontología General | Qué es → Técnicas (empastes / endodoncias) → Beneficios → CTA |

Blanqueamiento y Carillas dejan de ser rutas propias (`/blanqueamiento-dental/`, `/carillas-dentales/`) y pasan a ser pestañas/acordeón dentro de Estética Dental — su contenido actual es corto (qué es + beneficios, ~15-20 líneas) y no justifica una ruta independiente.

---

## Dra. Isabel Vélez — landing propia

Ruta plana `/dra-isabel-velez/` (no anidada bajo Sobre Nosotros ni Equipo), meta title/description propios optimizados a su nombre. Mismo header/footer/paleta que el resto del sitio (por eso sigue integrada), pero hero y CTA final con copy propio.

1. **Hero** (foto + "Directora Médica de Sonris" + línea de autoridad + CTA)
2. **Sobre la Dra. Vélez** — bio narrativa (contenido ya redactado en `/equipo/`: licenciada en Odontología, dedicación exclusiva a la ortodoncia, Invisalign Diamond Provider por cantidad de casos exitosos)
3. **Formación académica** — timeline real: Universidad Popular Autónoma de Puebla (México) → Boston University, MSD Orthodontics (USA) → UNITEC México → homologación en España → Lingual Orthodontics, Universidad de Ferrara (Italia). Nº de colegiado 28007651.
4. **Especialización clínica** — enseña a otros ortodoncistas a tratar mordida cruzada, clase II/III, microtornillos y cirugía ortognática con alineadores (casos complejos, no solo alineación estética simple)
5. **Reconocimientos y certificaciones** — Invisalign Diamond Provider + certificaciones multi-marca (Invisalign, Spark, Suresmile, Ligthners, ClearX, Accusmile, Genoiva, Clearcorrect, Air Nivol) + membresías (SEDO, EAS, IASAO)
6. **Formadora de especialistas** — imparte conferencias nacionales e internacionales a otros ortodoncistas; señal de autoridad reconocida por pares, no solo por pacientes
7. ⚠️ **Casos de éxito / antes-después** — **contenido pendiente de producir**, no existe hoy en el sitio
8. ⚠️ **Testimonios de sus pacientes** — **contenido pendiente de producir**; hoy el sitio solo tiene el widget genérico de Trustindex a nivel clínica, sin testimonios nombrados que la mencionen a ella
9. **FAQ específico** — "¿me atiende ella personalmente o un asociado?", "¿trata casos complejos / cirugía ortognática con alineadores?", "¿cómo pido cita directamente con la Dra. Vélez?"
10. **CTA final** — "Reserva tu valoración con la Dra. Isabel Vélez"

---

## Sobre Nosotros

1. **Hero** / presentación del centro (25 años, especialización exclusiva)
2. **Equipo médico** (resto del equipo — Dr. Hardy Luis Giunta, Paola Aranguren, Antonio Salazar Cabello, Dr. Benjamín Cabrera Galeano; Isabel Vélez aparece solo con tarjeta corta + enlace a su landing, sin repetir su bio completa)
3. **Instalaciones y tour virtual** (galería + Matterport)
4. **CTA final**

---

## Contacto

1. Datos de contacto (teléfono, WhatsApp, email, dirección, horario)
2. Mapa / cómo llegar
3. Formulario único (reemplaza los 2 formularios duplicados del sitio actual)
4. Redes sociales

---

## Footer (utilidad, fuera del navbar)

- Indicaciones post-tratamiento
- Aviso Legal
- Política de Privacidad
- Política de Cookies

---

## Mapa de redirecciones (rutas viejas → nuevas)

| Ruta actual | Nuevo destino |
|---|---|
| `/identifica-tu-caso/` | 410 o redirect a `/ortodoncia-invisalign/` (sin equivalente real — página vacía confirmada) |
| `/como-ponerse-el-alineador/` | `/ortodoncia-invisalign/#como-funciona` |
| `/tratamientos/` | Se convierte en la nueva página hub `/tratamientos/` |
| `/primera-consulta-gratuita/` | `/ortodoncia-invisalign/#primera-visita` |
| `/ventajas-ortodoncia-invisible/` | `/ortodoncia-invisalign/#tecnologia` |
| `/tecnologia/` | `/ortodoncia-invisalign/#tecnologia` |
| `/centro-ortodoncia-invisible-madrid/` | `/sobre-nosotros/` |
| `/equipo/` | `/sobre-nosotros/#equipo` (perfil de Isabel Vélez migra a `/dra-isabel-velez/`) |
| `/blanqueamiento-dental/` | `/tratamientos/estetica-dental/#blanqueamiento` |
| `/carillas-dentales/` | `/tratamientos/estetica-dental/#carillas` |
| `/blog/` + artículos | Eliminado del sitio (decisión explícita) — evaluar 301 a Inicio si hay backlinks con valor SEO |
| `/financiacion-ortodoncia-invisible-madrid/` | Eliminado del sitio (decisión explícita) — evaluar 301 a Contacto si hay backlinks con valor SEO |

Rutas que se mantienen 1:1: Implantes, Cirugía Ortognática, Endodoncia, Cirugía Oral, Periodoncia, Odontología General, Contacto, Indicaciones Post Tratamiento, Aviso Legal, Política de Privacidad, Política de Cookies.

---

## Resumen de reducción

- **26 rutas actuales → 13 rutas** (6 en navbar + 7 de tratamientos accesibles vía hub, sin contar legales/footer)
- **0 páginas con contenido 100% duplicado** entre sí (Home vs. Tratamientos, Ventajas vs. Tecnología, Centro vs. Equipo quedan resueltos)
- **1 formulario único** en vez de los 2 duplicados que aparecían en cada página del sitio actual
- **Bugs de contenido a corregir en la migración:** sección "¿Por qué somos un centro ecológico?" sin texto (antigua página Centro), FAQ sin respuesta en Ortodoncia Invisalign, `/politica-de-cookies/` vacía a nivel de HTML servido (depende de JS de Complianz)

---
*Basado en el análisis de contenido literal de `sonris-contenido-completo.md` y el mapa de colores/rutas de `analisis-sonris.es.md`, ambos en este mismo directorio.*
