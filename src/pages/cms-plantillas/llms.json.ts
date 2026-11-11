// Plantilla de llms.txt para el modo edición. Bloqueada a la web por .htaccess.
import { LLMS } from '../../data/llms';

export const GET = () => new Response(JSON.stringify(LLMS), { headers: { 'Content-Type': 'application/json' } });
