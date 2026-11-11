import { medir } from '../scripts/analitica';
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Aviso, { type AvisoDatos } from './Aviso';

type Canal = 'whatsapp' | 'correo';
type Campo = 'nombre' | 'contacto' | 'motivos' | 'rgpd';

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
 *  paciente. Va en botones porque escribirlo cuesta y elegirlo no, y admite
 *  varias: casi nadie viene por una sola cosa. */
const MOTIVOS = [
  'Alinearme los dientes',
  'Corregirme la mordida',
  'Ortodoncia para un hijo',
  'El color o la forma',
  'Recuperar un diente',
  'Encías o limpieza',
  'Una revisión o una molestia',
  'Una segunda opinión',
  'No lo sé',
];

/** Marcarlo descarta el resto, y marcar cualquier otro lo descarta a él: en el
 *  aviso que llega a clínica, «no lo sé» junto a tres motivos no dice nada. */
const NINGUNO = 'No lo sé';

const ERRORES: Record<Campo, string> = {
  nombre: '⚠ Escribe tu nombre para que sepamos con quién hablamos.',
  contacto: '⚠ Revisa el dato: necesitamos por dónde contestarte.',
  motivos: '⚠ Elige con qué vienes: es lo que nos sirve para prepararte la visita.',
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

// Textos fijos del formulario en inglés, por su frase española exacta. Los
// motivos se envían en español: es lo que lee la clínica.
const EN: Record<string, string> = {
  WhatsApp: 'WhatsApp',
  Correo: 'Email',
  'Te escribimos al número que nos dejes.': 'We will message the number you give us.',
  'Te contestamos al email que nos dejes.': 'We will reply to the email you give us.',
  'Alinearme los dientes': 'Straighten my teeth',
  'Corregirme la mordida': 'Correct my bite',
  'Ortodoncia para un hijo': 'Orthodontics for my child',
  'El color o la forma': 'Tooth colour or shape',
  'Recuperar un diente': 'Replace a tooth',
  'Encías o limpieza': 'Gums or a clean',
  'Una revisión o una molestia': 'A check-up or some discomfort',
  'Una segunda opinión': 'A second opinion',
  'No lo sé': 'I am not sure',
  '⚠ Escribe tu nombre para que sepamos con quién hablamos.': '⚠ Tell us your name so we know who we are talking to.',
  '⚠ Revisa el dato: necesitamos por dónde contestarte.': '⚠ Check this: we need a way to reply to you.',
  '⚠ Elige con qué vienes: es lo que nos sirve para prepararte la visita.': '⚠ Choose what you are coming for: it helps us prepare your visit.',
  '⚠ Marca la casilla para que podamos tratar tus datos y contestarte.': '⚠ Tick the box so we can process your details and reply to you.',
  '¿Por dónde te contestamos?': 'How should we reply?',
  '¿Cómo te llamas?': 'What is your name?',
  'Tu nombre': 'Your name',
  '¿A qué número te escribimos?': 'Which number should we message?',
  '¿A qué correo te contestamos?': 'Which email should we reply to?',
  'tu@email.com': 'you@email.com',
  '¿Con qué vienes?': 'What are you coming for?',
  '(las que quieras)': '(choose any)',
  '¿Algo más que debamos saber?': 'Anything else we should know?',
  '(opcional)': '(optional)',
  'Si has llevado ortodoncia antes, si te corre prisa, si vienes por alguien de la familia…':
    'If you have had orthodontics before, if you are in a hurry, if you are coming for a family member…',
  'He leído y acepto la': 'I have read and accept the',
  'Política de Privacidad': 'Privacy Policy',
  'y el': 'and the',
  'Aviso Legal': 'Legal Notice',
  '. Tus datos los trata MASTER SMILE S.L. solo para responderte.': '. Your details are processed by MASTER SMILE S.L. only to reply to you.',
  'Enviando…': 'Sending…',
  'Quiero mi primera visita GRATUITA': 'I want my FREE first visit',
  'No se ha enviado': 'Not sent',
  'El formulario no está configurado': 'The form is not set up',
  'Mensaje enviado': 'Message sent',
  'No hemos podido enviarlo': 'We could not send it',
  'Ya nos ha llegado. Te escribimos por WhatsApp en horario de clínica, de 12:00 a 20:00.':
    'We have received it. We will message you on WhatsApp during clinic hours, 12:00 to 20:00.',
  'Ya nos ha llegado. Te contestamos por correo en horario de clínica, de 12:00 a 20:00.':
    'We have received it. We will reply by email during clinic hours, 12:00 to 20:00.',
};

const VACIO = { nombre: '', contacto: '', motivos: [] as string[], mensaje: '', rgpd: false };

export default function FormularioCita({
  email,
  telefono,
  origen,
  en = false,
}: {
  email: string;
  telefono: string;
  /** Página en inglés. */
  en?: boolean;
  /** Página desde la que se envía: viaja con el aviso para que en clínica
   *  sepan de qué venía la consulta. */
  origen: string;
}) {
  const tr = (es: string) => (en ? (EN[es] ?? es) : es);
  const rutaLegal = (es: string, ingles: string) => (en ? ingles : es);
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;

  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
  const [canal, setCanal] = useState<Canal>('whatsapp');
  const [enviando, setEnviando] = useState(false);
  const empezado = useRef(false);
  const [aviso, setAviso] = useState<AvisoDatos | null>(null);

  const porWhatsApp = canal === 'whatsapp';

  // El carrusel de planes enlaza aquí con ?plan=… El texto se recorta y se
  // aplana antes de entrar: acaba en un mensaje que el usuario ve y revisa.
  useEffect(() => {
    const plan = new URLSearchParams(location.search).get('plan')?.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (plan) {
      setValores((v) => ({ ...v, motivos: [MOTIVOS[0]], mensaje: en ? `I am interested in the ${plan} plan.` : `Me interesa el plan ${plan}.` }));
    }
  }, []);

  const valida = (c: Campo): boolean => {
    switch (c) {
      case 'nombre':
        return valores.nombre.trim().length > 1;
      case 'contacto':
        return porWhatsApp ? valores.contacto.replace(/\D/g, '').length >= 9 : /.+@.+\..+/.test(valores.contacto);
      case 'motivos':
        return valores.motivos.length > 0;
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

    const primero = revisar(['nombre', 'contacto', 'motivos', 'rgpd']);
    if (primero) {
      enfocar(primero);
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: tr('No se ha enviado'),
        texto: en
          ? `Some details need checking and we have marked them on the form. Nothing has been sent. If you prefer, call us on ${telefono}.`
          : `Faltan datos por revisar y los hemos marcado en el formulario. Nada ha salido de aquí. Si lo prefieres, llámanos al ${telefono}.`,
      });
      return;
    }

    if (!FORMSPREE) {
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: tr('El formulario no está configurado'),
        texto: en
          ? `We cannot take your message right now. Write to ${email} or call us on ${telefono} and we will help you just the same.`
          : `No podemos recoger tu mensaje ahora mismo. Escríbenos a ${email} o llámanos al ${telefono} y te atendemos igual.`,
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
          vengo_por: valores.motivos.join(', '),
          mensaje: valores.mensaje.trim(),
          origen,
          idioma: en ? 'Inglés' : 'Español',
          _subject: `Cita en Sonris · ${valores.nombre.trim()}`,
        }),
      });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      medir('form_submit', { form_id: 'formulario-cita', form_location: origen });

      setValores(VACIO);
      setAviso({
        id: Date.now(),
        tono: 'ok',
        titulo: tr('Mensaje enviado'),
        texto: porWhatsApp
          ? tr('Ya nos ha llegado. Te escribimos por WhatsApp en horario de clínica, de 12:00 a 20:00.')
          : tr('Ya nos ha llegado. Te contestamos por correo en horario de clínica, de 12:00 a 20:00.'),
      });
    } catch {
      setAviso({
        id: Date.now(),
        tono: 'error',
        titulo: tr('No hemos podido enviarlo'),
        texto: en
          ? `The connection failed and your message was not sent. Try again, write to ${email} or call us on ${telefono}.`
          : `Ha fallado la conexión y tu mensaje no ha salido. Vuelve a intentarlo, escríbenos a ${email} o llámanos al ${telefono}.`,
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
        // form_start una sola vez: al primer foco dentro del formulario.
        onFocusCapture={() => {
          if (empezado.current) return;
          empezado.current = true;
          medir('form_start', { form_id: 'formulario-cita', form_location: origen });
        }}
        data-peach
        data-caja
        data-textura
        // El velo que espera [data-textura]: mismo melocotón que el fondo, al
        // 90%, para que el patrón asome sin restar contraste a los campos.
        style={{ background: '#FEE1CB', borderRadius: 40, padding: 44, ['--velo' as string]: 'rgba(254,225,203,0.9)' }}
      >
        {/* Cepo de Formspree: sin CSS que lo esconda, un bot lo rellena y el
            envío se descarta. Fuera del orden de tabulación. */}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />

        <fieldset style={{ border: 'none', margin: '0 0 24px', padding: 0 }}>
          <legend style={{ ...ESTILO_ETIQUETA, padding: 0 }}>{tr('¿Por dónde te contestamos?')}</legend>
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
                {tr(c.etiqueta)}
                <span className="vh">. {tr(c.ayuda)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('nombre')} style={ESTILO_ETIQUETA}>
            {tr('¿Cómo te llamas?')}
            <Obligatorio />
          </label>
          <input
            data-input
            id={id('nombre')}
            name="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder={tr('Tu nombre')}
            value={valores.nombre}
            onChange={(e) => setValores((v) => ({ ...v, nombre: e.target.value }))}
            onBlur={() => revisar(['nombre'])}
            aria-invalid={errores.nombre ? 'true' : 'false'}
            aria-describedby={errores.nombre ? id('e-nombre') : undefined}
            style={ESTILO_INPUT(!!errores.nombre)}
          />
          {errores.nombre && (
            <p id={id('e-nombre')} style={ESTILO_ERROR}>
              {tr(ERRORES.nombre)}
            </p>
          )}
        </div>

        {/* Un solo dato de contacto: el del canal elegido. */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('contacto')} style={ESTILO_ETIQUETA}>
            {tr(porWhatsApp ? '¿A qué número te escribimos?' : '¿A qué correo te contestamos?')}
            <Obligatorio />
          </label>
          <input
            data-input
            id={id('contacto')}
            name={porWhatsApp ? 'telefono' : 'email'}
            type={porWhatsApp ? 'tel' : 'email'}
            required
            autoComplete={porWhatsApp ? 'tel' : 'email'}
            placeholder={porWhatsApp ? '600 000 000' : tr('tu@email.com')}
            value={valores.contacto}
            onChange={(e) => setValores((v) => ({ ...v, contacto: e.target.value }))}
            onBlur={() => valores.contacto && revisar(['contacto'])}
            aria-invalid={errores.contacto ? 'true' : 'false'}
            aria-describedby={errores.contacto ? id('e-contacto') : undefined}
            style={ESTILO_INPUT(!!errores.contacto)}
          />
          {errores.contacto && (
            <p id={id('e-contacto')} style={ESTILO_ERROR}>
              {tr(ERRORES.contacto)}
            </p>
          )}
        </div>

        <fieldset style={{ border: 'none', margin: '0 0 24px', padding: 0 }}>
          <legend style={{ ...ESTILO_ETIQUETA, padding: 0 }}>
            {tr('¿Con qué vienes?')} <span style={{ color: '#6B6B6B', fontWeight: 400 }}>{tr('(las que quieras)')}</span>
            <Obligatorio />
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {MOTIVOS.map((m, i) => (
              <label key={m} style={ESTILO_PILDORA(valores.motivos.includes(m))}>
                <input
                  // El id va en el primero para que el foco del error caiga aquí.
                  id={i === 0 ? id('motivos') : undefined}
                  type="checkbox"
                  value={m}
                  checked={valores.motivos.includes(m)}
                  onChange={() =>
                    setValores((v) => ({
                      ...v,
                      motivos: v.motivos.includes(m)
                        ? v.motivos.filter((x) => x !== m)
                        : m === NINGUNO
                          ? [m]
                          : [...v.motivos.filter((x) => x !== NINGUNO), m],
                    }))
                  }
                  aria-invalid={errores.motivos ? 'true' : 'false'}
                  aria-describedby={errores.motivos ? id('e-motivos') : undefined}
                  style={{ width: 20, height: 20, accentColor: '#E76B0B', margin: 0 }}
                />
                {tr(m)}
              </label>
            ))}
          </div>
          {errores.motivos && (
            <p id={id('e-motivos')} style={ESTILO_ERROR}>
              {tr(ERRORES.motivos)}
            </p>
          )}
        </fieldset>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor={id('mensaje')} style={ESTILO_ETIQUETA}>
            {tr('¿Algo más que debamos saber?')} <span style={{ color: '#6B6B6B' }}>{tr('(opcional)')}</span>
          </label>
          <textarea
            data-input
            id={id('mensaje')}
            name="mensaje"
            rows={3}
            placeholder={tr('Si has llevado ortodoncia antes, si te corre prisa, si vienes por alguien de la familia…')}
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
            {tr('He leído y acepto la')}{' '}
            <a href={rutaLegal('/politica-de-privacidad/', '/en/privacy-policy/')} style={{ color: '#E76B0B', fontWeight: 500, textDecoration: 'underline' }}>
              {tr('Política de Privacidad')}
            </a>{' '}
            {tr('y el')}{' '}
            <a href={rutaLegal('/aviso-legal/', '/en/legal-notice/')} style={{ color: '#E76B0B', fontWeight: 500, textDecoration: 'underline' }}>
              {tr('Aviso Legal')}
            </a>
            {tr('. Tus datos los trata MASTER SMILE S.L. solo para responderte.')}
            <Obligatorio />
          </span>
        </label>
        {errores.rgpd && (
          <p id={id('e-rgpd')} style={ESTILO_ERROR}>
            {tr(ERRORES.rgpd)}
          </p>
        )}

        <button
          type="submit"
          data-primary
          disabled={enviando}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Ancho completo: es la única acción del formulario y ya no
            // comparte fila con ningún texto.
            width: '100%',
            marginTop: 32,
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
          {tr(enviando ? 'Enviando…' : 'Quiero mi primera visita GRATUITA')}
        </button>
      </form>

      {aviso && <Aviso key={aviso.id} aviso={aviso} alCerrar={() => setAviso(null)} />}
    </>
  );
}
