import { useEffect, useRef, useState } from 'react';

type Item = { nombre: string; href: string; alt: string; img: string };

/** Curva expo-out: arranca rápido y frena largo, el gesto "premium". */
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const DUR = 980;

/** Carrusel de foco de la home: la tarjeta activa crece a 4/5 y el resto
 *  se atenúa. Arranca en la del medio (con siete tratamientos, Endodoncia):
 *  es la única posición con el mismo número de tarjetas a cada lado. */
const central = (n: number) => Math.floor(n / 2);

/** Medidas de la tarjeta en foco y en reposo. La caja reserva de antemano el
 *  alto de la mayor: mientras una encoge y otra crece, las dos pasan por
 *  tamaños intermedios y el contenedor se encogía a media transición.
 *  En móvil van más pequeñas: con 340px de tarjeta en una pantalla de 360 no
 *  queda hueco a los lados y la activa no llega a centrarse nunca. */
const MEDIDAS = {
  ancha: { foco: { ancho: 340, alto: 425 }, quieto: 260 },
  estrecha: { foco: { ancho: 232, alto: 290 }, quieto: 176 },
};
const ESTRECHA = '(max-width: 560px)';
const AIRE = { arriba: 8, abajo: 32 };

export default function FocoTratamientos({ items }: { items: Item[] }) {
  const [foco, setFoco] = useState(() => central(items.length));
  // El servidor no tiene matchMedia: se pinta la versión ancha y se corrige al
  // hidratar, antes de que el usuario llegue a ver el carrusel.
  const [medidas, setMedidas] = useState(MEDIDAS.ancha);
  const caja = useRef<HTMLDivElement>(null);
  const enlaces = useRef<(HTMLAnchorElement | null)[]>([]);

  const ir = (i: number, behavior: ScrollBehavior = 'smooth') => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    setFoco(n);
    const el = enlaces.current[n];
    const box = caja.current;
    if (el && box) box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior });
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
  useEffect(() => ir(foco, 'instant'), [medidas]);

  return (
    <>
      <div
        id="sonris-foco"
        ref={caja}
        style={{
          display: 'flex',
          gap: 24,
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
          scrollBehavior: 'smooth',
        }}
        // El scroll del navegador acaba antes que el crecimiento de la tarjeta,
        // que ahora es largo: al terminar esa transición se recoloca el centro.
        onTransitionEnd={(e) => e.propertyName === 'width' && ir(foco)}
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
                borderRadius: 28,
                overflow: 'hidden',
                display: 'block',
                opacity: activo ? 1 : 0.45,
                transition: ['opacity', 'width', 'height'].map((p) => `${p} ${DUR}ms ${EASE}`).join(', '),
              }}
            >
              <img
                data-cardimg
                src={t.img}
                sizes="340px"
                width={1024}
                height={768}
                loading="lazy"
                decoding="async"
                alt={t.alt}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: activo ? 'scale(1)' : 'scale(1.12)',
                  transition: `transform ${DUR + 300}ms ${EASE}`,
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.55) 100%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  textAlign: 'center',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: activo ? 28 : 22,
                  transform: activo ? 'translateY(0)' : 'translateY(6px)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  transition: `font-size ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`,
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
