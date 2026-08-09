import { useRef, useState } from 'react';

/** Comparador antes/después. Arrastre con puntero y flechas del teclado.
 *  Sin fotografía real todavía: los dos lados son la trama de placeholder. */
export default function AntesDespues({ casos = 6 }: { casos?: number }) {
  const [corte, setCorte] = useState(50);
  const [caso, setCaso] = useState(0);
  const arrastrando = useRef(false);
  const caja = useRef<HTMLDivElement>(null);

  const desdeEvento = (e: React.PointerEvent) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    setCorte(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };

  const alTeclado = (e: React.KeyboardEvent) => {
    const paso = e.shiftKey ? 10 : 4;
    const mover = (d: number) => {
      e.preventDefault();
      setCorte((c) => Math.max(0, Math.min(100, c + d)));
    };
    if (e.key === 'ArrowLeft') mover(-paso);
    if (e.key === 'ArrowRight') mover(paso);
    if (e.key === 'Home') {
      e.preventDefault();
      setCorte(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      setCorte(100);
    }
  };

  const etiqueta: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    background: '#FFFFFF',
    borderRadius: 9999,
    padding: '6px 14px',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#1A1A1A',
  };

  return (
    <div>
      <div
        ref={caja}
        onPointerDown={(e) => {
          arrastrando.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          desdeEvento(e);
        }}
        onPointerMove={(e) => arrastrando.current && desdeEvento(e)}
        onPointerUp={() => {
          arrastrando.current = false;
        }}
        style={{
          position: 'relative',
          aspectRatio: '16/10',
          borderRadius: 40,
          overflow: 'hidden',
          background: 'repeating-linear-gradient(135deg,#EFEFEF 0 16px,#E5E5E5 16px 32px)',
          boxShadow: '0 4px 12px rgba(0,0,0,.06),0 24px 56px rgba(0,0,0,.10)',
          touchAction: 'none',
          cursor: 'ew-resize',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${corte}%`,
            overflow: 'hidden',
            background: 'repeating-linear-gradient(135deg,#F7F7F7 0 16px,#EFEFEF 16px 32px)',
          }}
        />
        <span aria-hidden="true" style={{ ...etiqueta, left: 20 }}>
          Antes
        </span>
        <span aria-hidden="true" style={{ ...etiqueta, right: 20 }}>
          Después
        </span>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${corte}%`, width: 2, background: '#FFFFFF', pointerEvents: 'none' }} />
        <button
          type="button"
          role="slider"
          aria-label={`Comparar antes y después del caso ${caso + 1}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(corte)}
          aria-valuetext={`${Math.round(corte)} % antes`}
          onKeyDown={alTeclado}
          style={{
            position: 'absolute',
            top: '50%',
            left: `${corte}%`,
            transform: 'translate(-50%,-50%)',
            width: 56,
            height: 56,
            borderRadius: 9999,
            background: '#EB6B0A',
            border: '2px solid #FFFFFF',
            color: '#000000',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 600,
            cursor: 'ew-resize',
            boxShadow: '0 4px 12px rgba(0,0,0,.06),0 24px 56px rgba(0,0,0,.10)',
          }}
        >
          ↔
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        {Array.from({ length: casos }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === caso ? 'true' : undefined}
            onClick={() => {
              setCaso(i);
              setCorte(50);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '0 18px',
              borderRadius: 9999,
              background: '#FFFFFF',
              border: i === caso ? '2px solid #EB6B0A' : '1px solid rgba(0,0,0,0.08)',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 15,
              fontWeight: i === caso ? 500 : 400,
              color: i === caso ? '#1A1A1A' : '#6B6B6B',
              cursor: 'pointer',
            }}
          >
            Caso {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
