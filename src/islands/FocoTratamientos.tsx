import { useEffect, useRef, useState } from 'react';

type Item = { nombre: string; href: string; alt: string; img: string };

/** Curva expo-out: arranca rápido y frena largo, el gesto "premium". */
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const DUR = 980;

/** Carrusel de foco de la home: la tarjeta activa crece a 4/5 y el resto
 *  se atenúa. Arranca en la del medio (con siete tratamientos, Endodoncia):
 *  es la única posición con el mismo número de tarjetas a cada lado. */
const central = (n: number) => Math.floor(n / 2);

/** Medidas del círculo en foco y en reposo. Al ser círculos, alto = ancho. La
 *  caja reserva de antemano el alto del mayor: mientras uno encoge y otro
 *  crece, los dos pasan por tamaños intermedios y el contenedor se encogía a
 *  media transición.
 *  En móvil van más pequeños: con 340px de círculo en una pantalla de 360 no
 *  queda hueco a los lados y el activo no llega a centrarse nunca. */
const MEDIDAS = {
  ancha: { foco: { ancho: 340, alto: 340 }, quieto: 220 },
  estrecha: { foco: { ancho: 232, alto: 232 }, quieto: 150 },
};

const NARANJA = '#E76B0B';
const GAP = 24;
const ESTRECHA = '(max-width: 560px)';
const AIRE = { arriba: 8, abajo: 32 };

export default function FocoTratamientos({ items }: { items: Item[] }) {
  const [foco, setFoco] = useState(() => central(items.length));
  // El servidor no tiene matchMedia: se pinta la versión ancha y se corrige al
  // hidratar, antes de que el usuario llegue a ver el carrusel.
  const [medidas, setMedidas] = useState(MEDIDAS.ancha);
  const caja = useRef<HTMLDivElement>(null);
  const enlaces = useRef<(HTMLAnchorElement | null)[]>([]);
  const destino = useRef(0);
  const animacion = useRef(0);

  /** El scroll se interpola a mano, con la misma duración y curva que los
   *  círculos. Con scrollTo({behavior:'smooth'}) el navegador termina el
   *  desplazamiento en ~400ms mientras los anchos siguen animando otro medio
   *  segundo: el centro se corre después y la tarjeta parece retroceder. */
  const desplazar = (box: HTMLElement, hasta: number, instantaneo: boolean) => {
    cancelAnimationFrame(animacion.current);
    if (instantaneo) {
      box.scrollLeft = hasta;
      return;
    }
    const desde = box.scrollLeft;
    const t0 = performance.now();
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / DUR);
      box.scrollLeft = p < 1 ? desde + (hasta - desde) * (1 - Math.pow(2, -10 * p)) : hasta;
      if (p < 1) animacion.current = requestAnimationFrame(paso);
    };
    animacion.current = requestAnimationFrame(paso);
  };

  const ir = (i: number, instantaneo = false) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    const box = caja.current;
    if (box) {
      // Geometría, no offsetLeft: al llegar aquí los círculos pueden estar a
      // medio crecer (cambio de foco, o el salto a medidas de móvil al
      // hidratar) y el DOM devuelve posiciones que ya no valen. Con el foco en
      // `n`, todo lo que queda a su izquierda mide lo mismo, así que su sitio
      // final es una cuenta cerrada.
      const medio = (box.clientWidth - medidas.foco.ancho) / 2;
      destino.current = Math.max(24, medio) + n * (medidas.quieto + GAP) - medio;
      desplazar(box, destino.current, instantaneo);
    }
    setFoco(n);
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
  useEffect(() => () => cancelAnimationFrame(animacion.current), []);

  return (
    <>
      <div
        id="sonris-foco"
        ref={caja}
        style={{
          display: 'flex',
          gap: GAP,
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowX: 'auto',
          // offsetLeft de las tarjetas se mide contra esta caja, que es lo que
          // espera scrollTo.
          position: 'relative',
          // Medio hueco de tarjeta activa a cada lado para que la primera y la
          // última también puedan quedar centradas.
          padding: `${AIRE.arriba}px max(24px, calc(50% - ${medidas.foco.ancho / 2}px)) ${AIRE.abajo}px`,
          minHeight: medidas.foco.alto + AIRE.arriba + AIRE.abajo,
        }}
        // Si alguien arrastra durante la animación, manda el dedo.
        onPointerDown={() => cancelAnimationFrame(animacion.current)}
        // Red de seguridad: mientras las tarjetas crecen, el ancho del contenido
        // todavía es menor y el navegador recorta un destino que se salga. Solo
        // si quedó corto se vuelve a intentar, ya con el tamaño definitivo.
        onTransitionEnd={(e) => {
          const box = caja.current;
          if (e.propertyName === 'width' && box && Math.abs(box.scrollLeft - destino.current) > 1) {
            desplazar(box, destino.current, true);
          }
        }}
      >
        {items.map((t, i) => {
          const activo = i === foco;
          return (
            <a
              key={t.href}
              ref={(el) => {
                enlaces.current[i] = el;
              }}
              data-foco
              href={t.href}
              onClick={(e) => {
                if (activo) return;
                e.preventDefault();
                ir(i);
              }}
              style={{
                position: 'relative',
                flex: 'none',
                width: activo ? medidas.foco.ancho : medidas.quieto,
                height: activo ? medidas.foco.alto : medidas.quieto,
                borderRadius: 9999,
                overflow: 'hidden',
                display: 'block',
                // El activo va en naranja con letra blanca; los de los lados,
                // en blanco con letra naranja. El contraste entre ambos ya
                // marca la jerarquía, así que no hace falta atenuarlos.
                background: activo ? NARANJA : '#FFFFFF',
                boxShadow: activo
                  ? '0 8px 20px rgba(231,107,11,.28), 0 24px 56px rgba(0,0,0,.12)'
                  : '0 2px 8px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.08)',
                transition: ['width', 'height', 'background', 'box-shadow'].map((p) => `${p} ${DUR}ms ${EASE}`).join(', '),
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // En porcentaje, no en px: dentro de un círculo el texto
                  // tiene que apartarse del borde curvo, y el margen que hace
                  // falta cambia con el diámetro.
                  padding: '16%',
                  textAlign: 'center',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: activo ? 28 : 19,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: activo ? '#FFFFFF' : NARANJA,
                  transition: `font-size ${DUR}ms ${EASE}, color ${DUR}ms ${EASE}`,
                }}
              >
                {t.nombre}
              </span>
            </a>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
        <button
          type="button"
          aria-label="Tratamiento anterior"
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
              aria-label={t.nombre}
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
          aria-label="Tratamiento siguiente"
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
