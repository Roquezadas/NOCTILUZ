import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { contentConfig } from './config';
export async function getContentConfig() {
  const runtime: Record<string, string | undefined> = {};
  try {
    const { env } = await import('cloudflare:workers');
    const bindings = env as unknown as Record<string, unknown>;
    for (const key of [
      'CONTENT_SOURCE',
      'SUPABASE_URL',
      'SUPABASE_PUBLISHABLE_KEY',
    ])
      if (typeof bindings[key] === 'string') runtime[key] = bindings[key];
  } catch {
    /* Node prerender uses only the explicit environment below. */
  }
  return contentConfig({ ...process.env, ...runtime });
}
export async function publicSupabase() {
  const config = await getContentConfig();
  if (!config.configured)
    throw new Error('O acervo Supabase não está configurado.');
  return createClient<Database>(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
