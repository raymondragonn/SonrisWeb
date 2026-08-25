import { useEffect, useRef, useState } from 'react';
import type { Plan } from '../data/ortodoncia';

/** Misma curva y duración que el carrusel de la home (FocoTratamientos). */
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const DUR = 620;

/** Ancho de tarjeta. En una pantalla de 360 los 380px de escritorio no dejan
 *  hueco a los lados y la tarjeta en foco no llega a centrarse nunca. */
const ANCHO = { ancha: 380, estrecha: 268 };
const ESTRECHA = '(max-width: 560px)';

/** Los cinco planes. El activo recupera opacidad y lleva el borde ámbar de 2px;
 *  el recomendado se distingue por el badge «El más elegido». */
export default function CarruselPlanes({ planes }: { planes: Plan[] }) {
  const inicial = Math.max(0, planes.findIndex((p) => p.recomendado));
  const [foco, setFoco] = useState(inicial);
  // El servidor no tiene matchMedia: se pinta la versión ancha y se corrige al
  // hidratar, antes de que el usuario llegue a ver el carrusel.
  const [ancho, setAncho] = useState(ANCHO.ancha);
  const caja = useRef<HTMLDivElement>(null);
  const tarjetas = useRef<(HTMLElement | null)[]>([]);

  const ir = (i: number, behavior: ScrollBehavior = 'smooth') => {
    const n = Math.max(0, Math.min(planes.length - 1, i));
    setFoco(n);
    const el = tarjetas.current[n];
    const box = caja.current;
    if (el && box) box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior });
  };

  useEffect(() => {
    const mq = matchMedia(ESTRECHA);
    const aplicar = () => setAncho(mq.matches ? ANCHO.estrecha : ANCHO.ancha);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, []);

  // El plan de partida ya tiene que aparecer centrado, sin la animación.
  // Al cambiar de ancho hay que recentrarlo: la medida de todo ha cambiado.
  useEffect(() => ir(foco, 'instant'), [ancho]);

  return (
    <>
      <div
        ref={caja}
        style={{
          display: 'flex',
          gap: 28,
          alignItems: 'stretch',
          overflowX: 'auto',
          // offsetLeft de las tarjetas se mide contra esta caja, que es lo que
          // espera scrollTo.
          position: 'relative',
          // overflow-x:auto obliga al eje Y a recortar también, así que lo que
          // sale de la tarjeta (el badge en top:-14, el -16 del recomendado y
          // las sombras) necesita hueco dentro de la caja de scroll. El margen
          // negativo lo devuelve al sitio para que nada se mueva de posición.
          // Medio hueco de tarjeta a cada lado para que la primera y la última
          // también puedan quedar centradas; el mínimo de 32px es para las
          // pantallas donde no cabe ni una tarjeta entera.
          padding: `48px max(24px, calc(50% - ${ancho / 2}px)) 56px`,
          margin: '-48px -24px -56px',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
        }}
      >
        {planes.map((p, i) => {
          const activo = i === foco;
          return (
            <article
              key={p.nombre}
              data-plan
              ref={(el) => {
                tarjetas.current[i] = el;
              }}
              tabIndex={0}
              aria-current={activo ? 'true' : undefined}
              onClick={(e) => {
                if (activo || (e.target as HTMLElement).closest('a')) return;
                ir(i);
              }}
              style={{
                flex: 'none',
                cursor: activo ? 'default' : 'pointer',
                width: ancho,
                opacity: activo ? 1 : 0.45,
                position: 'relative',
                marginTop: p.recomendado ? -16 : 0,
                background: '#FFFFFF',
                borderRadius: 40,
                border: activo ? '2px solid #EB6B0A' : '1px solid rgba(0,0,0,0.08)',
                padding: ancho === ANCHO.ancha ? 36 : 28,
                boxShadow: activo ? '0 20px 52px rgba(0,0,0,.055)' : '0 12px 36px rgba(0,0,0,.03)',
                transition: ['opacity', 'box-shadow'].map((pr) => `${pr} ${DUR}ms ${EASE}`).join(', '),
              }}
            >
              {p.recomendado && (
                <span
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#FFBC7D',
                    color: '#000000',
                    borderRadius: 9999,
                    padding: '6px 14px',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  ★ El más elegido
                </span>
              )}
              <h3
                style={{
                  margin: p.recomendado ? '0 0 8px' : '0 0 20px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 24,
                  letterSpacing: '-0.02em',
                  color: '#000000',
                }}
              >
                {p.nombre}
              </h3>
              {p.recomendado && <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 500, color: '#B24E00' }}>Recomendado</p>}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {p.puntos.map((pt) => (
                  <li
                    key={pt.texto}
                    style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.6, color: pt.incluido ? '#1A1A1A' : '#6B6B6B' }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: 'none',
                        width: 20,
                        height: 20,
                        borderRadius: 9999,
                        background: pt.incluido ? '#FEE1CB' : '#EFEFEF',
                        color: pt.incluido ? '#B24E00' : '#6B6B6B',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 3,
                      }}
                    >
                      {pt.incluido ? '✓' : '·'}
                    </span>
                    {pt.texto}
                  </li>
                ))}
              </ul>
              {/* Solo se ve en la tarjeta en foco, pero se pinta siempre: con
                  alignItems stretch, montarlo y desmontarlo cambiaba la altura
                  de toda la fila al pasar de un plan a otro. Oculto no es
                  tabulable ni lo ve un lector de pantalla. */}
              <a
                data-primary
                href={`/contacto/?plan=${encodeURIComponent(p.nombre)}#formulario`}
                aria-hidden={activo ? undefined : true}
                tabIndex={activo ? undefined : -1}
                style={{
                  marginTop: 28,
                  display: 'inline-flex',
                  whiteSpace: 'nowrap',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 48,
                  padding: '0 26px',
                  borderRadius: 9999,
                  background: '#B24E00',
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 600,
                  visibility: activo ? 'visible' : 'hidden',
                }}
              >
                Consúltanos tu caso
                <span data-arrow style={{ display: 'inline-block', transition: `transform ${DUR}ms ${EASE}` }}>
                  →
                </span>
              </a>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 }}>
        <button
          type="button"
          aria-label="Plan anterior"
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
          {planes.map((p, i) => (
            <button
              key={p.nombre}
              type="button"
              aria-label={p.nombre}
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
                style={{ width: 10, height: 10, borderRadius: 9999, background: i === foco ? '#B24E00' : 'rgba(0,0,0,0.25)', display: 'block' }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Plan siguiente"
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
