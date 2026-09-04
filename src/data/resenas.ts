// Reseñas del perfil de Google, extraídas de la ficha y fijadas aquí.
//
// Se actualizan editando este archivo y reconstruyendo el sitio: no hay clave
// de API, ni llamadas desde el navegador, ni cookies de terceros, así que las
// ve todo el mundo, también quien rechace las cookies.
//
// Se publican 50 de las 223 que tiene la ficha. El contador de la
// cabecera muestra el total real y el botón lleva a Google, donde están todas.

export type Resena = {
  autor: string;
  /** Texto íntegro, sin editar. La tarjeta ya lo recorta visualmente. */
  texto: string;
  estrellas: number;
  /** Tal y como lo muestra Google: «hace 2 meses». */
  fecha: string;
  /** Perfil del autor en Google Maps: permite comprobar que la reseña es suya. */
  url?: string;
};

/** Lo que muestra la ficha en Google. Se actualiza a mano al reextraer. */
export const RESUMEN = {
  media: 4.9,
  total: 223,
  perfil: 'https://share.google/YZjDDF37QxvgAKoHj',
};

export const RESENAS: Resena[] = [
  {
    autor: 'Dj Camelot',
    texto:
      'Mi experiencia en Centro Sonris ha sido excepcional, sin duda un 10 de 10. Desde el primer momento, el trato ha sido cercano, amable y muy profesional. Quiero destacar especialmente a Joana, de recepción, por su simpatía, atención y por hacerte sentir cómodo desde que entras por la puerta. La clínica cuenta con dos doctores especialistas, y en mi caso tuve la suerte de ser atendido por el doctor Handy, cuya profesionalidad, cercanía y trato humano han sido excelentes. Me explicó todo de manera clara y transmitió mucha confianza y tranquilidad durante toda la visita. En cuanto a las instalaciones, son nuevas, modernas, bonitas y están impecables. Todo está perfectamente cuidado, tanto la recepción como las consultas y la zona donde realizan las revisiones. Además, la ubicación es muy buena: la clínica está a pie de calle y resulta muy fácil aparcar, ya que hay numerosas zonas de aparcamiento en los alrededores. Ha sido mi primera experiencia en Centro Sonris y me he llevado una impresión inmejorable. Profesionalidad, instalaciones excelentes y, sobre todo, un trato excepcional por parte de todo el equipo. Sin duda, recomiendo Centro Sonris al 100 %. Una experiencia de 10 sobre 10.',
    estrellas: 5,
    fecha: 'hace 6 días',
    url: 'https://www.google.com/maps/contrib/114677108153356651692/reviews?hl=es',
  },
  {
    autor: 'Mónica Oltra',
    texto:
      'Mónica muchas gracias por tu reseña !!! Agradecemos tu alta valoración pues todo el equipo en Sonris está encantado de poder ayudarte No te olvides de Sonreír 😃…',
    estrellas: 5,
    fecha: 'hace una semana',
    url: 'https://www.google.com/maps/contrib/108951384481268498027/reviews?hl=es',
  },
  {
    autor: 'Cristina Gil',
    texto:
      'Me hice un tratamiento de ortodoncia en Sonris y ha sido la mejor decisión que he tomado. El trato de todos los empleados ha sido excepcional, desde la recepcionista Joana hasta la doctora Isabel Vélez. Te explican todo con detalle para que lo entiendas, te enseñan el antes y el después de tus dientes y te hacer un tratamiento totalmente personalizado a tus necesidades. La verdad que no puedo estar más contenta',
    estrellas: 5,
    fecha: 'hace un mes',
    url: 'https://www.google.com/maps/contrib/106237253978719260753/reviews?hl=es',
  },
  {
    autor: 'Cris',
    texto:
      'Muy profesionales. Todo el equipo es maravilloso y han tratado mi caso, que era muy complejo, muy bien. Contenta con él resultado. Gracias por todo.',
    estrellas: 5,
    fecha: 'hace un mes',
    url: 'https://www.google.com/maps/contrib/109002559558892783914/reviews?hl=es',
  },
  {
    autor: 'Diego Campos',
    texto:
      'Visité Sonris después de que una amiga me recomendara una limpieza y blanqueamiento dental. Me quedé impresionada con el antes y el después. ¡Resultados increíbles después de una sola sesión! El personal es muy amable y profesional. Lo recomiendo ampliamente. ¡Gracias Antonio e Isabel!',
    estrellas: 5,
    fecha: 'hace un mes',
    url: 'https://www.google.com/maps/contrib/103041091782069518823/reviews?hl=es',
  },
  {
    autor: 'Ajitesh Thapa',
    texto:
      'Buscaba una clínica dental con buena reputación y encontré Sonris. Debo decir que estoy muy contenta con todo el proceso, de principio a fin. Me hice un tratamiento de Invisalign con el Dr. Hardy Luis y la atención, el cuidado y la profesionalidad que he recibido de todo el equipo de Sonris han sido excelentes. ¡Los recomiendo ampliamente!',
    estrellas: 5,
    fecha: 'hace 2 meses',
    url: 'https://www.google.com/maps/contrib/108301689398789569623/reviews?hl=es',
  },
  {
    autor: 'Carolina Lam',
    texto:
      'Comencé mi tratamiento Invisalign en Clínica dental SONRIS con Dr. Hardy Luis Giunta en octubre de 2023. Decidí comenzar el tratamiento debido al apiñamiento dental y a una mordida profunda. Mi tratamiento se dividió en tres fases. Al finalizar la primera fase (septiembre de 2024), mis dientes ya estaban prácticamente alineados. Durante la segunda y tercera fase, el Dr. Hardy Luis realizó ajustes muy precisos y cuidadosos para perfeccionar mi caso, especialmente en la línea media y la mordida. Finalmente, en mayo de 2026 terminé mi tratamiento con Invisalign y ahora comenzaré la etapa de retenedores Vivera. Quiero agradecer sinceramente al Dr. Hardy Luis Giunta y a todo el equipo de Clínica dental SONRIS. Gracias a su profesionalidad, dedicación y responsabilidad, hoy tengo una sonrisa mucho más bonita y segura 😊 Recomiendo totalmente esta clínica a cualquier persona que esté buscando un tratamiento de ortodoncia.',
    estrellas: 5,
    fecha: 'hace 3 meses',
    url: 'https://www.google.com/maps/contrib/111736653855477131519/reviews?hl=es-419',
  },
  {
    autor: 'Eva García Hormigos',
    texto:
      'He terminado mi tratamiento de ortodoncia y mi experiencia ha sido maravillosa. Enhorabuena a todo el equipo especialmente a Hardy por su atención y profesionalidad. Millones de gracias',
    estrellas: 5,
    fecha: 'hace 5 meses',
    url: 'https://www.google.com/maps/contrib/108123609807436709721/reviews?hl=es-419',
  },
  {
    autor: 'Yusmary Emilia',
    texto:
      'Es una clínica con un personal calificado en tratamientos de ortodoncia invisible e integrales, y con un equipo encantador y sus instalaciones son muy modernas y acogedoras mi experiencia a sido excelente',
    estrellas: 5,
    fecha: 'hace 5 meses',
    url: 'https://www.google.com/maps/contrib/102639515448333226214/reviews?hl=es-419',
  },
  {
    autor: 'Enrique Franco',
    texto:
      'Mi hijo de 17 años hizo un tratamiento de invisalign y fue todo fenomenal desde el principio, todos muy amables y muy contentos con el resultado final',
    estrellas: 5,
    fecha: 'hace 5 meses',
    url: 'https://www.google.com/maps/contrib/115136435191360777174/reviews?hl=es-419',
  },
  {
    autor: 'Francesca Urbani',
    texto:
      '100% recomendado, buenos profesionales, en especial Antonio, sin duda volveré.',
    estrellas: 5,
    fecha: 'hace 5 meses',
    url: 'https://www.google.com/maps/contrib/111491489699268656230/reviews?hl=es',
  },
  {
    autor: 'Can Yan',
    texto:
      'Dra. Isabel y su maravilloso equipo, estamos sumamente impresionados con el resultado del tratamiento de ortodoncia de nuestro hijo. La notable mejoría en la alineación de sus dientes es justo lo que esperábamos. ¡Gracias por su excelente atención y por regalarle a nuestro hijo una sonrisa tan hermosa!',
    estrellas: 5,
    fecha: 'hace 5 meses',
    url: 'https://www.google.com/maps/contrib/116051579419354535749/reviews?hl=es',
  },
  {
    autor: 'Daybel Pañellas',
    texto:
      'Hoy fue mi primera visita, con mi hijo (y para él). Agradezco al equipo su bienvenida, su paciencia, su capacidad para explicar lo complejo- reconociendo el derecho nuestro de saber, y con la capacidad pedagógica de no hacernos sentir tontos. Agradezco la sutileza de hacer responsable a un adolescente, y ganárselo. Y agradezco también la oportunidad de acceso, no importa nuestro origen y condición económica. Confío en el camino emprendido...',
    estrellas: 5,
    fecha: 'hace 6 meses',
    url: 'https://www.google.com/maps/contrib/117357182882193406280/reviews?hl=es-419',
  },
  {
    autor: 'Laura Leal Carcedo',
    texto:
      'Son especialistas en alineadores. Trabajan con última tecnologia y son muy profesionales. Puntualidad y trato inmejorable',
    estrellas: 5,
    fecha: 'hace 6 meses',
    url: 'https://www.google.com/maps/contrib/115828451234141020161/reviews?hl=es',
  },
  {
    autor: 'Donna De cheng',
    texto:
      'Son los mejores del mundo ! Isabel y Hardy son un encanto 💞💞💞 100-% recomendados !!!…',
    estrellas: 5,
    fecha: 'hace 6 meses',
    url: 'https://www.google.com/maps/contrib/111654976158648831837/reviews?hl=es',
  },
  {
    autor: 'Ainhoa C.',
    texto:
      'Muy satisfecha por el trato recibido en todo momento por parte del equipo, desde la atención telefónica hasta el propio servicio odontológico. Mi ortodoncia invisible la lleva el Dr. Hardy, quien está haciendo todo lo posible para que quede perfecta 👌🏻…',
    estrellas: 5,
    fecha: 'hace 7 meses',
    url: 'https://www.google.com/maps/contrib/112006911063205557224/reviews?hl=es',
  },
  {
    autor: 'Diego Verkist Perez',
    texto:
      'Muy contento con el tratamiento que me hice, servicio muy completo y profesional de las manos de Paola, te va explicando cada proceso y lo hace con mucha delicadeza, la próxima limpieza también me la haré con ella. Precio muy competitivo.',
    estrellas: 5,
    fecha: 'hace 8 meses',
    url: 'https://www.google.com/maps/contrib/108096103255516131619/reviews?hl=es',
  },
  {
    autor: 'Grace Patricia Cañate Archbold',
    texto:
      'Hardy, Paola y Antonio muy profesionales, el recibimiento, la comunicación con el paciente y la confianza que transmiten es clave para los tratamientos.',
    estrellas: 5,
    fecha: 'hace 8 meses',
    url: 'https://www.google.com/maps/contrib/108599454986635635762/reviews?hl=es',
  },
  {
    autor: 'Fresas con Piña FCP',
    texto:
      'Un equipo de 10!! Paula, Antonio y Hardy profesionales y amables. Mucha dedicación al paciente 😃😃…',
    estrellas: 5,
    fecha: 'hace 8 meses',
    url: 'https://www.google.com/maps/contrib/101928996004419835197/reviews?hl=es',
  },
  {
    autor: 'Angelica Llorente',
    texto:
      'Acabo de terminar el tratamiento y no puedo estar más contenta. Hubo un momento en que mi caso se atascó y no parecía avanzar. Yo estuve por darlo por finalizado pero gracias al empeño de Hardy Luis ha quedado prefecto. Además la clínica resulta muy confortable, cómoda y con trato cercano por parte de todo el personal. Y te ofrecen facilidades de pago y buen asesoramiento. Un lugar muy recomendable',
    estrellas: 5,
    fecha: 'hace 9 meses',
    url: 'https://www.google.com/maps/contrib/114496283816018363036/reviews?hl=es-419',
  },
  {
    autor: 'Estrella',
    texto:
      'He terminado mi tratamiento y la experiencia ha sido de diez. El equipo es increíble, cercano y muy profesional. A mí personalmente me trató el Dr. Hardy Luis Giunta y fue excelente. Siempre me trataron con cariño y paciencia, explicándome todo al detalle. El resultado ha superado mis expectativas y se nota el esfuerzo y la dedicación con la que trabajan. Da gusto encontrar un sitio así, muy muy muy recomendable.',
    estrellas: 5,
    fecha: 'hace 10 meses',
    url: 'https://www.google.com/maps/contrib/101902302148650798185/reviews?hl=es-419',
  },
  {
    autor: 'Rosabel',
    texto:
      'Después de visitar muchas clínicas, por fin di con ellos… y no puedo estar más feliz de haberlo hecho. Desde el primer momento me sentí súper bien tratada: un equipo cercano, profesional y muy transparente. En otras clínicas me habían dicho que tenía que quitarme piezas dentales, y aquí buscaron la manera de evitarlo, consiguiendo un resultado que sinceramente me parece alucinante. Mi sonrisa ha cambiado por completo (mucho más de lo que imaginaba) y ahora tengo una dentadura que jamás pensé que podría llegar a tener. El trato ha sido espectacular en todos los sentidos, tanto a nivel profesional como humano. De verdad, los recomiendo al 100%. Son un equipo maravilloso!🧡🧡',
    estrellas: 5,
    fecha: 'hace 10 meses',
    url: 'https://www.google.com/maps/contrib/107938003184092146621/reviews?hl=es-419',
  },
  {
    autor: 'Maria Gabriela Urbano Zurita',
    texto:
      'Excelente atención recomendado 100%, no me dolió nada, el doctor Antonio es excelente, muchas gracias',
    estrellas: 5,
    fecha: 'hace 10 meses',
    url: 'https://www.google.com/maps/contrib/107699984131561493189/reviews?hl=es',
  },
  {
    autor: 'adrimar viloria',
    texto:
      'El tratamiento con los aparatos invisibles fue muy rápido y los dientes quedaron muy bien posicionados Quiero agradecer el trato dado a mi hija años después de haberse retirado los aparatos se le partió el retenedor fijo que dejan por detrás de los dientes y hicieron la consideración de no hacer cobro por una nueva, muy a pesar de que la garantía de la barra retenedora fija había extinguido hace tiempo atrás.',
    estrellas: 5,
    fecha: 'hace 11 meses',
    url: 'https://www.google.com/maps/contrib/110375667289639434800/reviews?hl=es',
  },
  {
    autor: 'Melian',
    texto:
      'Cambiaron al recepcionista y nunca mas me atendieron, es una pena porque el trato era bueno',
    estrellas: 1,
    fecha: 'fecha de edición: hace 11 meses',
    url: 'https://www.google.com/maps/contrib/105642290532229884475/reviews?hl=es',
  },
  {
    autor: 'Patricia Zeballos',
    texto:
      'Una experiencia excelente desde el primer momento Acudí a este centro dental por recomendación y ha sido todo un acierto. El equipo es muy profesional y cercano, te hacen sentir cómodo desde que entras por la puerta. Las instalaciones son modernas, limpias y con tecnología de última generación, lo que da mucha confianza. Me explicaron todo el tratamiento con claridad y se tomaron el tiempo necesario para resolver mis dudas. Además, el trato humano es inmejorable: amables, atentos y siempre con una sonrisa. Sin duda, seguiré confiando en ellos para mi cuidado dental. ¡Totalmente recomendable!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/117139249622464349197/reviews?hl=es',
  },
  {
    autor: 'Guillermo P.',
    texto:
      'Hace ya años que conocí Sonris y empecé mi tratamiento; fue rápido, sencillo y no puedo estar más encantado con la experiencia en todos los sentidos. Todo el equipo es fantástico. A día de hoy, sigo haciendo mis revisiones con ellos cada año y contentísimo. ¡¡Se lo recomiendo a todo el mundo!!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/110461173647297949492/reviews?hl=es',
  },
  {
    autor: 'María Cristóbal',
    texto:
      'Me han atendido de manera excelente desde el inicio del tratamiento: han sido muy flexibles siempre con mis horarios y han hecho un seguimiento exhaustivo de todo lo que iba necesitando. Mi caso era complicado, con los dientes muy "apiñados", y desde el principio me informaron de cómo iría todo y me dieron plazos realistas que se cumplieron. Acabo de terminar el proceso y he quedado muy satisfecha, lo recomiendo sin duda.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/100870826177320302947/reviews?hl=es',
  },
  {
    autor: 'Samuel',
    texto:
      'Muy buena experiencia! Acudí por las buenas reseñas y la disponibilidad de distintos tipos de ortodoncia invisible, y las puedo confirmar. Estoy acabando mi tratamiento con alineadores en el tiempo que me dijeron al inicio, y he quedado muy contento con el resultado. Son siempre muy amables, gracias a todos.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/114484204177179087408/reviews?hl=es',
  },
  {
    autor: 'Miriam Moreno Heredia',
    texto:
      'Por fin encontré dentista en Madrid! Me encantó la atención y el profesionalismo. Me urgía una limpieza dental, por mi problema de ortodoncia tengo las encías expuestas y una limpieza dental es una tortura para mí por la sensibilidad, pero… Más',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/111457018344186281623/reviews?hl=es',
  },
  {
    autor: 'Sergio Muñoz',
    texto:
      'Me he realizado la ortodoncia invisible con ellos! Todo el equipo ha sido muy amable y profesional siempre. Me han aconsejado con lo mejor y el precio fue bastante bueno y competitivo. Un 10 para ellos y su trabajo. Gracias por todo 🧡…',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/107764462073020905192/reviews?hl=es',
  },
  {
    autor: 'Sandra Vicente',
    texto:
      'Me están llevando aquí mi tratamiento de alineadores, y y demás problemas en mi mordida, todo va genial el trato es maravilloso por parte de Ardí y el resto de los chicos, recién me puse carillas de composite ya que mis dientes eran muy muy pequeños y estaban muy limados por la mordida, el resultado no ha podido ser mejor, Roger el doctor estético es un artista. Estoy muy contenta!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/117338126220530144689/reviews?hl=es',
  },
  {
    autor: 'guadalupe amores',
    texto:
      'He terminado hace muy poquito con mi tratamiento de ortodoncia invisalign, estoy muy contenta con mi nueva sonrisa!!! 100% recomendable, con un trato personal exquisito y muy buenos profesionales, especialmente Dr. Hardy que me ha llevado el tratamiento. Feliz con mi sonrisa y muy agradecida por la atención recibida.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/116596198097019462040/reviews?hl=es',
  },
  {
    autor: 'Nera Logo',
    texto:
      'Llevo 2 años con el equipo, tanto para la ortodoncia invisible como para un implante y en ambas cosas estoy más que encantada. Todo el equipo es muy amable y cercano y el cambio en mi sonrisa ha sido increíble tanto a nivel estético como funcional. Les recomendaría al 100%!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/102064911632747261669/reviews?hl=es',
  },
  {
    autor: 'Juan Pablo Moreno-Tomé',
    texto:
      'Muy contento con la clínica. Muy buena asistencia en todo momento aclarando dudas y proponiendo soluciones adaptándose en todo momento a la evolución del tratamiento. Realmente contento con el gran resultado de mi nueva sonrisa!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/108488734770207640310/reviews?hl=es',
  },
  {
    autor: 'Víctor Sánchez Talavante',
    texto:
      '¡Excelente experiencia con Sonris! Me sometí al tratamiento de Invisalign y los resultados superaron mis expectativas. La sonrisa que siempre quise, ahora es una realidad gracias a la profesionalidad y dedicación de sus profesionales. La atención personalizada, la explicación detallada del proceso y el seguimiento constante me hicieron sentir cómodo y confiado en todo momento. ¡Altamente recomendado! Si buscas un dentista que te ayude a lograr la sonrisa de tus sueños, Sonris es tu mejor opción.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/115451742506517429576/reviews?hl=es',
  },
  {
    autor: 'Yuki K',
    texto:
      'He estado un año y pico con invisalign comprehensive y estoy muy satisfecho con el resultado y el trato recibido en la clínica. Además te hacen un seguimiento posterior para asegurarse de que todo sigue bien, así que es perfecto.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/104533102774395254456/reviews?hl=es',
  },
  {
    autor: 'Ana Delia Delgado Martinez',
    texto:
      'Si buscas profesionales de calidad, los encuentras en " Clínica Sonris" Desde la primera visita la atención es exelente. El trato cordial y amable inmejorables. Estoy en tratamiento ahora mismo y ha sido más que agradable, son y serán mis dentistas de cabecera. Sin dudar lo mejor de Madrid en Cálidad, Precio, Atención',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/101506542346735029518/reviews?hl=es',
  },
  {
    autor: 'Marta García',
    texto:
      'Todo genial! Me he hecho el tratamiento de invisalign y no puedo estar más contenta. Aprovechando me hice el tratamiento de limpieza y también estoy muy contenta. Ya son mis dentistas de confianza.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/116291113106453035898/reviews?hl=es',
  },
  {
    autor: 'Marta Moure',
    texto:
      'Una clínica excelente, el trato recibido no puede ser mejor. Estoy con mi tratamiento de invisalign y me explican todo fenomenal y me atienden súper bien!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/107226336527118038478/reviews?hl=es',
  },
  {
    autor: 'Laura S.',
    texto:
      'Acabo de terminar mi tratamiento con Invisalign y estoy muy contenta. Recomiendo Sonris 100% para corregir los dientes, no he tenido ningún problema y la atención ha sido estupenda, especialmente Hardy, con el que he seguido todo el proceso.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/102865632350798159732/reviews?hl=es',
  },
  {
    autor: 'Yamilet Mago',
    texto:
      'Excelente la experiencia en Sonris. Son muy profesionales y todo el personal súper amables. La sonrisa de mi hijo quedó perfecta. Lo recomiendo 100%',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/113924227159928608205/reviews?hl=es',
  },
  {
    autor: 'Sergio Rubio Garcia',
    texto:
      'Muy buena experiencia. Buen trato y son muy profesionales. Buen resultado con el tratamiento. Todo perfecto.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/103992330969098530941/reviews?hl=es',
  },
  {
    autor: 'jianyi li',
    texto:
      'Excelente servicios . Todos trabajadores muy amables, los Doctores muy profesionales. Vengo de Inglaterra atenderme con ellos. Recomendados.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/108557109765961084446/reviews?hl=es',
  },
  {
    autor: 'Jorge',
    texto:
      'Son maravillosos estoy muy contento con todos los miembros del equipo, se involucran mucho y se preocupan, da gusto! Recomendable 100%',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/101536719836633617623/reviews?hl=es',
  },
  {
    autor: 'Bernardo Martínez',
    texto:
      'Te atienden muy bien y muy rápido. Estoy terminando mi tratamiento y todo 5 estrellas muy recomendable!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/110393925029691266692/reviews?hl=es',
  },
  {
    autor: 'jennifer guaman',
    texto:
      'Una experiencia muy agradable, una atención de calidad por parte de Antonio, Ángeles y la Dra. Isabel. Lo recomiendo',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/117714385655838488549/reviews?hl=es',
  },
  {
    autor: 'Luis Rincón',
    texto:
      'Acabo de salir de la revisión del 2 año después de invisaling me la hizo Antonio y, todo fenomenal, mucho asesoramiento y después de 2 años sin el tratamiento la mordida sigue ok 👍🏼…',
    estrellas: 5,
    fecha: 'fecha de edición: hace un año',
    url: 'https://www.google.com/maps/contrib/103153327584669218603/reviews?hl=es',
  },
  {
    autor: 'Fernando Montilla',
    texto:
      'Totalmente recomendable la clínica. Siempre puntuales y muy amables. Así como muy profesionales.',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/101690086913274251539/reviews?hl=es',
  },
  {
    autor: 'Jose luis Corral goyanes',
    texto:
      'Trato muy bueno y cercano.unos grandes profesionales. Mi sonrisa parece otra!!',
    estrellas: 5,
    fecha: 'hace un año',
    url: 'https://www.google.com/maps/contrib/104857168028654808602/reviews?hl=es',
  },
];
