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

iniciarHeader();
iniciarContadores();
