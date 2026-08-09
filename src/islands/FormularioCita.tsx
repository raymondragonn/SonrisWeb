import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Aviso, { type AvisoDatos } from './Aviso';

type Canal = 'whatsapp' | 'correo';
type Campo = 'nombre' | 'telefono' | 'email' | 'rgpd';

const PASOS: { titulo: string; campos: Campo[] }[] = [
  { titulo: 'Cómo te llamas', campos: ['nombre', 'telefono'] },
  { titulo: 'Cómo te escribimos', campos: ['email'] },
  { titulo: 'Permiso para tratar tus datos', campos: ['rgpd'] },
];

const ERRORES: Record<Campo, string> = {
  nombre: '⚠ Escribe tu nombre y apellidos para que sepamos con quién hablamos.',
  telefono: '⚠ Necesitamos un teléfono de 9 cifras para poder llamarte.',
  email: '⚠ Revisa el email: falta la arroba o el dominio.',
  rgpd: '⚠ Marca la casilla para que podamos tratar tus datos y contestarte.',
};

const ESTILO_INPUT = (invalido: boolean): CSSProperties => ({
  width: '100%',
  height: 56,
  borderRadius: 20,
  background: '#FFFFFF',
  border: invalido ? '2px solid #B3261E' : '1px solid rgba(0,0,0,0.08)',
  padding: '0 20px',
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 17,
  color: '#1A1A1A',
  transition: 'border-color 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms cubic-bezier(0.22,1,0.36,1)',
});

const ESTILO_ETIQUETA: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 500,
  color: '#6B6B6B',
};

const ESTILO_ERROR: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: '#B3261E',
};

export default function FormularioCita({
  whatsappE164,
  email,
  telefono,
  telefonoE164,
  origen,
}: {
  whatsappE164: string;
  email: string;
  telefono: string;
  telefonoE164: string;
  /** Página desde la que se envía: entra en el mensaje para que en clínica
   *  sepan de qué venía la consulta. */
  origen: string;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;

  const [valores, setValores] = useState({ nombre: '', telefono: '', email: '', mensaje: '', rgpd: false });
  const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
  const [canal, setCanal] = useState<Canal>('whatsapp');
  const [paso, setPaso] = useState(1);
  const [movil, setMovil] = useState(false);
  const [aviso, setAviso] = useState<AvisoDatos | null>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const mq = matchMedia('(max-width:900px)');
    const aplicar = () => setMovil(mq.matches);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, []);

  const valida = (c: Campo): boolean => {
    switch (c) {
      case 'nombre':
        return valores.nombre.trim().length > 2;
      case 'telefono':
        return valores.telefono.replace(/\D/g, '').length >= 9;
      case 'email':
        return /.+@.+\..+/.test(valores.email);
      case 'rgpd':
        return valores.rgpd;
    }
  };

  /** Marca los campos indicados y devuelve el primero inválido. */
  const revisar = (campos: Campo[]): Campo | null => {
    const nuevos = { ...errores };
    let primero: Campo | null = null;
    campos.forEach((c) => {
      const ok = valida(c);
      nuevos[c] = !ok;
      if (!ok && !primero) primero = c;
    });
    setErrores(nuevos);
    return primero;
  };

  const enfocar = (c: Campo) => {
    requestAnimationFrame(() => document.getElementById(id(c))?.focus());
  };

  const mensaje = () =>
    [
      `Hola, quiero pedir cita en Sonris.`,
      ``,
      `Nombre: ${valores.nombre.trim()}`,
      `Teléfono: ${valores.telefono.trim()}`,
      `Email: ${valores.email.trim()}`,
      valores.mensaje.trim() ? `Mensaje: ${valores.mensaje.trim()}` : null,
      ``,
      `Enviado desde ${origen} · sonris.es`,
    ]
      .filter((l) => l !== null)
      .join('\n');

  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const primero = revisar(['nombre', 'telefono', 'email', 'rgpd']);

    if (primero) {
      if (movil) {
        const i = PASOS.findIndex((p) => p.campos.includes(primero!));
        if (i > -1) setPaso(i + 1);
      }
      enfocar(primero);
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: 'No se ha enviado',
        texto: `Faltan datos por revisar y los hemos marcado en el formulario. Nada ha salido de aquí. Si lo prefieres, llámanos al ${telefono}.`,
      });
      return;
    }

    const texto = mensaje();

    if (canal === 'whatsapp') {
      const ventana = window.open(
        `https://wa.me/${whatsappE164}?text=${encodeURIComponent(texto)}`,
        '_blank',
        'noopener,noreferrer'
      );
      setAviso(
        ventana
          ? {
              id: Date.now(),
              tono: 'ok',
              titulo: 'WhatsApp abierto con tus datos',
              texto: 'Revisa el mensaje y pulsa enviar en WhatsApp. Te contestamos en horario de clínica, de 12:00 a 20:00.',
            }
          : {
              id: Date.now(),
              tono: 'error',
              titulo: 'No hemos podido abrir WhatsApp',
              texto: `El navegador ha bloqueado la ventana. Escríbenos directamente al ${whatsappE164.replace('34', '')} o llámanos al ${telefono}.`,
            }
      );
    } else {
      const asunto = `Cita en Sonris · ${valores.nombre.trim()}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
      setAviso({
        id: Date.now(),
        tono: 'ok',
        titulo: 'Correo preparado con tus datos',
        texto: `Te hemos abierto tu gestor de correo con el mensaje escrito: revísalo y pulsa enviar. Si no se ha abierto, escríbenos a ${email}.`,
      });
    }
  };

  const alSiguiente = () => {
    const primero = revisar(PASOS[paso - 1].campos);
    if (primero) {
      enfocar(primero);
      return;
    }
    const siguiente = Math.min(3, paso + 1);
    setPaso(siguiente);
    requestAnimationFrame(() => {
      document.getElementById(`${uid}-grupo-${siguiente}`)?.querySelector<HTMLElement>('input, textarea')?.focus();
    });
  };

  const visible = (n: number) => !movil || n === paso;

  return (
    <>
      <form
        ref={form}
        id="formulario-cita"
        noValidate
        onSubmit={alEnviar}
        data-peach
        style={{ background: '#FEE1CB', borderRadius: 40, padding: 44 }}
      >
        {movil && (
          <div data-steps style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
              <p id={id('paso-label')} style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>
                Paso {paso} de 3 · {PASOS[paso - 1].titulo}
              </p>
              <p style={{ margin: 0, font: '400 13px ui-monospace, Menlo, monospace', color: '#B24E00' }}>{paso}/3</p>
            </div>
            <div
              role="progressbar"
              aria-labelledby={id('paso-label')}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={paso}
              style={{ height: 8, borderRadius: 9999, background: '#EFEFEF', overflow: 'hidden' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(paso / 3) * 100}%`,
                  background: '#EB6B0A',
                  borderRadius: 9999,
                  transition: 'width 300ms cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
          </div>
        )}

        <div data-formgrid style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>
          <div
            id={`${uid}-grupo-1`}
            style={{ gridColumn: '1 / -1', display: visible(1) ? 'grid' : 'none', gridTemplateColumns: 'inherit', gap: 24 }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor={id('nombre')} style={ESTILO_ETIQUETA}>
                Nombre y apellidos
              </label>
              <input
                data-input
                id={id('nombre')}
                name="nombre"
                type="text"
                required
                autoComplete="name"
                placeholder="Nombre y apellidos"
                value={valores.nombre}
                onChange={(e) => setValores((v) => ({ ...v, nombre: e.target.value }))}
                aria-invalid={errores.nombre ? 'true' : 'false'}
                aria-describedby={errores.nombre ? id('e-nombre') : undefined}
                style={ESTILO_INPUT(!!errores.nombre)}
              />
              {errores.nombre && (
                <p id={id('e-nombre')} style={ESTILO_ERROR}>
                  {ERRORES.nombre}
                </p>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor={id('telefono')} style={ESTILO_ETIQUETA}>
                Teléfono
              </label>
              <input
                data-input
                id={id('telefono')}
                name="telefono"
                type="tel"
                required
                autoComplete="tel"
                placeholder="600 000 000"
                value={valores.telefono}
                onChange={(e) => setValores((v) => ({ ...v, telefono: e.target.value }))}
                aria-invalid={errores.telefono ? 'true' : 'false'}
                aria-describedby={errores.telefono ? id('e-telefono') : undefined}
                style={ESTILO_INPUT(!!errores.telefono)}
              />
              {errores.telefono && (
                <p id={id('e-telefono')} style={ESTILO_ERROR}>
                  {ERRORES.telefono}
                </p>
              )}
            </div>
          </div>

          <div
            id={`${uid}-grupo-2`}
            style={{ gridColumn: '1 / -1', display: visible(2) ? 'grid' : 'none', gridTemplateColumns: 'inherit', gap: 24 }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor={id('email')} style={ESTILO_ETIQUETA}>
                Email
              </label>
              <input
                data-input
                id={id('email')}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={valores.email}
                onChange={(e) => setValores((v) => ({ ...v, email: e.target.value }))}
                aria-invalid={errores.email ? 'true' : 'false'}
                aria-describedby={errores.email ? id('e-email') : undefined}
                style={ESTILO_INPUT(!!errores.email)}
              />
              {errores.email && (
                <p id={id('e-email')} style={ESTILO_ERROR}>
                  {ERRORES.email}
                </p>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor={id('mensaje')} style={ESTILO_ETIQUETA}>
                Mensaje <span style={{ color: '#6B6B6B' }}>(opcional)</span>
              </label>
              <textarea
                data-input
                id={id('mensaje')}
                name="mensaje"
                rows={4}
                placeholder="Cuéntanos qué te preocupa de tu sonrisa."
                value={valores.mensaje}
                onChange={(e) => setValores((v) => ({ ...v, mensaje: e.target.value }))}
                style={{
                  width: '100%',
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  padding: '16px 20px',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: '#1A1A1A',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div id={`${uid}-grupo-3`} style={{ gridColumn: '1 / -1', display: visible(3) ? 'block' : 'none' }}>
            <fieldset style={{ border: 'none', margin: '0 0 24px', padding: 0 }}>
              <legend style={{ ...ESTILO_ETIQUETA, padding: 0 }}>¿Por dónde te contestamos?</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {(
                  [
                    ['whatsapp', 'WhatsApp', 'Se abre WhatsApp con el mensaje escrito.'],
                    ['correo', 'Correo', 'Se abre tu gestor de correo y lo envías tú.'],
                  ] as const
                ).map(([valor, etiqueta, ayuda]) => (
                  <label
                    key={valor}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 48,
                      padding: '0 22px',
                      borderRadius: 9999,
                      background: canal === valor ? '#FEE1CB' : '#FFFFFF',
                      border: canal === valor ? '2px solid #EB6B0A' : '1px solid rgba(0,0,0,0.08)',
                      color: '#1A1A1A',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={id('canal')}
                      value={valor}
                      checked={canal === valor}
                      onChange={() => setCanal(valor)}
                      style={{ width: 20, height: 20, accentColor: '#B24E00', margin: 0 }}
                    />
                    {etiqueta}
                    <span className="vh">. {ayuda}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label
              htmlFor={id('rgpd')}
              style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.6, color: '#1A1A1A', cursor: 'pointer' }}
            >
              <input
                data-input
                id={id('rgpd')}
                name="rgpd"
                type="checkbox"
                required
                checked={valores.rgpd}
                onChange={(e) => setValores((v) => ({ ...v, rgpd: e.target.checked }))}
                aria-invalid={errores.rgpd ? 'true' : 'false'}
                aria-describedby={errores.rgpd ? id('e-rgpd') : undefined}
                style={{
                  flex: 'none',
                  width: 24,
                  height: 24,
                  marginTop: 2,
                  accentColor: '#B24E00',
                  ...(errores.rgpd ? { outline: '2px solid #B3261E', outlineOffset: 2 } : {}),
                }}
              />
              <span>
                He leído y acepto la{' '}
                <a href="/politica-de-privacidad/" style={{ color: '#B24E00', fontWeight: 500, textDecoration: 'underline' }}>
                  Política de Privacidad
                </a>{' '}
                y el{' '}
                <a href="/aviso-legal/" style={{ color: '#B24E00', fontWeight: 500, textDecoration: 'underline' }}>
                  Aviso Legal
                </a>
                . Tus datos los trata MASTER SMILE S.L. solo para responderte.
              </span>
            </label>
            {errores.rgpd && (
              <p id={id('e-rgpd')} style={ESTILO_ERROR}>
                {ERRORES.rgpd}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 32 }}>
          {movil && paso > 1 && (
            <button
              type="button"
              data-secondary
              onClick={() => setPaso((p) => Math.max(1, p - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 56,
                padding: '0 26px',
                borderRadius: 9999,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#1A1A1A',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Atrás
            </button>
          )}
          {movil && paso < 3 && (
            <button
              type="button"
              data-primary
              onClick={alSiguiente}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                padding: '0 32px',
                borderRadius: 9999,
                background: '#B24E00',
                border: 'none',
                color: '#FFFFFF',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Siguiente
              <span data-arrow style={{ display: 'inline-block', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }}>
                →
              </span>
            </button>
          )}
          {(!movil || paso === 3) && (
            <button
              type="submit"
              data-primary
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                padding: '0 32px',
                borderRadius: 9999,
                background: '#B24E00',
                border: 'none',
                color: '#FFFFFF',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {canal === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar por correo'}
              <span data-arrow style={{ display: 'inline-block', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }}>
                →
              </span>
            </button>
          )}
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#1A1A1A' }}>
            Primera visita gratuita, sin compromiso.
            <br />o llámanos al{' '}
            <a href={`tel:${telefonoE164}`} style={{ color: '#B24E00', fontWeight: 500 }}>
              {telefono}
            </a>
          </p>
        </div>
      </form>

      {aviso && <Aviso key={aviso.id} aviso={aviso} alCerrar={() => setAviso(null)} />}
    </>
  );
}
