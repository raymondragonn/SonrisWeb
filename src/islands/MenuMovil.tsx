import { useEffect, useRef, useState, type ReactNode } from 'react';

type Enlace = { nombre: string; href: string };

/** Isla: el menú de navegación por debajo de 1120px.
 *  El botón nace en el marcado del header, así que la isla lo incluye.
 *
 *  Los textos editables (nombres del menú, «Contacto», «Reservar visita» y el
 *  enlace del teléfono) llegan como slots: HTML ya pintado por Astro, que el modo
 *  edición reescribe al publicar. Como props serializadas, React volvería a pintar
 *  el texto viejo al hidratar. Slots: n0…nN (un nombre por enlace), contacto,
 *  cta y telefono; sin slot se usa el texto de las props. */
export default function MenuMovil({
  enlaces,
  actual,
  hrefCita,
  hrefContacto = '/contacto/',
  acento,
  en = false,
  ...slots
}: {
  enlaces: Enlace[];
  actual: string;
  hrefCita: string;
  hrefContacto?: string;
  acento: string;
  /** Página en inglés: textos propios del menú y enlaces ya traducidos. */
  en?: boolean;
  [slot: string]: unknown;
}) {
  const slot = (nombre: string) => slots[nombre] as ReactNode | undefined;
  const t = (es: string, ingles: string) => (en ? ingles : es);
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
        aria-label={abierto ? t('Cerrar el menú', 'Close the menu') : t('Abrir el menú', 'Open the menu')}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        style={{
          marginLeft: 'auto',
          width: 52,
          height: 52,
          flex: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          cursor: 'pointer',
          color: '#1A1A1A',
        }}
      >
        {/* Trazos dibujados, no los glifos ☰ / ✕: su tamaño y su centrado
            dependían de la fuente y quedaban pequeños y descolocados. */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          {abierto ? (
            <>
              <path d="M6 6 L20 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              <path d="M20 6 L6 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </>
          ) : (
            <>
              <path d="M4 8h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              <path d="M4 13h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              <path d="M4 18h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </>
          )}
        </svg>
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
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
            animation: 'sonris-aparece 200ms ease-out',
          }}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={t('Navegación principal', 'Main navigation')}
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
              animation: 'sonris-aviso-entra 280ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* El panel arranca en top:12 y tapa el botón del header, que queda
                por debajo del velo: sin esto, cerrar exige acertar en el hueco
                del fondo o irse a un enlace. */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                type="button"
                aria-label={t('Cerrar el menú', 'Close the menu')}
                onClick={() => {
                  setAbierto(false);
                  boton.current?.focus();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  flex: 'none',
                  borderRadius: 16,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: '#1A1A1A',
                  cursor: 'pointer',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <path d="M6 6 L20 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M20 6 L6 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <nav aria-label={t('Menú', 'Menu')}>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
                {enlaces.map((e, i) => (
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
                        color: e.href === actual ? acento : '#1A1A1A',
                      }}
                    >
                      {slot(`n${i}`) ?? e.nombre}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={hrefContacto}
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
                      color: actual === hrefContacto ? acento : '#1A1A1A',
                    }}
                  >
                    {slot('contacto') ?? t('Contacto', 'Contact')}
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
                background: acento,
                color: '#FFFFFF',
                fontSize: 18.66,
                fontWeight: 600,
              }}
            >
              {slot('cta') ?? t('Reservar visita', 'Book a visit')}
              <span data-arrow style={{ display: 'inline-block', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }}>
                →
              </span>
            </a>
            {slot('idioma') && <div style={{ marginTop: 20 }}>{slot('idioma')}</div>}
            <p style={{ margin: '14px 0 0', fontSize: 16, color: '#6B6B6B' }}>
              {t('o llámanos al', 'or call us on')} {slot('telefono')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
