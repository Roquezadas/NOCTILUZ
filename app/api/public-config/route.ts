import { getContentConfig } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return Response.json(await getContentConfig(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { error: 'Configuração do jardim inválida.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
