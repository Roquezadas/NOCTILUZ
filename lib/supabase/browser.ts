import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { PublicContentConfig } from './config';
import { contentConfig } from './config';
let source: 'static' | 'supabase' = 'static';
export function authorContentSource() {
  return source;
}
let client: SupabaseClient<Database> | undefined;
export async function browserSupabase() {
  if (client) return client;
  const response = await fetch('/api/public-config', { cache: 'no-store' });
  if (!response.ok)
    throw new Error('Não foi possível carregar a configuração do jardim.');
  const data: PublicContentConfig = await response.json();
  const config = contentConfig({
    CONTENT_SOURCE: data.source,
    SUPABASE_URL: data.url,
    SUPABASE_PUBLISHABLE_KEY: data.key,
  });
  source = config.source;
  if (!config.configured)
    throw new Error('O Jardim do Autor ainda não está conectado ao Supabase.');
  client = createClient<Database>(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'noctiluz:author-session',
    },
  });
  return client;
}
