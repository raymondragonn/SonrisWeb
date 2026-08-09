// Tabla de redirecciones del rediseño (fuente: «Sonris - Cableado y redirecciones»).
// 33 reglas 301 + 1 regla 410. Solo la consume `npm run redirecciones`, que
// genera las reglas de deploy/ para el host: el build de Astro no crea páginas
// de redirección, las URLs desconocidas caen en /404/. La normalización de barra
// final y de www también se resuelve en el host.
export const REDIRECCIONES = [
  { de: '/como-ponerse-el-alineador/', a: '/ortodoncia-invisible/#como-funciona', codigo: 301 },
  { de: '/primera-consulta-gratuita/', a: '/ortodoncia-invisible/#primera-visita', codigo: 301 },
  { de: '/ventajas-ortodoncia-invisible/', a: '/ortodoncia-invisible/#tecnologia', codigo: 301 },
  { de: '/tecnologia/', a: '/ortodoncia-invisible/#tecnologia', codigo: 301 },
  { de: '/centro-ortodoncia-invisible-madrid/', a: '/sobre-nosotros/', codigo: 301 },
  { de: '/equipo/', a: '/sobre-nosotros/#equipo', codigo: 301 },
  { de: '/blanqueamiento-dental/', a: '/tratamientos/estetica-dental/#blanqueamiento', codigo: 301 },
  { de: '/carillas-dentales/', a: '/tratamientos/estetica-dental/#carillas', codigo: 301 },
  { de: '/estetica-dental-2/', a: '/tratamientos/estetica-dental/', codigo: 301 },
  { de: '/endodoncia-2/', a: '/tratamientos/endodoncia/', codigo: 301 },
  { de: '/odontologia-general-2/', a: '/tratamientos/odontologia-general/', codigo: 301 },
  { de: '/implantes-dentales/', a: '/tratamientos/implantes-dentales/', codigo: 301 },
  { de: '/cirugia-ortognatica/', a: '/tratamientos/cirugia-ortognatica/', codigo: 301 },
  { de: '/cirugia-oral/', a: '/tratamientos/cirugia-oral/', codigo: 301 },
  { de: '/periodoncia/', a: '/tratamientos/periodoncia/', codigo: 301 },
  { de: '/contacto-sonris/', a: '/contacto/', codigo: 301 },
  { de: '/politica-privacidad/', a: '/politica-de-privacidad/', codigo: 301 },
  { de: '/financiacion-ortodoncia-invisible-madrid/', a: '/contacto/', codigo: 301 },
  { de: '/blog/', a: '/', codigo: 301 },
  { de: '/blog/ortodoncia-invisible-precio/', a: '/contacto/', codigo: 301 },
  { de: '/blog/cuanto-dura-la-ortodoncia-invisible/', a: '/ortodoncia-invisible/#tipos', codigo: 301 },
  { de: '/blog/invisalign-o-brackets/', a: '/ortodoncia-invisible/#que-es', codigo: 301 },
  { de: '/blog/como-limpiar-los-alineadores/', a: '/ortodoncia-invisible/#faq', codigo: 301 },
  { de: '/blog/ortodoncia-invisible-en-adultos/', a: '/ortodoncia-invisible/', codigo: 301 },
  { de: '/blog/ortodoncia-invisible-para-ninos/', a: '/ortodoncia-invisible/#tipos', codigo: 301 },
  { de: '/blog/que-son-los-ataches/', a: '/ortodoncia-invisible/#faq', codigo: 301 },
  { de: '/blog/retenedores-despues-de-la-ortodoncia/', a: '/ortodoncia-invisible/#faq', codigo: 301 },
  { de: '/blog/escaner-itero-que-es/', a: '/ortodoncia-invisible/#tecnologia', codigo: 301 },
  { de: '/blog/dental-monitoring-como-funciona/', a: '/ortodoncia-invisible/#tecnologia', codigo: 301 },
  { de: '/blog/apinamiento-dental/', a: '/ortodoncia-invisible/#tipos', codigo: 301 },
  { de: '/blog/mordida-cruzada-tratamiento/', a: '/tratamientos/cirugia-ortognatica/', codigo: 301 },
  { de: '/blog/blanqueamiento-en-casa-o-en-clinica/', a: '/tratamientos/estetica-dental/#blanqueamiento', codigo: 301 },
  // Página vacía confirmada: se retira sin equivalente.
  { de: '/identifica-tu-caso/', a: null, codigo: 410 },
];
