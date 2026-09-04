// Los 7 tratamientos que cuelgan de /tratamientos/.
// Contenido literal de «Sonris - Tratamiento (plantilla)» y del hub.

export type Variante = { id: string; nombre: string; texto: string };
export type Pestana = Variante;

export type Tratamiento = {
  slug: string;
  nombre: string;
  claim: string; // línea corta del hub
  resumenHub: string;
  h1: string;
  entradilla: string;
  queEsTitulo: string;
  queEs1: string;
  queEs2: string;
  tiposEyebrow: string;
  tiposTitulo: string;
  tiposEntradilla: string;
  pestanas: Pestana[];
  variantes: Variante[];
  cruce: { titulo: string; texto: string; etiqueta: string; href: string };
  destacadoEnHome: boolean;
};

const CRUCE_POR_DEFECTO = {
  titulo: 'Nuestra especialidad sigue siendo otra',
  texto: 'Si lo que buscas es alinearte los dientes, empieza por aquí.',
  etiqueta: 'Ortodoncia invisible',
  href: '/ortodoncia-invisible/',
};

export const TRATAMIENTOS: Tratamiento[] = [
  {
    slug: 'estetica-dental',
    nombre: 'Estética dental',
    claim: 'Aporta armonía a tu sonrisa',
    resumenHub:
      'Cuando los dientes ya están en su sitio, trabajamos el color y la forma. Blanqueamiento y carillas, en una sola página.',
    h1: 'Aporta armonía a tu sonrisa',
    entradilla:
      'Cuando los dientes ya están en su sitio, trabajamos el color y la forma. Dos tratamientos, una sola página.',
    queEsTitulo: '¿Qué es la estética dental?',
    queEs1:
      'Es el conjunto de tratamientos que mejoran el aspecto de tus dientes sin cambiar su función: el color, la forma y las proporciones.',
    queEs2:
      'En Sonris la planteamos siempre después de la ortodoncia, no en su lugar: primero la posición, luego el acabado.',
    tiposEyebrow: 'Variantes',
    tiposTitulo: 'Blanqueamiento y carillas',
    tiposEntradilla:
      'Antes eran dos páginas distintas; su contenido es corto y funciona mejor junto. Cada uno conserva su enlace directo.',
    pestanas: [
      {
        id: 'blanqueamiento',
        nombre: 'Blanqueamiento',
        texto: 'Aclara el tono de tus dientes sin retirar estructura dental.',
      },
      {
        id: 'carillas',
        nombre: 'Carillas',
        texto:
          'Láminas finas que se adhieren a la cara visible del diente para corregir forma y color.',
      },
    ],
    variantes: [],
    cruce: {
      titulo: 'El color, después de la posición',
      texto: 'Blanqueamiento y carillas se plantean cuando los dientes ya están donde toca.',
      etiqueta: 'Ortodoncia invisible',
      href: '/ortodoncia-invisible/',
    },
    destacadoEnHome: true,
  },
  {
    slug: 'implantes-dentales',
    nombre: 'Implantes dentales',
    claim: 'Recupera tu sonrisa',
    resumenHub:
      'Reponemos el diente que falta con una raíz de titanio que el hueso integra, antes de mover el resto.',
    h1: 'Recupera tu sonrisa',
    entradilla:
      'Cuando falta un diente, lo reponemos con una raíz artificial que se integra en el hueso.',
    queEsTitulo: '¿Qué es un implante dental?',
    queEs1:
      'Es un tornillo de titanio que sustituye la raíz del diente perdido. El hueso lo integra por osteointegración y, sobre él, se coloca la corona.',
    queEs2:
      'Reponer el diente que falta suele ser el paso previo a mover el resto: sin él, los dientes vecinos se desplazan al hueco.',
    tiposEyebrow: 'Técnicas',
    tiposTitulo: 'Dos formas de trabajarlo',
    tiposEntradilla:
      'Cuál procede depende del hueso disponible y de tu caso; se decide con las pruebas delante.',
    pestanas: [],
    variantes: [
      {
        id: 'carga-inmediata',
        nombre: 'Carga inmediata',
        texto:
          'La corona provisional se coloca en la misma intervención que el implante, cuando las condiciones lo permiten.',
      },
      {
        id: 'all-on-four',
        nombre: 'All on Four',
        texto:
          'Cuatro implantes sostienen una arcada completa. Indicado cuando faltan todos o casi todos los dientes.',
      },
      {
        id: 'titanio',
        nombre: 'Titanio y osteointegración',
        texto:
          'El material es titanio, biocompatible. La osteointegración es el proceso por el que el hueso se une al implante.',
      },
    ],
    cruce: {
      titulo: 'Primero el hueco, luego el movimiento',
      texto: 'Reponer el diente que falta suele ser el paso previo al tratamiento con alineadores.',
      etiqueta: 'Ortodoncia invisible',
      href: '/ortodoncia-invisible/',
    },
    destacadoEnHome: true,
  },
  {
    slug: 'cirugia-ortognatica',
    nombre: 'Cirugía ortognática',
    claim: 'Corrige los huesos maxilofaciales',
    resumenHub:
      'Para cuando el problema no está solo en la posición de los dientes, sino en la relación entre los maxilares.',
    h1: 'Mejora la armonía y la estética de tu rostro',
    entradilla:
      'Corrige los huesos maxilofaciales cuando el problema no está solo en la posición de los dientes.',
    queEsTitulo: '¿Qué es la cirugía ortognática?',
    queEs1:
      'Es la cirugía que reposiciona los huesos maxilares para corregir su relación entre sí y con el resto de la cara.',
    queEs2:
      'Se planifica junto con la ortodoncia. Algunos de estos casos también se abordan hoy con alineadores, sin operación.',
    tiposEyebrow: 'Qué corrige',
    tiposTitulo: 'Siete casos que trata',
    tiposEntradilla:
      'Cada uno se valora individualmente; la indicación quirúrgica nunca se decide desde una web.',
    pestanas: [],
    variantes: [
      { id: 'retrognatia', nombre: 'Retrognatia', texto: 'Mandíbula situada por detrás de su posición.' },
      { id: 'prognatismo', nombre: 'Prognatismo', texto: 'Mandíbula adelantada respecto al maxilar.' },
      { id: 'menton', nombre: 'Mentón', texto: 'Corrección de la proyección o la forma del mentón.' },
      { id: 'apnea-del-sueno', nombre: 'Apnea del sueño', texto: 'Casos en que la vía aérea se estrecha durante el sueño.' },
      { id: 'asimetrias', nombre: 'Asimetrías', texto: 'Diferencias entre los dos lados de la cara.' },
      { id: 'sonrisa-gingival', nombre: 'Sonrisa gingival', texto: 'Exposición excesiva de encía al sonreír.' },
      { id: 'mordida-abierta', nombre: 'Mordida abierta', texto: 'Los dientes no llegan a contactar al cerrar.' },
    ],
    cruce: {
      titulo: 'Puede que no haga falta operar',
      texto:
        'El plan SONRIS GS trata con alineadores maloclusiones que antes exigían cirugía ortognática: asimetrías, apnea y avances mandibulares.',
      etiqueta: 'Ver los tipos',
      href: '/ortodoncia-invisible/#tipos',
    },
    destacadoEnHome: false,
  },
  {
    slug: 'endodoncia',
    nombre: 'Endodoncia',
    claim: 'Evita la extracción de un diente dañado',
    resumenHub:
      'Tratamos el interior del diente, limpiamos los conductos y los sellamos para conservarlo en boca.',
    h1: 'Evita la extracción',
    entradilla: 'Cuando el interior del diente está dañado, lo tratamos por dentro para conservarlo.',
    queEsTitulo: '¿Qué es una endodoncia?',
    queEs1:
      'Consiste en retirar el tejido dañado del interior del diente, limpiar los conductos y sellarlos. Así se conserva el diente en boca.',
    queEs2: 'Se clasifica por el número de raíces que hay que tratar.',
    tiposEyebrow: 'Tipos',
    tiposTitulo: 'Según el número de raíces',
    tiposEntradilla:
      'El tipo lo determina la anatomía del diente afectado, no la gravedad del dolor.',
    pestanas: [],
    variantes: [
      { id: 'unirradicular', nombre: 'Unirradicular', texto: 'Dientes con una sola raíz y un conducto que tratar.' },
      { id: 'birradicular', nombre: 'Birradicular', texto: 'Dientes con dos raíces.' },
      { id: 'multirradicular', nombre: 'Multirradicular', texto: 'Dientes con tres o más raíces, habitualmente molares.' },
    ],
    cruce: CRUCE_POR_DEFECTO,
    destacadoEnHome: true,
  },
  {
    slug: 'cirugia-oral',
    nombre: 'Cirugía oral',
    claim: 'Tratamiento con intervención quirúrgica',
    resumenHub:
      'Injertos de encía, frenectomías y extracción de muelas del juicio, planificados con calma.',
    h1: 'Tratamiento con intervención quirúrgica',
    entradilla:
      'Intervenciones sencillas en boca, planificadas con calma y explicadas antes de empezar.',
    queEsTitulo: '¿Qué es la cirugía oral?',
    queEs1:
      'Agrupa las intervenciones quirúrgicas que se hacen en la boca: sobre la encía, los frenillos o los dientes que hay que retirar.',
    queEs2: 'A veces son un paso previo necesario para que el tratamiento de ortodoncia funcione.',
    tiposEyebrow: 'Tipos',
    tiposTitulo: 'Tres intervenciones habituales',
    tiposEntradilla: 'Te explicamos siempre por qué está indicada y qué esperar después.',
    pestanas: [],
    variantes: [
      { id: 'injerto-de-encia', nombre: 'Injerto de encía', texto: 'Repone tejido de encía donde se ha perdido.' },
      { id: 'frenectomia', nombre: 'Frenectomía', texto: 'Corrige un frenillo que limita el movimiento o separa los dientes.' },
      { id: 'muelas-del-juicio', nombre: 'Extracción de muelas del juicio', texto: 'Retirada de los terceros molares cuando está indicada.' },
    ],
    cruce: CRUCE_POR_DEFECTO,
    destacadoEnHome: false,
  },
  {
    slug: 'periodoncia',
    nombre: 'Periodoncia',
    claim: 'Cuidado de tus encías',
    resumenHub:
      'La encía es la base sobre la que se mueve todo. Si no está sana, la ortodoncia espera.',
    h1: 'Cuidado de tus encías',
    entradilla:
      'La encía es la base sobre la que se mueve todo. Si no está sana, la ortodoncia espera.',
    queEsTitulo: '¿Qué es la periodoncia?',
    queEs1:
      'Es la parte de la odontología que se ocupa de la encía y del hueso que sujeta los dientes.',
    queEs2: 'Distingue dos enfermedades: una reversible y otra que solo se puede controlar.',
    tiposEyebrow: 'Enfermedades',
    tiposTitulo: 'Gingivitis y periodontitis',
    tiposEntradilla: 'El diagnóstico se hace en clínica, con sondaje y radiografías.',
    pestanas: [],
    variantes: [
      {
        id: 'gingivitis',
        nombre: 'Gingivitis',
        texto: 'Inflamación de la encía. Es reversible: tratada a tiempo, la encía recupera su estado.',
      },
      {
        id: 'periodontitis',
        nombre: 'Periodontitis o piorrea',
        texto:
          'La inflamación afecta también al hueso. No es reversible, pero sí controlable con tratamiento y seguimiento.',
      },
    ],
    cruce: {
      titulo: 'La encía va antes que el movimiento',
      texto:
        'Si hay gingivitis o periodontitis, se trata primero: la ortodoncia espera a que la base esté sana.',
      etiqueta: 'Cómo funciona',
      href: '/ortodoncia-invisible/#como-funciona',
    },
    destacadoEnHome: true,
  },
  {
    slug: 'odontologia-general',
    nombre: 'Odontología general',
    claim: 'Trata los problemas primarios de salud bucal',
    resumenHub:
      'Las revisiones y los arreglos de siempre, en la misma clínica en la que te alineas los dientes.',
    h1: 'Trata los problemas primarios de salud bucal',
    entradilla:
      'Las revisiones y los arreglos de siempre, en la misma clínica en la que te alineas los dientes.',
    queEsTitulo: '¿Qué es la odontología general?',
    queEs1:
      'Es la atención de base: revisar, prevenir y resolver los problemas más comunes antes de que se compliquen.',
    queEs2: 'Tener la boca sana es el punto de partida de cualquier tratamiento de ortodoncia.',
    tiposEyebrow: 'Técnicas',
    tiposTitulo: 'Empastes y endodoncias',
    tiposEntradilla:
      'Los dos arreglos que más salen en una revisión: uno repara el diente por fuera, el otro lo trata por dentro.',
    pestanas: [],
    variantes: [
      { id: 'empastes', nombre: 'Empastes', texto: 'Reponen la parte del diente afectada por una caries.' },
      { id: 'endodoncias', nombre: 'Endodoncias', texto: 'Tratamiento del interior del diente para evitar su extracción.' },
    ],
    cruce: CRUCE_POR_DEFECTO,
    destacadoEnHome: true,
  },
];

export const porSlug = (slug: string) => TRATAMIENTOS.find((t) => t.slug === slug);

/** Preguntas de la página de tratamientos. Misma regla que en `ortodoncia.ts`:
 *  solo entran las que tienen respuesta redactada y firmada por la clínica. Las
 *  dos de aquí se sostienen en datos ya publicados en el sitio (la gratuidad de
 *  la primera visita y el horario); el resto está en PENDIENTES.md. */
export const FAQ = [
  {
    pregunta: '¿La primera visita también es gratuita para estos tratamientos?',
    respuesta:
      'Sí. La primera visita es gratuita y sin compromiso, sea cual sea el tratamiento por el que vengas. En ella te exploramos, valoramos tu caso y te damos un plan.',
  },
  {
    pregunta: '¿Qué horario tenéis?',
    respuesta: 'Abrimos de lunes a viernes, de 12:00 a 20:00 h. Sábados y domingos permanecemos cerrados.',
  },
];
