import { useRef, useState } from "react";

import apinamientoAntes from "../assets/sonris/casos/Apinamiento-severo-Interna-Inicio-16-9.webp";
import apinamientoDespues from "../assets/sonris/casos/Apinamiento-severo-Interna-Final-16-9.webp";
import diastemaAntes from "../assets/sonris/casos/Diastema-y-mordida-profunda-Interna-Inicio-16-9.webp";
import diastemaDespues from "../assets/sonris/casos/Diastema-y-mordida-profunda-Interna-Final-16-9.webp";
import abiertaAntes from "../assets/sonris/casos/Mordida-abierta-Interno-Inicio-16-9.webp";
import abiertaDespues from "../assets/sonris/casos/Mordida-abierta-Interno-Final-16-9.webp";
import profundaAntes from "../assets/sonris/casos/Mordida-profunda-Interna-Inicio-16-9.webp";
import profundaDespues from "../assets/sonris/casos/Mordida-profunda-Interna-Final-16-9.webp";
import cruzadaAntes from "../assets/sonris/casos/Apinamiento-Mordida-profunda-y-mordida-cruzada-Interna-Inicio-16-9.webp";
import cruzadaDespues from "../assets/sonris/casos/Apinamiento-Mordida-profunda-y-mordida-cruzada-Interna-Final-16-9.webp";

const CASOS = [
  {
    etiqueta: "Apiñamiento severo",
    descripcion:
      "Los dientes llegaban montados y girados, sin sitio en la arcada. Al terminar, cada pieza ocupa su lugar y los contactos son regulares.",
    antes: apinamientoAntes.src,
    despues: apinamientoDespues.src,
    altAntes:
      "Boca antes del tratamiento: apiñamiento severo con dientes superiores e inferiores montados y girados.",
    altDespues:
      "La misma boca al terminar: arcadas alineadas y contactos regulares entre dientes.",
  },
  {
    etiqueta: "Diastema y mordida profunda",
    descripcion:
      "Un hueco entre los incisivos de arriba y una mordida que tapaba los de abajo. Cerré el espacio y devolví el solapamiento a su altura.",
    antes: diastemaAntes.src,
    despues: diastemaDespues.src,
    altAntes:
      "Boca antes del tratamiento: hueco entre los incisivos superiores y mordida profunda que tapa los dientes inferiores.",
    altDespues:
      "La misma boca al terminar: diastema cerrado y mordida con solapamiento normal.",
  },
  {
    etiqueta: "Mordida abierta",
    descripcion:
      "Los dientes de delante no llegaban a tocarse al morder. Ahora contactan, que es lo que permite cortar la comida con ellos.",
    antes: abiertaAntes.src,
    despues: abiertaDespues.src,
    altAntes:
      "Boca antes del tratamiento: los dientes de delante no llegan a tocarse al morder.",
    altDespues:
      "La misma boca al terminar: los incisivos superiores e inferiores contactan al morder.",
  },
  {
    etiqueta: "Mordida profunda",
    descripcion:
      "Los dientes de arriba cubrían casi por completo a los de abajo. Abrí la mordida hasta dejar los inferiores a la vista.",
    antes: profundaAntes.src,
    despues: profundaDespues.src,
    altAntes:
      "Boca antes del tratamiento: los dientes superiores cubren casi por completo a los inferiores.",
    altDespues:
      "La misma boca al terminar: mordida abierta a una altura normal, con los inferiores visibles.",
  },
  {
    etiqueta: "Apiñamiento y mordida cruzada",
    descripcion:
      "Apiñamiento abajo, mordida profunda y piezas cruzadas, las tres cosas a la vez. Se corrigieron en el mismo tratamiento.",
    antes: cruzadaAntes.src,
    despues: cruzadaDespues.src,
    altAntes:
      "Boca antes del tratamiento: apiñamiento inferior, mordida profunda y piezas cruzadas.",
    altDespues:
      "La misma boca al terminar: dientes alineados y mordida corregida sin cruces.",
  },
];

/** Comparador antes/después con casos reales. Arrastre con puntero y flechas del teclado. */
export default function AntesDespues() {
  const [corte, setCorte] = useState(50);
  const [caso, setCaso] = useState(0);
  const arrastrando = useRef(false);
  const caja = useRef<HTMLDivElement>(null);
  const actual = CASOS[caso];

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

  const foto: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
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
    <>
      {/* El selector comparte fila con el título: ocupa el sitio de la antigua
          entradilla y se ve antes de llegar al comparador. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
        <h2
          data-h2-grande
          id="casos-t"
          style={{
            margin: 0,
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#000000',
            maxWidth: '20ch',
          }}
        >
          Sonrisas que he cambiado
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
          {CASOS.map((c, i) => (
            <button
              key={c.etiqueta}
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
              {c.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div data-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: 40, alignItems: 'start' }}>
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
              aspectRatio: '16/9',
              borderRadius: 40,
              overflow: 'hidden',
              background: '#EFEFEF',
              boxShadow: '0 4px 12px rgba(0,0,0,.06),0 24px 56px rgba(0,0,0,.10)',
              touchAction: 'none',
              cursor: 'ew-resize',
            }}
          >
            <img src={actual.despues} alt={actual.altDespues} loading="lazy" decoding="async" style={foto} />
            {/* clip-path revela el "antes" sin reescalar la foto */}
            <img
              src={actual.antes}
              alt={actual.altAntes}
              loading="lazy"
              decoding="async"
              style={{ ...foto, clipPath: `inset(0 ${100 - corte}% 0 0)` }}
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
              aria-label={`Comparar antes y después: ${actual.etiqueta}`}
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
        </div>

        <aside
          style={{
            background: '#FFFFFF',
            borderRadius: 40,
            padding: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,.04),0 12px 32px rgba(0,0,0,.06)',
          }}
        >
          {/* aria-live: quien navega con lector de pantalla oye el caso al cambiarlo. */}
          <div aria-live="polite">
            <h3
              style={{
                margin: '0 0 12px',
                fontFamily: 'Poppins, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: '-0.02em',
                color: '#000000',
              }}
            >
              {actual.etiqueta}
            </h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#6B6B6B' }}>{actual.descripcion}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '20px 0' }} />
          <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.7, color: '#6B6B6B' }}>
            Cada boca es distinta. Los casos que ves aquí se publican con el consentimiento firmado de cada paciente:
            ninguno anticipa tu resultado, el tuyo se valora en la primera visita y con las pruebas delante.
          </p>
          <a
            data-underline
            href="/sobre-nosotros/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 500, color: '#1A1A1A' }}
          >
            Conoce el resto del equipo <span>→</span>
          </a>
        </aside>
      </div>
    </>
  );
}
