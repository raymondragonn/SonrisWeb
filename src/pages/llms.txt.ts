import { LLMS } from '../data/llms';
import { unir } from '../lib/cms';

export const GET = () => new Response(unir(LLMS), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
