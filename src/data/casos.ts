// Casos antes/después de la página de la Dra. Vélez, publicados con el
// consentimiento firmado de cada paciente. Los pinta src/components/AntesDespues.astro.
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

export const CASOS = [
  {
    etiqueta: "Apiñamiento severo",
    descripcion:
      "Los dientes llegaban montados y girados, sin sitio en la arcada. Al terminar, cada pieza ocupa su lugar y los contactos son regulares.",
    antes: apinamientoAntes,
    despues: apinamientoDespues,
    altAntes:
      "Boca antes del tratamiento: apiñamiento severo con dientes superiores e inferiores montados y girados.",
    altDespues:
      "La misma boca al terminar: arcadas alineadas y contactos regulares entre dientes.",
  },
  {
    etiqueta: "Diastema y mordida profunda",
    descripcion:
      "Un hueco entre los incisivos de arriba y una mordida que tapaba los de abajo. Cerré el espacio y devolví el solapamiento a su altura.",
    antes: diastemaAntes,
    despues: diastemaDespues,
    altAntes:
      "Boca antes del tratamiento: hueco entre los incisivos superiores y mordida profunda que tapa los dientes inferiores.",
    altDespues:
      "La misma boca al terminar: diastema cerrado y mordida con solapamiento normal.",
  },
  {
    etiqueta: "Mordida abierta",
    descripcion:
      "Los dientes de delante no llegaban a tocarse al morder. Ahora contactan, que es lo que permite cortar la comida con ellos.",
    antes: abiertaAntes,
    despues: abiertaDespues,
    altAntes:
      "Boca antes del tratamiento: los dientes de delante no llegan a tocarse al morder.",
    altDespues:
      "La misma boca al terminar: los incisivos superiores e inferiores contactan al morder.",
  },
  {
    etiqueta: "Mordida profunda",
    descripcion:
      "Los dientes de arriba cubrían casi por completo a los de abajo. Abrí la mordida hasta dejar los inferiores a la vista.",
    antes: profundaAntes,
    despues: profundaDespues,
    altAntes:
      "Boca antes del tratamiento: los dientes superiores cubren casi por completo a los inferiores.",
    altDespues:
      "La misma boca al terminar: mordida abierta a una altura normal, con los inferiores visibles.",
  },
  {
    etiqueta: "Apiñamiento y mordida cruzada",
    descripcion:
      "Apiñamiento abajo, mordida profunda y piezas cruzadas, las tres cosas a la vez. Se corrigieron en el mismo tratamiento.",
    antes: cruzadaAntes,
    despues: cruzadaDespues,
    altAntes:
      "Boca antes del tratamiento: apiñamiento inferior, mordida profunda y piezas cruzadas.",
    altDespues:
      "La misma boca al terminar: dientes alineados y mordida corregida sin cruces.",
  },
];

