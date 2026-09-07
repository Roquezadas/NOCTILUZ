import { browserSupabase } from '@/lib/supabase/browser';
import { fromRow, toRow } from './mapper';
import { validatePoem, type PoemInput } from './validation';
import type { Poem } from '@/types/poem';
export function operationError(error: { code?: string; message?: string }) {
  if (error.code === '23505')
    return 'Este endereço já pertence a outro poema. Escolha outro.';
  if (error.code === '42501' || error.code === 'PGRST301')
    return 'Sua sessão expirou ou não permite esta ação. Entre novamente.';
  if (error.code === '23514')
    return 'Revise os campos do poema antes de continuar.';
  return 'Não foi possível concluir. Verifique sua conexão e tente novamente.';
}
export async function listAuthorPoems() {
  const client = await browserSupabase();
  const poems: Poem[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from('poems')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error(operationError(error));
    poems.push(...data.map(fromRow));
    if (data.length < 500) break;
  }
  return poems;
}
export async function readAuthorPoem(id: string) {
  const client = await browserSupabase();
  const { data, error } = await client
    .from('poems')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(operationError(error));
  if (!data)
    throw new Error(
      'Este poema não foi encontrado ou não está disponível para sua conta.',
    );
  return fromRow(data);
}
export async function saveAuthorPoem(input: PoemInput, existing?: Poem) {
  if (Object.keys(validatePoem(input)).length)
    throw new Error('Revise os campos indicados.');
  const client = await browserSupabase();
  const row = toRow(input, existing?.id ?? crypto.randomUUID());
  const query = existing
    ? client
        .from('poems')
        .update(row)
        .eq('id', existing.id)
        .eq('updated_at', existing.updatedAt ?? '')
    : client.from('poems').insert(row);
  const { data, error } = await query.select('*').maybeSingle();
  if (error) throw new Error(operationError(error));
  if (!data)
    throw new Error(
      'Este poema mudou em outra janela. Reabra-o antes de salvar; seus versos continuam no editor.',
    );
  return fromRow(data);
}
export async function deleteAuthorPoem(poem: Poem) {
  const client = await browserSupabase();
  const { data, error } = await client
    .from('poems')
    .delete()
    .eq('id', poem.id)
    .eq('updated_at', poem.updatedAt ?? '')
    .select('id');
  if (error) throw new Error(operationError(error));
  if (!data.length)
    throw new Error(
      'O poema mudou em outra janela. Atualize a lista antes de excluir.',
    );
}
export async function duplicateAuthorPoem(poem: Poem) {
  return saveAuthorPoem({
    ...poem,
    title: `${poem.title.slice(0, 225)} (cópia)`,
    slug: `${poem.slug.slice(0, 115)}-copia-${crypto.randomUUID().slice(0, 8)}`,
    status: 'draft',
    publishAt: null,
    featured: false,
    featuredOrder: 0,
  });
}
