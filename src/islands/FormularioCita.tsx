import { useEffect, useId, useState, type CSSProperties, type FormEvent } from 'react';
import Aviso, { type AvisoDatos } from './Aviso';

type Canal = 'whatsapp' | 'correo';
type Campo = 'nombre' | 'contacto' | 'motivo' | 'rgpd';

/** Endpoint de Formspree. Es público por diseño (va en el HTML), pero sin él el
 *  formulario no entrega: el envío avisa y ofrece teléfono y correo. */
const FORMSPREE = import.meta.env.PUBLIC_FORMSPREE_ID as string | undefined;

/** Por dónde quiere que le contestemos. Decide qué dato de contacto se pide:
 *  uno, no los dos. */
const CANALES: { valor: Canal; etiqueta: string; ayuda: string }[] = [
  { valor: 'whatsapp', etiqueta: 'WhatsApp', ayuda: 'Te escribimos al número que nos dejes.' },
  { valor: 'correo', etiqueta: 'Correo', ayuda: 'Te contestamos al email que nos dejes.' },
];

/** La pregunta que de verdad ordena la primera visita: con qué viene el
 *  paciente. Va en botones porque escribirlo cuesta y elegirlo no. */
const MOTIVOS = [
  'Alinearme los dientes',
  'Corregirme la mordida',
  'El color o la forma',
  'Una revisión o una molestia',
  'Otra cosa',
];

const ERRORES: Record<Campo, string> = {
  nombre: '⚠ Escribe tu nombre para que sepamos con quién hablamos.',
  contacto: '⚠ Revisa el dato: necesitamos por dónde contestarte.',
  motivo: '⚠ Elige con qué vienes: es lo que nos sirve para prepararte la visita.',
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

/** Asterisco decorativo: quien usa lector de pantalla ya oye «obligatorio» por
 *  el required del campo, así que no se lee dos veces. */
const Obligatorio = () => (
  <span aria-hidden="true" style={{ color: '#E76B0B' }}>
    {' '}
    *
  </span>
);

const ESTILO_ERROR: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: '#B3261E',
};

/** Píldora de elección: la comparten el canal y los motivos. */
const ESTILO_PILDORA = (marcada: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 48,
  padding: '0 22px',
  borderRadius: 9999,
  background: marcada ? '#FEE1CB' : '#FFFFFF',
  border: marcada ? '2px solid #E76B0B' : '1px solid rgba(0,0,0,0.08)',
  color: '#1A1A1A',
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
});

const VACIO = { nombre: '', contacto: '', motivo: '', mensaje: '', rgpd: false };

export default function FormularioCita({
  email,
  telefono,
  telefonoE164,
  origen,
}: {
  email: string;
  telefono: string;
  telefonoE164: string;
  /** Página desde la que se envía: viaja con el aviso para que en clínica
   *  sepan de qué venía la consulta. */
  origen: string;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;

  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
  const [canal, setCanal] = useState<Canal>('whatsapp');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoDatos | null>(null);

  const porWhatsApp = canal === 'whatsapp';

  // El carrusel de planes enlaza aquí con ?plan=… El texto se recorta y se
  // aplana antes de entrar: acaba en un mensaje que el usuario ve y revisa.
  useEffect(() => {
    const plan = new URLSearchParams(location.search).get('plan')?.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (plan) {
      setValores((v) => ({ ...v, motivo: MOTIVOS[0], mensaje: `Me interesa el plan ${plan}.` }));
    }
  }, []);

  const valida = (c: Campo): boolean => {
    switch (c) {
      case 'nombre':
        return valores.nombre.trim().length > 1;
      case 'contacto':
        return porWhatsApp ? valores.contacto.replace(/\D/g, '').length >= 9 : /.+@.+\..+/.test(valores.contacto);
      case 'motivo':
        return valores.motivo !== '';
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

  // Corregir un campo marcado lo desmarca al momento: no hay que reenviar para
  // ver que ya está bien. Solo toca los que están en rojo, nunca marca de nuevo.
  useEffect(() => {
    setErrores((e) => {
      const n = { ...e };
      let cambia = false;
      (Object.keys(n) as Campo[]).forEach((c) => {
        if (n[c] && valida(c)) {
          n[c] = false;
          cambia = true;
        }
      });
      return cambia ? n : e;
    });
  }, [valores, canal]);

  const enfocar = (c: Campo) => {
    requestAnimationFrame(() => document.getElementById(id(c))?.focus());
  };

  const alEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    const primero = revisar(['nombre', 'contacto', 'motivo', 'rgpd']);
    if (primero) {
      enfocar(primero);
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: 'No se ha enviado',
        texto: `Faltan datos por revisar y los hemos marcado en el formulario. Nada ha salido de aquí. Si lo prefieres, llámanos al ${telefono}.`,
      });
      return;
    }

    if (!FORMSPREE) {
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: 'El formulario no está configurado',
        texto: `No podemos recoger tu mensaje ahora mismo. Escríbenos a ${email} o llámanos al ${telefono} y te atendemos igual.`,
      });
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          // Formspree usa el campo `email` como Reply-To del aviso; cuando el
          // canal es WhatsApp no hay email que responder y va solo el número.
          nombre: valores.nombre.trim(),
          [porWhatsApp ? 'telefono' : 'email']: valores.contacto.trim(),
          responder_por: porWhatsApp ? 'WhatsApp' : 'Correo',
          vengo_por: valores.motivo,
          mensaje: valores.mensaje.trim(),
          origen,
          _subject: `Cita en Sonris · ${valores.nombre.trim()}`,
        }),
      });
      if (!respuesta.ok) throw new Error(String(respuesta.status));

      setValores(VACIO);
      setAviso({
        id: Date.now(),
        tono: 'ok',
        titulo: 'Mensaje enviado',
        texto: porWhatsApp
          ? 'Ya nos ha llegado. Te escribimos por WhatsApp en horario de clínica, de 12:00 a 20:00.'
          : 'Ya nos ha llegado. Te contestamos por correo en horario de clínica, de 12:00 a 20:00.',
      });
    } catch {
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: 'No hemos podido enviarlo',
        texto: `Ha fallado la conexión y tu mensaje no ha salido. Vuelve a intentarlo, escríbenos a ${email} o llámanos al ${telefono}.`,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <form
        id="formulario-cita"
        noValidate
        onSubmit={alEnviar}
        data-peach
        data-caja
        style={{ background: '#FEE1CB', borderRadius: 40, padding: 44 }}
      >
        {/* Cepo de Formspree: sin CSS que lo esconda, un bot lo rellena y el
            envío se descarta. Fuera del orden de tabulación. */}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />

        <fieldset style={{ border: 'none', margin: '0 0 24px', padding: 0 }}>
          <legend style={{ ...ESTILO_ETIQUETA, padding: 0 }}>¿Por dónde te contestamos?</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {CANALES.map((c) => (
              <label key={c.valor} style={ESTILO_PILDORA(canal === c.valor)}>
                <input
                  type="radio"
                  name={id('canal')}
                  value={c.valor}
                  checked={canal === c.valor}
                  onChange={() => setCanal(c.valor)}
                  style={{ width: 20, height: 20, accentColor: '#E76B0B', margin: 0 }}
                />
                {c.etiqueta}
                <span className="vh">. {c.ayuda}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('nombre')} style={ESTILO_ETIQUETA}>
            ¿Cómo te llamas?
            <Obligatorio />
          </label>
          <input
            data-input
            id={id('nombre')}
            name="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder="Tu nombre"
            value={valores.nombre}
            onChange={(e) => setValores((v) => ({ ...v, nombre: e.target.value }))}
            onBlur={() => revisar(['nombre'])}
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

        {/* Un solo dato de contacto: el del canal elegido. */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('contacto')} style={ESTILO_ETIQUETA}>
            {porWhatsApp ? '¿A qué número te escribimos?' : '¿A qué correo te contestamos?'}
            <Obligatorio />
          </label>
          <input
            data-input
            id={id('contacto')}
            name={porWhatsApp ? 'telefono' : 'email'}
            type={porWhatsApp ? 'tel' : 'email'}
            required
            autoComplete={porWhatsApp ? 'tel' : 'email'}
            placeholder={porWhatsApp ? '600 000 000' : 'tu@email.com'}
            value={valores.contacto}
            onChange={(e) => setValores((v) => ({ ...v, contacto: e.target.value }))}
            onBlur={() => valores.contacto && revisar(['contacto'])}
            aria-invalid={errores.contacto ? 'true' : 'false'}
            aria-describedby={errores.contacto ? id('e-contacto') : undefined}
            style={ESTILO_INPUT(!!errores.contacto)}
          />
          {errores.contacto && (
            <p id={id('e-contacto')} style={ESTILO_ERROR}>
              {ERRORES.contacto}
            </p>
          )}
        </div>

        <fieldset style={{ border: 'none', margin: '0 0 24px', padding: 0 }}>
          <legend style={{ ...ESTILO_ETIQUETA, padding: 0 }}>
            ¿Con qué vienes?
            <Obligatorio />
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {MOTIVOS.map((m, i) => (
              <label key={m} style={ESTILO_PILDORA(valores.motivo === m)}>
                <input
                  // El id va en el primero para que el foco del error caiga aquí.
                  id={i === 0 ? id('motivo') : undefined}
                  type="radio"
                  name={id('motivo-grupo')}
                  value={m}
                  checked={valores.motivo === m}
                  onChange={() => setValores((v) => ({ ...v, motivo: m }))}
                  aria-invalid={errores.motivo ? 'true' : 'false'}
                  aria-describedby={errores.motivo ? id('e-motivo') : undefined}
                  style={{ width: 20, height: 20, accentColor: '#E76B0B', margin: 0 }}
                />
                {m}
              </label>
            ))}
          </div>
          {errores.motivo && (
            <p id={id('e-motivo')} style={ESTILO_ERROR}>
              {ERRORES.motivo}
            </p>
          )}
        </fieldset>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('mensaje')} style={ESTILO_ETIQUETA}>
            ¿Algo más que debamos saber? <span style={{ color: '#6B6B6B' }}>(opcional)</span>
          </label>
          <textarea
            data-input
            id={id('mensaje')}
            name="mensaje"
            rows={3}
            placeholder="Si has llevado ortodoncia antes, si te corre prisa, si vienes por alguien de la familia…"
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
              accentColor: '#E76B0B',
              ...(errores.rgpd ? { outline: '2px solid #B3261E', outlineOffset: 2 } : {}),
            }}
          />
          <span>
            He leído y acepto la{' '}
            <a href="/politica-de-privacidad/" style={{ color: '#E76B0B', fontWeight: 500, textDecoration: 'underline' }}>
              Política de Privacidad
            </a>{' '}
            y el{' '}
            <a href="/aviso-legal/" style={{ color: '#E76B0B', fontWeight: 500, textDecoration: 'underline' }}>
              Aviso Legal
            </a>
            . Tus datos los trata MASTER SMILE S.L. solo para responderte.
            <Obligatorio />
          </span>
        </label>
        {errores.rgpd && (
          <p id={id('e-rgpd')} style={ESTILO_ERROR}>
            {ERRORES.rgpd}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <button
            type="submit"
            data-primary
            disabled={enviando}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 56,
              padding: '0 32px',
              borderRadius: 9999,
              background: '#E76B0B',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 18.66,
              fontWeight: 600,
              cursor: enviando ? 'progress' : 'pointer',
              opacity: enviando ? 0.7 : 1,
            }}
          >
            {enviando ? 'Enviando…' : 'Enviar'}
            <span data-arrow style={{ display: 'inline-block', transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)' }}>
              →
            </span>
          </button>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#1A1A1A' }}>
            Primera visita gratuita, sin compromiso.
            <br />o llámanos al{' '}
            <a href={`tel:${telefonoE164}`} style={{ color: '#E76B0B', fontWeight: 500 }}>
              {telefono}
            </a>
          </p>
        </div>
      </form>

      {aviso && <Aviso key={aviso.id} aviso={aviso} alCerrar={() => setAviso(null)} />}
    </>
  );
}
