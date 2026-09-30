// Los tres gestos de scroll del sistema. No tienen estado ni JSX: no
// justifican una isla de React, van en un script de módulo del layout.

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Header sticky: se rellena a partir de 80px y el CTA vira a ámbar.
 *  La barra móvil sube a partir de 420px, cuando el CTA del hero ya
 *  no está en pantalla: nunca hay dos rellenos ámbar a la vez. */
function iniciarHeader() {
  const h = document.getElementById('sonris-header');
  if (!h || h.dataset.variante === 'solida') return;
  const barra = document.querySelector<HTMLElement>('[data-mobilebar]');

  // El aspecto lo pone global.css a partir de estos dos interruptores. El
  // script solo decide cuándo, nunca cómo.
  let fijo = false;
  let subida = false;
  let encolado = false;

  const aplicar = () => {
    encolado = false;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    // El relleno entra al primer píxel de scroll: si esperaba a los 80px, el
    // navbar viajaba transparente sobre contenido ya desplazado. Umbrales
    // distintos al entrar y salir para que el rebote no lo encienda en bucle.
    const ahoraFijo = fijo ? y > 4 : y > 8;
    if (ahoraFijo !== fijo) {
      fijo = ahoraFijo;
      h.toggleAttribute('data-fijo', fijo);
    }
    const ahoraSubida = y > 420;
    if (barra && ahoraSubida !== subida) {
      subida = ahoraSubida;
      barra.style.transform = subida ? 'none' : 'translateY(120%)';
    }
  };

  // Un solo repintado por fotograma: el evento de scroll llega muchas más
  // veces que eso y escribir en cada uno provocaba tirones.
  window.addEventListener(
    'scroll',
    () => {
      if (encolado) return;
      encolado = true;
      requestAnimationFrame(aplicar);
    },
    { passive: true }
  );
  if (barra) barra.style.transform = 'translateY(120%)';
  aplicar();
}

/** Contadores de la barra de confianza. */
function iniciarContadores() {
  const nodos = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));
  if (!nodos.length || reducido) return;

  const correr = (nodo: HTMLElement) => {
    const hasta = parseFloat(nodo.dataset.countTo || '0');
    const prefijo = nodo.dataset.countPrefix || '';
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / 1200);
      nodo.textContent = prefijo + Math.round(hasta * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        correr(e.target as HTMLElement);
        io.unobserve(e.target);
      }),
    { threshold: 0.6 }
  );
  nodos.forEach((n) => io.observe(n));
}

/** Alineador que gira con el puntero. Seis fotogramas de una vuelta: la X del
 *  ratón dentro del marco elige la pose y el fundido con la siguiente tapa el
 *  salto. Lo que hace natural el movimiento es el retardo: la pose y el vuelco
 *  persiguen al cursor en lugar de ir pegados a él, así el objeto parece tener
 *  peso. El marco es la zona sensible (el hero entero, por ejemplo) y
 *  [data-giro] el bloque que se mueve dentro de ella. */
function girarAlineador(marco: HTMLElement) {
  // Con poses, el puntero elige cuál se ve. Con un vídeo dentro no hay nada
  // que elegir y el puntero solo inclina, así que el reposo es el centro y no
  // el extremo izquierdo de la secuencia.
  const fotos = Array.from(marco.querySelectorAll<HTMLImageElement>('[data-giro] img'));
  const reposo = fotos.length ? 0 : 0.5;

  // Las poses que faltan se traen tras el load, para que el primer movimiento
  // ya las tenga y no se vea el tirón.
  if (fotos.length) {
    const precargar = () =>
      fotos.forEach((f) => {
        if (!f.src && f.dataset.src) f.src = f.dataset.src;
      });
    if (document.readyState === 'complete') precargar();
    else window.addEventListener('load', precargar, { once: true });
  }

  const ultimo = fotos.length - 1;
  let metaX = reposo;
  let metaY = 0.5;
  let x = reposo;
  let y = 0.5;
  let corriendo = false;

  const paso = () => {
    x += (metaX - x) * 0.09;
    y += (metaY - y) * 0.09;

    // Posición continua dentro de la secuencia: la parte entera es el
    // fotograma y la decimal, cuánto se ve ya del siguiente. El vidrio es
    // translúcido, así que dos poses a media opacidad se ven las dos a la vez
    // y aparece un fantasma: el cruce se comprime al tercio central y se
    // suaviza, fuera de ahí solo hay una pose en pantalla.
    if (fotos.length > 1) {
      const pos = x * ultimo;
      const i = Math.min(ultimo - 1, Math.floor(pos));
      const cruce = Math.min(1, Math.max(0, (pos - i - 0.35) / 0.3));
      const mezcla = cruce * cruce * (3 - 2 * cruce);
      fotos.forEach((foto, n) => {
        foto.style.opacity = String(n === i ? 1 - mezcla : n === i + 1 ? mezcla : 0);
      });
    }

    marco.style.setProperty('--giro', `${(x - 0.5) * 14}deg`);
    marco.style.setProperty('--vuelco', `${(0.5 - y) * 9}deg`);

    corriendo = Math.abs(metaX - x) > 0.0008 || Math.abs(metaY - y) > 0.0008;
    if (corriendo) requestAnimationFrame(paso);
  };

  const arrancar = () => {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(paso);
  };

  marco.addEventListener('pointermove', (e) => {
    const caja = marco.getBoundingClientRect();
    metaX = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width));
    metaY = Math.min(1, Math.max(0, (e.clientY - caja.top) / caja.height));
    arrancar();
  });

  // Al salir vuelve solo a la pose de reposo, con el mismo retardo.
  marco.addEventListener('pointerleave', () => {
    metaX = reposo;
    metaY = 0.5;
    arrancar();
  });
}

/** Carruseles que pasan solos de página. El desplazamiento manual es el scroll
 *  nativo del contenedor (dedo, trackpad, barra); los botones [data-ir] que haya
 *  al lado mueven una página en cada sentido y dan la vuelta en los extremos.
 *  El intervalo va en el propio atributo: data-auto-carrusel="4500". */
/** Bloques que entran deslizándose cuando asoman en pantalla. El atributo en
 *  <html> es lo que activa el estado inicial (oculto y desplazado): sin JS que
 *  los revele, el CSS no llega a esconderlos. Si el bloque lleva un vídeo, se
 *  pone en marcha al entrar y se para al salir, para no descargarlo ni tenerlo
 *  corriendo mientras no se ve. */
function iniciarEntradas() {
  const nodos = Array.from(document.querySelectorAll<HTMLElement>('[data-entra]'));
  if (!nodos.length) return;
  document.documentElement.dataset.js = '';

  if (reducido) {
    nodos.forEach((n) => n.setAttribute('data-visible', ''));
    return;
  }

  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        const nodo = e.target as HTMLElement;
        const video = nodo.querySelector('video');
        if (e.isIntersecting) {
          nodo.setAttribute('data-visible', '');
          // El autoplay del navegador exige silencio; el botón lo devuelve.
          video?.play().catch(() => {});
        } else {
          video?.pause();
        }
      }),
    { threshold: 0.25 }
  );
  nodos.forEach((n) => io.observe(n));
}

/** Botón de sonido del vídeo que acompaña al formulario. */
function iniciarSonidoVisita() {
  document.querySelectorAll<HTMLElement>('[data-visita-sonido]').forEach((boton) => {
    const video = boton.parentElement?.querySelector('video');
    if (!video) return;
    boton.addEventListener('click', () => {
      video.muted = !video.muted;
      boton.setAttribute('aria-pressed', String(!video.muted));
      boton.setAttribute('aria-label', video.muted ? 'Activar el sonido del vídeo' : 'Silenciar el vídeo');
      const icono = boton.querySelector('[data-icono]');
      if (icono) icono.textContent = video.muted ? '♪' : '♫';
      if (video.paused) video.play().catch(() => {});
    });
  });
}

function iniciarCarruseles() {
  document.querySelectorAll<HTMLElement>('[data-auto-carrusel]').forEach((pista) => {
    const paso = (d: number) => {
      const fin = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 1;
      const inicio = pista.scrollLeft <= 1;
      const destino = d > 0 && fin ? 0 : d < 0 && inicio ? pista.scrollWidth : pista.scrollLeft + d * pista.clientWidth;
      pista.scrollTo({ left: destino, behavior: 'smooth' });
    };
    pista.parentElement?.querySelectorAll<HTMLElement>('[data-ir]').forEach((b) => {
      b.addEventListener('click', () => paso(Number(b.dataset.ir)));
    });

    if (reducido) return;
    // Se para mientras el puntero está encima o el foco dentro: es cuando
    // alguien lo está mirando.
    let quieto = false;
    const pausa = (v: boolean) => () => (quieto = v);
    pista.addEventListener('pointerenter', pausa(true));
    pista.addEventListener('pointerleave', pausa(false));
    pista.addEventListener('focusin', pausa(true));
    pista.addEventListener('focusout', pausa(false));
    setInterval(() => quieto || paso(1), Number(pista.dataset.autoCarrusel) || 5000);
  });
}

function iniciarAlineador() {
  // El vídeo del hero arranca solo desde el marcado; quien pide menos
  // movimiento se queda con el póster.
  if (reducido) {
    document.querySelectorAll<HTMLVideoElement>('[data-giro] video').forEach((v) => v.pause());
  }
  // Sin hover fino no hay giro ni inclinación posibles, así que en táctil las
  // poses que faltan no llegan a pedirse nunca.
  if (reducido || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-alineador]').forEach(girarAlineador);
}

iniciarHeader();
iniciarContadores();
iniciarCarruseles();
iniciarEntradas();
iniciarSonidoVisita();
iniciarAlineador();
