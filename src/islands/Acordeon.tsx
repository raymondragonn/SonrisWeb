import { useId, useState } from 'react';

export type Fila = { pregunta: string; respuesta: string };

export default function Acordeon({ filas }: { filas: Fila[] }) {
  const uid = useId().replace(/:/g, '');
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 40, padding: '16px 36px', boxShadow: 'var(--e1)' }}>
      {filas.map((f, i) => {
        const abierto = abierta === i;
        const idPanel = `${uid}-p${i}`;
        return (
          <div key={f.pregunta} data-accrow style={i < filas.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.08)' } : undefined}>
            <button
              type="button"
              onClick={() => setAbierta(abierto ? null : i)}
              aria-expanded={abierto}
              aria-controls={idPanel}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                padding: '24px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
            >
              <span
                data-q
                style={{
                  fontWeight: 600,
                  fontSize: 19,
                  letterSpacing: '-0.02em',
                  color: abierto ? '#B24E00' : '#000000',
                  transition: 'color 200ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {f.pregunta}
              </span>
              <span
                data-chev
                aria-hidden="true"
                style={{
                  flex: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  background: abierto ? '#EB6B0A' : '#FEE1CB',
                  color: abierto ? '#FFFFFF' : '#B24E00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: abierto ? 'rotate(180deg)' : 'none',
                  transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1), background 300ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                ⌄
              </span>
            </button>
            {/* grid-template-rows 0fr↔1fr anima la altura sin medirla en JS */}
            <div
              id={idPanel}
              role="region"
              style={{
                display: 'grid',
                gridTemplateRows: abierto ? '1fr' : '0fr',
                transition: 'grid-template-rows 300ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* visibility retira el panel cerrado del árbol de accesibilidad
                  sin romper la transición, cosa que display:none sí haría */}
              <div style={{ overflow: 'hidden', visibility: abierto ? 'visible' : 'hidden' }}>
                <p style={{ margin: '0 0 24px', fontSize: 17, lineHeight: 1.7, color: '#1A1A1A', maxWidth: '65ch' }}>{f.respuesta}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
