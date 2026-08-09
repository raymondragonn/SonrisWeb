// Las tres páginas legales del pie: aviso legal (art. 10 LSSI-CE 34/2002),
// política de privacidad (RGPD 2016/679 + LOPDGDD 3/2018) y política de
// cookies (art. 22.2 LSSI). Escritas en lenguaje claro, como pide el art. 12
// RGPD: solo lo que la ley obliga a publicar, sin cita de artículo salvo
// cuando el dato en sí es la base jurídica. El texto lo pinta [legal].astro.
//
// Lo que falte por confirmar va en SITE (registro mercantil, nº de registro
// sanitario, DPD): si está vacío, la línea no se imprime. Ver PENDIENTES.md.

export type Bloque = { h: string; p?: string[]; ul?: string[] };

export type PaginaLegal = {
  slug: string;
  nombre: string;
  eyebrow: string;
  titulo: string;
  entradilla: string;
  subtitulo: string;
  /** Fecha de la versión publicada, en texto: el RGPD exige poder datarla. */
  actualizado: string;
  bloques: Bloque[];
};

const ACTUALIZADO = '9 de agosto de 2026';

export const LEGAL: PaginaLegal[] = [
  {
    slug: 'aviso-legal',
    nombre: 'Aviso legal',
    eyebrow: 'Información legal',
    titulo: 'Aviso legal',
    entradilla: 'Quién es el titular de este sitio, qué puedes hacer con sus contenidos y de qué respondemos.',
    subtitulo: 'Titularidad y condiciones de uso',
    actualizado: ACTUALIZADO,
    bloques: [
      {
        h: 'Qué es este sitio',
        p: [
          'Sonris es un centro sanitario privado de odontología y ortodoncia, con dirección médica y profesionales colegiados. Este sitio es su web informativa: no se venden productos ni servicios a través de él, solo puedes pedir cita o información.',
          'Al navegar por el sitio aceptas las condiciones de esta página en la versión publicada en cada momento.',
        ],
      },
      {
        h: 'Uso de los contenidos',
        p: [
          'Los textos, fotografías, marcas, diseño y código del sitio pertenecen al titular o a terceros que han autorizado su uso. Puedes leerlos y compartir enlaces, pero no copiarlos, distribuirlos ni modificarlos sin permiso escrito.',
          'Las marcas de terceros que se citan (iTero, Dental Monitoring y otras) pertenecen a sus titulares y aparecen solo a título informativo.',
        ],
      },
      {
        h: 'La información de salud no es un diagnóstico',
        p: [
          'Lo que explicamos sobre tratamientos es divulgativo y general. No sustituye a una consulta: cualquier decisión sobre tu caso necesita una valoración presencial previa.',
        ],
      },
      {
        h: 'De qué respondemos',
        p: [
          'Procuramos que el sitio esté disponible y que su contenido sea correcto, pero no podemos garantizar que no haya interrupciones o errores puntuales.',
          'El sitio muestra contenidos de terceros (el mapa de Google y el tour virtual de Matterport) y enlaza a nuestros perfiles en redes sociales. No controlamos esos servicios: se rigen por las condiciones de sus proveedores.',
        ],
      },
      {
        h: 'Ley aplicable',
        p: [
          'Estas condiciones se rigen por la ley española. Si eres consumidor, cualquier reclamación se resuelve en los tribunales de tu domicilio.',
          'Cómo tratamos tus datos se explica en la Política de privacidad, y las cookies del sitio en la Política de cookies.',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidad',
    nombre: 'Política de privacidad',
    eyebrow: 'Protección de datos',
    titulo: 'Política de privacidad',
    entradilla: 'Qué datos tuyos tratamos, para qué, cuánto tiempo los guardamos y cómo puedes controlarlos.',
    subtitulo: 'Tus datos y tus derechos',
    actualizado: ACTUALIZADO,
    bloques: [
      {
        h: 'Qué datos tratamos',
        ul: [
          'Los del formulario: tu nombre, tu teléfono o correo y lo que nos cuentes en el mensaje.',
          'Los de tu historia clínica, si te tratas con nosotros: motivo de consulta, pruebas, imágenes, plan de tratamiento y evolución.',
          'Los de facturación, cuando contratas un tratamiento.',
        ],
      },
      {
        h: 'El formulario no nos envía nada por sí solo',
        p: [
          'Al enviarlo, tu dispositivo abre WhatsApp o tu programa de correo con el mensaje ya escrito, y eres tú quien decide mandarlo. Hasta ese momento los datos no salen de tu equipo.',
          'Si eliges WhatsApp, el mensaje viaja por WhatsApp Ireland Limited (grupo Meta), que aplica su propia política de privacidad.',
        ],
      },
      {
        h: 'Para qué los usamos',
        ul: [
          'Atender tu solicitud y contactar contigo: porque tú nos lo pides.',
          'Tratarte y mantener tu historia clínica: porque es lo que exige la atención sanitaria y la ley que la regula (Ley 41/2002). Los datos de salud se tratan al amparo del art. 9.2.h del RGPD, que permite usarlos para diagnóstico y asistencia.',
          'Facturar y llevar la contabilidad: porque la ley nos obliga.',
          'Recordarte una cita o una revisión: porque forma parte de tu tratamiento.',
          'Enviarte información comercial: solo si nos das permiso, y puedes retirarlo cuando quieras.',
        ],
      },
      {
        h: 'Cuánto tiempo los guardamos',
        ul: [
          'Consultas que no acaban en cita: un año desde el último contacto.',
          'Historia clínica: cinco años desde el alta de cada tratamiento, como mínimo, porque así lo exige la Ley 41/2002.',
          'Facturas y contabilidad: entre cuatro y seis años, según la normativa fiscal y mercantil.',
          'Permiso para enviarte información comercial: hasta que lo retires.',
        ],
      },
      {
        h: 'Quién más los ve',
        p: [
          'No vendemos ni cedemos tus datos. Acceden a ellos solo los proveedores que necesitamos para trabajar —alojamiento y correo, software de gestión clínica, laboratorio protésico y asesoría—, todos con contrato de confidencialidad firmado.',
          'Además, comunicamos lo imprescindible a otros profesionales que intervengan en tu caso, a tu aseguradora si tienes póliza, y a la Administración o los tribunales cuando la ley lo exige.',
          'Los contenidos de Google y Matterport que muestra el sitio pueden implicar el envío de datos a Estados Unidos, amparado en la decisión de adecuación de la Comisión Europea de julio de 2023 o en cláusulas contractuales tipo.',
        ],
      },
      {
        h: 'Qué puedes hacer',
        p: [
          'Puedes pedirnos acceder a tus datos, corregirlos, borrarlos, limitar su uso, oponerte a él, llevártelos a otro sitio o retirar un permiso que nos hubieras dado.',
          'Escríbenos al correo o a la dirección de arriba, di qué quieres y adjunta copia de tu DNI. Te respondemos en un mes.',
          'Si crees que no lo hemos hecho bien, puedes reclamar ante la Agencia Española de Protección de Datos (C/ Jorge Juan 6, 28001 Madrid — www.aepd.es).',
        ],
      },
      {
        h: 'Menores y seguridad',
        p: [
          'Para tratar a un menor necesitamos el permiso de su padre, madre o tutor. Por debajo de catorce años, el menor no puede darlo por sí mismo.',
          'Protegemos tus datos con medidas técnicas y organizativas proporcionadas al riesgo, con especial cuidado en los de salud. Si esta política cambia, la versión válida es siempre la publicada aquí, con su fecha.',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-cookies',
    nombre: 'Política de cookies',
    eyebrow: 'Cookies',
    titulo: 'Política de cookies',
    entradilla: 'Qué guarda este sitio en tu dispositivo, quién lo guarda y cómo quitarlo.',
    subtitulo: 'Cookies en uso y consentimiento',
    actualizado: ACTUALIZADO,
    bloques: [
      {
        h: 'Este sitio no usa cookies propias',
        p: [
          'Una cookie es un pequeño archivo que una web guarda en tu dispositivo al visitarla. Este sitio es estático: no instala cookies propias, no mide tu navegación y no usa analítica ni píxeles de redes sociales.',
        ],
      },
      {
        h: 'Lo que sí cargan los contenidos de terceros',
        p: ['Dos páginas incluyen contenido alojado por otras empresas que, al mostrarse, puede guardar cookies en tu dispositivo:'],
        ul: [
          'El mapa de Google, en Contacto: cookies de preferencias y seguridad de Google, de hasta seis meses.',
          'El tour virtual de Matterport, en Sobre nosotros: cookies técnicas y de medición de la sesión.',
          'Las tipografías de Google, en todo el sitio: no guardan cookies, pero Google recibe la dirección IP de tu dispositivo para poder enviarlas.',
        ],
      },
      {
        h: 'Cómo quitarlas',
        p: [
          'Puedes bloquear o borrar estas cookies desde la configuración de tu navegador, en cualquier momento; la ayuda de Chrome, Firefox, Safari y Edge explica cómo.',
          'Bloquearlas no te impide navegar: solo hará que el mapa o el tour no se vean o funcionen a medias. Si esta política cambia, la versión válida es la publicada aquí, con su fecha.',
        ],
      },
    ],
  },
];

export const LEGAL_NAV = LEGAL.map((p) => ({ nombre: p.nombre, href: `/${p.slug}/` }));
