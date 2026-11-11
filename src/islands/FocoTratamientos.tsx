import { useEffect, useRef, useState, type ReactNode } from 'react';

type Item = { nombre: string; href: string; alt: string; img: string };

/** Curva expo-out: arranca rápido y frena largo, el gesto "premium". */
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const DUR = 980;

/** Carrusel de foco de la home: la tarjeta activa crece y el resto queda en
 *  reposo. Arranca en la del medio (con siete tratamientos, Endodoncia): es la
 *  única posición con el mismo número de tarjetas a cada lado. */
const central = (n: number) => Math.floor(n / 2);

/** Diámetro del círculo en foco y en reposo.
 *  En móvil van más pequeños: con 340px de círculo en una pantalla de 360 no
 *  queda hueco a los lados y el activo no llega a centrarse nunca. */
const MEDIDAS = {
  ancha: { foco: 340, quieto: 220 },
  estrecha: { foco: 232, quieto: 150 },
};

const NARANJA = '#E76B0B';
const GAP = 24;
const ESTRECHA = '(max-width: 560px)';
const AIRE = { arriba: 8, abajo: 32 };
/** Tamaño de letra en foco y en reposo (el mismo en todas las pantallas). */
const LETRA = { foco: 28, quieto: 19 };

const SOMBRA_FOCO = '0 8px 20px rgba(231,107,11,.28), 0 24px 56px rgba(0,0,0,.12)';
/** La de reposo se dibuja en el círculo ya escalado: sus medidas se dividen por la
 *  escala para que, una vez encogido, se vea exactamente como la original. */
const sombraQuieto = (escala: number) => {
  const px = (n: number) => `${(n / escala).toFixed(1)}px`;
  return `0 ${px(2)} ${px(8)} rgba(0,0,0,.04), 0 ${px(12)} ${px(32)} rgba(0,0,0,.08)`;
};

const transicion = (...props: string[]) => props.map((p) => `${p} ${DUR}ms ${EASE}`).join(', ');

/**
 * Todo lo que se mueve lo hace con transform y opacity, que el navegador anima en
 * la GPU sin recalcular la página: cada círculo ocupa siempre el hueco de uno en
 * reposo, el activo se agranda con scale y sus vecinos se apartan con translateX
 * lo mismo que antes empujaba el cambio de ancho. El resultado en pantalla es el
 * mismo, pero sin rehacer la fila, el texto ni las sombras en cada fotograma.
 */
/* Los nombres llegan también como slots n0…nN (HTML ya pintado por Astro): el
 * modo edición los reescribe al publicar, y como props React volvería a pintar
 * el nombre viejo al hidratar. Sin slot, el de las props. */
export default function FocoTratamientos({
  items,
  en = false,
  ...slots
}: {
  items: Item[];
  /** Página en inglés: etiquetas propias de los botones. */
  en?: boolean;
  [slot: string]: unknown;
}) {
  const [foco, setFoco] = useState(() => central(items.length));
  // El servidor no tiene matchMedia: se pinta la versión ancha y se corrige al
  // hidratar, antes de que el usuario llegue a ver el carrusel.
  const [medidas, setMedidas] = useState(MEDIDAS.ancha);
  const caja = useRef<HTMLDivElement>(null);
  const huecos = useRef<(HTMLDivElement | null)[]>([]);
  const animacion = useRef(0);
  const animando = useRef(false);
  const espera = useRef(0);
  // Etiquetas de los puntos: el nombre que de verdad se ve (puede venir editado en
  // el slot), leído una vez montado.
  const [etiquetas, setEtiquetas] = useState(() => items.map((t) => t.nombre));
  const estado = useRef({ foco });
  estado.current = { foco };

  const { foco: F, quieto: Q } = medidas;
  const escala = Q / F;
  const delta = F - Q;

  /** El scroll se interpola a mano, con la misma duración y curva que los
   *  círculos: con behavior:'smooth' el navegador termina antes y el activo
   *  parece llegar tarde a su sitio. */
  const desplazar = (box: HTMLElement, hasta: number, instantaneo: boolean) => {
    cancelAnimationFrame(animacion.current);
    if (instantaneo) {
      animando.current = false;
      box.scrollLeft = hasta;
      return;
    }
    const desde = box.scrollLeft;
    const t0 = performance.now();
    animando.current = true;
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / DUR);
      box.scrollLeft = p < 1 ? desde + (hasta - desde) * (1 - Math.pow(2, -10 * p)) : hasta;
      if (p < 1) animacion.current = requestAnimationFrame(paso);
      else animando.current = false;
    };
    animacion.current = requestAnimationFrame(paso);
  };

  /** Scroll que deja el hueco `n` en el centro. Los huecos no cambian de tamaño
   *  (solo se transforman), así que offsetLeft vale en cualquier momento. */
  const destinoDe = (box: HTMLElement, n: number) => {
    const hueco = huecos.current[n];
    return hueco ? hueco.offsetLeft + hueco.offsetWidth / 2 - box.clientWidth / 2 : box.scrollLeft;
  };

  const ir = (i: number, instantaneo = false) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    const box = caja.current;
    if (box) desplazar(box, destinoDe(box, n), instantaneo);
    setFoco(n);
  };

  /** Al soltar un deslizamiento (dedo, trackpad, rueda), el círculo que quedó más
   *  cerca del centro pasa a ser el activo y termina de centrarse con la misma
   *  curva. Sin esto el foco se quedaba atrás, a veces fuera de la pantalla. */
  const alDesplazar = () => {
    if (animando.current) return;
    clearTimeout(espera.current);
    espera.current = window.setTimeout(() => {
      const box = caja.current;
      if (!box || animando.current) return;
      const centro = box.scrollLeft + box.clientWidth / 2;
      let cerca = estado.current.foco;
      let distancia = Infinity;
      huecos.current.forEach((h, i) => {
        if (!h) return;
        const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - centro);
        if (d < distancia) {
          distancia = d;
          cerca = i;
        }
      });
      if (cerca !== estado.current.foco || Math.abs(box.scrollLeft - destinoDe(box, cerca)) > 2) ir(cerca);
    }, 120);
  };

  useEffect(() => {
    const mq = matchMedia(ESTRECHA);
    const aplicar = () => setMedidas(mq.matches ? MEDIDAS.estrecha : MEDIDAS.ancha);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, []);

  // La tarjeta de partida ya tiene que aparecer centrada, sin la animación.
  // Al cambiar de medidas hay que recentrarla: el ancho de todo ha cambiado.
  useEffect(() => ir(foco, true), [medidas]);
  useEffect(() => {
    setEtiquetas(items.map((t, i) => huecos.current[i]?.textContent?.trim() || t.nombre));
  }, []);
  useEffect(
    () => () => {
      cancelAnimationFrame(animacion.current);
      clearTimeout(espera.current);
    },
    []
  );

  return (
    <>
      <div
        id="sonris-foco"
        ref={caja}
        onScroll={alDesplazar}
        style={{
          display: 'flex',
          gap: GAP,
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowX: 'auto',
          // Al llegar a un extremo, el gesto no sigue hacia la página (ni dispara
          // el "atrás" del navegador en móvil).
          overscrollBehaviorX: 'contain',
          position: 'relative',
          // Medio hueco a cada lado para que la primera y la última también
          // puedan quedar centradas, y sitio para lo que el activo sobresale de
          // su hueco al agrandarse (medio delta por cada lado y por arriba/abajo).
          padding: `${AIRE.arriba + delta / 2}px max(${24 + delta / 2}px, calc(50% - ${Q / 2}px)) ${AIRE.abajo + delta / 2}px`,
        }}
        // Si alguien arrastra durante la animación, manda el dedo.
        onPointerDown={() => {
          cancelAnimationFrame(animacion.current);
          animando.current = false;
        }}
      >
        {items.map((t, i) => {
          const activo = i === foco;
          const desvio = i < foco ? -delta / 2 : i > foco ? delta / 2 : 0;
          return (
            // Hueco fijo en la maqueta; solo se desplaza con transform.
            <div
              key={t.href}
              ref={(el) => {
                huecos.current[i] = el;
              }}
              style={{
                position: 'relative',
                flex: 'none',
                width: Q,
                height: Q,
                transform: `translateX(${desvio}px)`,
                transition: transicion('transform'),
                willChange: 'transform',
              }}
            >
              {/* Círculo a tamaño de foco, encogido con scale cuando reposa. Va en
                  su propia capa y no en el enlace: el meneo del hover
                  ([data-foco]:hover en global.css) usa transform en el enlace. */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: F,
                  height: F,
                  marginLeft: -F / 2,
                  marginTop: -F / 2,
                  transform: `scale(${activo ? 1 : escala})`,
                  transition: transicion('transform'),
                  willChange: 'transform',
                }}
              >
                <a
                  data-foco
                  href={t.href}
                  onClick={(e) => {
                    if (activo) return;
                    e.preventDefault();
                    ir(i);
                  }}
                  style={{ position: 'relative', display: 'block', width: '100%', height: '100%', borderRadius: 9999 }}
                >
                  {/* Sombras y fondo como capas que se funden con opacity: animar
                      box-shadow o el color de fondo obligaba a repintar el círculo
                      en cada fotograma. */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      boxShadow: sombraQuieto(escala),
                      opacity: activo ? 0 : 1,
                      transition: transicion('opacity'),
                    }}
                  />
                  <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 9999, background: '#FFFFFF' }} />
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      background: NARANJA,
                      boxShadow: SOMBRA_FOCO,
                      opacity: activo ? 1 : 0,
                      transition: transicion('opacity'),
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // En porcentaje, no en px: dentro de un círculo el texto
                      // tiene que apartarse del borde curvo.
                      padding: '16%',
                      textAlign: 'center',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: LETRA.foco,
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      color: activo ? '#FFFFFF' : NARANJA,
                      // El círculo ya escala el texto; este factor lo deja en los
                      // 19px de reposo exactos en vez de en 28 × escala.
                      transform: `scale(${activo ? 1 : LETRA.quieto / (LETRA.foco * escala)})`,
                      transition: transicion('transform', 'color'),
                    }}
                  >
                    {(slots[`n${i}`] as ReactNode | undefined) ?? t.nombre}
                  </span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
        <button
          type="button"
          data-secondary
          aria-label={en ? 'Previous treatment' : 'Tratamiento anterior'}
          onClick={() => ir(foco - 1)}
          style={{
            width: 48,
            height: 48,
            flex: 'none',
            borderRadius: 9999,
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            color: '#1A1A1A',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {items.map((t, i) => (
            <button
              key={t.href}
              type="button"
              data-punto
              aria-label={etiquetas[i]}
              aria-current={i === foco ? 'true' : undefined}
              onClick={() => ir(i)}
              style={{
                width: 44,
                height: 44,
                flex: 'none',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  background: i === foco ? '#E76B0B' : 'rgba(0,0,0,0.25)',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          data-secondary
          aria-label={en ? 'Next treatment' : 'Tratamiento siguiente'}
          onClick={() => ir(foco + 1)}
          style={{
            width: 48,
            height: 48,
            flex: 'none',
            borderRadius: 9999,
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            color: '#1A1A1A',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          →
        </button>
      </div>
    </>
  );
}
