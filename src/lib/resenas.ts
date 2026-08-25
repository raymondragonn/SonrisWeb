// Reseñas del perfil de Google, traídas en tiempo de compilación.
//
// Se resuelven una sola vez por build: el visitante recibe HTML plano, sin
// llamadas a Google desde su navegador y sin cookies de terceros. Como la
// política de Google no permite conservar las reseñas más de 30 días, basta
// con reconstruir el sitio dentro de ese plazo para mantenerlas al día.
//
// Variables de entorno (fichero .env en la raíz, nunca en el repositorio):
//   GOOGLE_PLACES_API_KEY  clave de Google Cloud con «Places API (New)» activada
//   GOOGLE_PLACE_ID        opcional; si falta, se busca por nombre y dirección
//
// Sin clave, `obtenerResenas()` devuelve null y la sección no se pinta.

import { SITE, CONTACTO } from '../data/site';

export type Resena = {
  autor: string;
  texto: string;
  estrellas: number;
  /** «hace 2 meses», tal y como lo devuelve Google en español. */
  fecha: string;
  /** Ficha del autor en Google Maps; la atribución es obligatoria. */
  url?: string;
};

export type Resenas = {
  media: number;
  total: number;
  perfil: string;
  lista: Resena[];
};

const CLAVE = import.meta.env.GOOGLE_PLACES_API_KEY;
const ID_FIJO = import.meta.env.GOOGLE_PLACE_ID;
const BASE = 'https://places.googleapis.com/v1';

type RespuestaLugar = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string; uri?: string };
  }[];
};

/** Busca la ficha por nombre y dirección cuando no se ha fijado el Place ID. */
async function buscarId(): Promise<string | null> {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': CLAVE,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({
      textQuery: `${SITE.nombre} ${CONTACTO.calle} ${CONTACTO.cp} ${CONTACTO.ciudad}`,
      languageCode: 'es',
    }),
  });
  if (!res.ok) return null;
  const datos = (await res.json()) as { places?: { id: string }[] };
  return datos.places?.[0]?.id ?? null;
}

export async function obtenerResenas(): Promise<Resenas | null> {
  if (!CLAVE) return null;

  try {
    const id = ID_FIJO || (await buscarId());
    if (!id) return null;

    const res = await fetch(`${BASE}/places/${id}?languageCode=es`, {
      headers: {
        'X-Goog-Api-Key': CLAVE,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
    });
    if (!res.ok) throw new Error(`Places API ${res.status}`);

    const lugar = (await res.json()) as RespuestaLugar;
    const lista: Resena[] = (lugar.reviews ?? [])
      .map((r) => ({
        autor: r.authorAttribution?.displayName ?? 'Paciente de Sonris',
        texto: (r.text?.text ?? r.originalText?.text ?? '').trim(),
        estrellas: r.rating ?? 5,
        fecha: r.relativePublishTimeDescription ?? '',
        url: r.authorAttribution?.uri,
      }))
      .filter((r) => r.texto.length > 0);

    if (!lista.length) return null;

    return {
      media: lugar.rating ?? 0,
      total: lugar.userRatingCount ?? 0,
      perfil: lugar.googleMapsUri ?? CONTACTO.mapsUrl,
      lista,
    };
  } catch (error) {
    // Un fallo de red o de cuota no puede tumbar el build: la sección se omite.
    console.warn('[resenas] no se han podido traer las reseñas de Google:', error);
    return null;
  }
}
