export interface PublicContentConfig {
  source: 'static' | 'supabase';
  url: string;
  key: string;
  configured: boolean;
}
export function isPublicKey(key: string) {
  if (key.startsWith('sb_publishable_')) return true;
  try {
    const part = key.split('.')[1];
    const payload: unknown = JSON.parse(
      atob(part.replaceAll('-', '+').replaceAll('_', '/')),
    );
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'role' in payload &&
      payload.role === 'anon'
    );
  } catch {
    return false;
  }
}
export function contentConfig(
  values: Record<string, string | undefined>,
): PublicContentConfig {
  const source = values.CONTENT_SOURCE || 'static';
  if (source !== 'static' && source !== 'supabase')
    throw new Error('CONTENT_SOURCE deve ser static ou supabase.');
  const url = values.SUPABASE_URL || '';
  const key = values.SUPABASE_PUBLISHABLE_KEY || '';
  if (key && !isPublicKey(key))
    throw new Error('Use somente uma chave publishable ou anon.');
  if (url) {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' &&
      !(
        parsed.protocol === 'http:' &&
        ['localhost', '127.0.0.1'].includes(parsed.hostname)
      )
    )
      throw new Error('URL Supabase inválida.');
  }
  return { source, url, key, configured: !!url && !!key };
}
