import { useEffect, useRef, useState } from 'react';

type Enlace = { nombre: string; href: string };

/** Isla: el menú de navegación por debajo de 1120px.
 *  El botón nace en el marcado del header, así que la isla lo incluye. */
export default function MenuMovil({
  enlaces,
  actual,
  hrefCita,
  telefono,
  telefonoE164,
}: {
  enlaces: Enlace[];
  actual: string;
  hrefCita: string;
  telefono: string;
  telefonoE164: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        boton.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      // Trampa de foco: el panel es un diálogo modal.
      const focos = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focos.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        data-burger
        aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        style={{
          marginLeft: 'auto',
          width: 48,
          height: 48,
          flex: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontSize: 18,
          color: '#1A1A1A',
        }}
      >
        {abierto ? '✕' : '☰'}
      </button>

      {abierto && (
        <div
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Navegación principal"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              left: 12,
              maxWidth: 520,
              marginLeft: 'auto',
              background: '#FFFFFF',
              borderRadius: 40,
              padding: '28px 24px',
              boxShadow: '0 4px 12px rgba(0,0,0,.06),0 24px 56px rgba(0,0,0,.10)',
            }}
          >
            <nav aria-label="Menú">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <a
                      href={e.href}
                      aria-current={e.href === actual ? 'page' : undefined}
                      onClick={() => setAbierto(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 56,
                        padding: '0 16px',
                        borderRadius: 20,
                        fontFamily: 'Poppins, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: 20,
                        letterSpacing: '-0.02em',
                        color: e.href === actual ? '#E76B0B' : '#1A1A1A',
                      }}
                    >
                      {e.nombre}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/contacto/"
                    onClick={() => setAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 56,
                      padding: '0 16px',
                      borderRadius: 20,
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: 20,
                      letterSpacing: '-0.02em',
                      color: actual === '/contacto/' ? '#E76B0B' : '#1A1A1A',
                    }}
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </nav>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '20px 0' }} />
            <a
              data-primary
              href={hrefCita}
              onClick={() => setAbierto(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                minHeight: 56,
                borderRadius: 9999,
                background: '#E76B0B',
                color: '#FFFFFF',
                fontSize: 18.66,
                fontWeight: 600,
              }}
            >
              Pide tu cita
              <span data-arrow style={{ display: 'inline-block', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }}>
                →
              </span>
            </a>
            <p style={{ margin: '14px 0 0', fontSize: 16, color: '#6B6B6B' }}>
              o llámanos al{' '}
              <a href={`tel:${telefonoE164}`} style={{ color: '#E76B0B', fontWeight: 500 }}>
                {telefono}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
