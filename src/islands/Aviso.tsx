import { useEffect } from 'react';

export type Tono = 'ok' | 'error';
export type AvisoDatos = { id: number; tono: Tono; titulo: string; texto: string };

/** Notificación de la esquina inferior derecha.
 *  Se sitúa por encima del botón flotante de WhatsApp en escritorio y por
 *  encima de la barra fija en móvil, para no taparlos. */
export default function Aviso({ aviso, alCerrar }: { aviso: AvisoDatos; alCerrar: () => void }) {
  useEffect(() => {
    const t = setTimeout(alCerrar, 8000);
    return () => clearTimeout(t);
  }, [aviso.id, alCerrar]);

  const ok = aviso.tono === 'ok';

  return (
    <div
      role={ok ? 'status' : 'alert'}
      aria-live={ok ? 'polite' : 'assertive'}
      className="sonris-aviso"
      style={{
        position: 'fixed',
        right: 20,
        zIndex: 90,
        maxWidth: 'min(380px, calc(100vw - 40px))',
        background: '#FFFFFF',
        borderRadius: 28,
        border: ok ? '1px solid rgba(0,0,0,0.08)' : '2px solid #B3261E',
        boxShadow: '0 4px 12px rgba(0,0,0,.06),0 24px 56px rgba(0,0,0,.10)',
        padding: '20px 22px',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 44,
          height: 44,
          borderRadius: 20,
          background: ok ? '#FEE1CB' : '#FFFFFF',
          border: ok ? 'none' : '2px solid #B3261E',
          color: ok ? '#B24E00' : '#B3261E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {ok ? '✓' : '!'}
      </span>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 6px',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: '#000000',
          }}
        >
          {aviso.titulo}
        </p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#1A1A1A' }}>{aviso.texto}</p>
      </div>
      <button
        type="button"
        onClick={alCerrar}
        aria-label="Cerrar el aviso"
        style={{
          flex: 'none',
          width: 32,
          height: 32,
          marginLeft: 'auto',
          borderRadius: 9999,
          border: 'none',
          background: 'transparent',
          color: '#6B6B6B',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
}
