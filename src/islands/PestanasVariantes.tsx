import { useEffect, useState } from 'react';

type Pestana = { id: string; nombre: string; texto: string };

/** Pestañas de estética dental. Los ids #blanqueamiento y #carillas existen
 *  como anclas reales delante del panel: al llegar con ese fragmento se abre
 *  la pestaña correspondiente. */
export default function PestanasVariantes({ pestanas }: { pestanas: Pestana[] }) {
  const [activa, setActiva] = useState(pestanas[0]?.id);

  useEffect(() => {
    const desdeHash = () => {
      const h = window.location.hash.replace('#', '');
      if (pestanas.some((p) => p.id === h)) setActiva(h);
    };
    desdeHash();
    window.addEventListener('hashchange', desdeHash);
    return () => window.removeEventListener('hashchange', desdeHash);
  }, [pestanas]);

  const actual = pestanas.find((p) => p.id === activa) ?? pestanas[0];
  if (!actual) return null;

  return (
    <div>
      <div role="tablist" aria-label="Variantes del tratamiento" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={p.id === actual.id}
            aria-controls="panel-tipos"
            onClick={() => setActiva(p.id)}
            style={{
              minHeight: 48,
              padding: '0 24px',
              borderRadius: 9999,
              background: p.id === actual.id ? '#FEE1CB' : '#FFFFFF',
              border: p.id === actual.id ? '2px solid #E76B0B' : '1px solid rgba(0,0,0,0.08)',
              color: '#1A1A1A',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div
        id="panel-tipos"
        role="tabpanel"
        aria-labelledby={`tab-${actual.id}`}
        style={{ background: '#F7F7F7', borderRadius: 40, padding: 44 }}
      >
        {pestanas.map((p) => (
          <div key={p.id} id={p.id} tabIndex={-1} aria-hidden="true" style={{ height: 0, scrollMarginTop: 120 }} />
        ))}
        <h3
          style={{
            margin: '0 0 16px',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: '#000000',
          }}
        >
          {actual.nombre}
        </h3>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: '#1A1A1A', maxWidth: '65ch' }}>{actual.texto}</p>
      </div>
    </div>
  );
}
