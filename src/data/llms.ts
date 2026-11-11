// llms.txt en segmentos: el texto vive en llms-base.txt y los datos de contacto
// editables se rellenan desde site.ts. Así el teléfono sale de un solo sitio y el
// modo edición puede regenerar el archivo al publicar (Contenido.php → aplicarLlms).
import base from './llms-base.txt?raw';
import { CONTACTO } from './site';
import { c, type Segmento } from '../lib/cms';

const CAMPOS: Record<string, string> = {
  'contacto.telefono': CONTACTO.telefono,
  'contacto.whatsapp': CONTACTO.whatsapp,
  'contacto.email': CONTACTO.email,
};

export const LLMS: Segmento[] = base.split(/(\{[a-z.]+\})/).map((trozo) => {
  const clave = trozo.match(/^\{([a-z.]+)\}$/)?.[1];
  if (!clave) return trozo;
  if (!(clave in CAMPOS)) throw new Error(`llms-base.txt: marcador desconocido {${clave}}`);
  return c(clave, CAMPOS[clave]);
});
