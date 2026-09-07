import 'server-only';
import { publicSupabase } from '@/lib/supabase/server';
import { fromRow } from './mapper';
import type { Poem } from '@/types/poem';
export async function publishedPoems() {
  const client = await publicSupabase();
  const result: Poem[] = [];
  const now = new Date().toISOString();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from('poems')
      .select('*')
      .eq('status', 'published')
      .lte('publish_at', now)
      .order('poem_date', { ascending: false })
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error('O acervo está temporariamente indisponível.');
    result.push(...data.map(fromRow));
    if (data.length < 500) break;
  }
  return result;
}
