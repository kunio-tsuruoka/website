import { handleMicrocmsMcpRoute } from '@/lib/microcms-mcp-route';
import type { APIRoute } from 'astro';

export const prerender = false;

const handle: APIRoute = ({ request, locals }) => handleMicrocmsMcpRoute(request, locals);

export const GET = handle;
export const OPTIONS = handle;
