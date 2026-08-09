// Los tres gestos de scroll del sistema. No tienen estado ni JSX: no
// justifican una isla de React, van en un script de módulo del layout.

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Header sticky: se rellena a partir de 80px y el CTA vira a ámbar.
 *  La barra móvil sube a partir de 420px, cuando el CTA del hero ya
 *  no está en pantalla: nunca hay dos rellenos ámbar a la vez. */
function iniciarHeader() {
  const h = document.getElementById('sonris-header');
  if (!h || h.dataset.variante === 'solida') return;
  const cta = document.getElementById('sonris-header-cta');
  const barra = document.querySelector<HTMLElement>('[data-mobilebar]');

  const aplicar = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const fijo = y > 80;
    h.style.background = fijo ? 'rgba(255,255,255,0.88)' : 'transparent';
    h.style.backdropFilter = fijo ? 'blur(12px)' : 'none';
    h.style.boxShadow = fijo ? '0 2px 8px rgba(0,0,0,.04),0 12px 32px rgba(0,0,0,.06)' : 'none';
    if (barra) barra.style.transform = y > 420 ? 'none' : 'translateY(120%)';
    if (cta) {
      cta.style.background = fijo ? '#B24E00' : '#FFFFFF';
      cta.style.color = fijo ? '#FFFFFF' : '#1A1A1A';
      cta.style.borderColor = fijo ? '#B24E00' : 'rgba(0,0,0,0.08)';
    }
  };
  window.addEventListener('scroll', aplicar, { passive: true });
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
