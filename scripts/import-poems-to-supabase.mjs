// Local-only entrypoint. Never imported by the application or invoked by build.
import { readFile, readdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { validatePoem } from '../lib/poems/validation.ts';
import { toRow } from '../lib/poems/mapper.ts';
const args = new Set(process.argv.slice(2));
for (const arg of args)
  if (
    ![
      '--dry-run',
      '--apply',
      '--include-demo',
      '--overwrite',
      '--publish',
    ].includes(arg)
  )
    throw new Error(`Opção desconhecida: ${arg}`);
if (args.has('--dry-run') && args.has('--apply'))
  throw new Error('Escolha --dry-run ou --apply.');
const apply = args.has('--apply');
const rows = [];
const ids = new Set();
const slugs = new Set();
for (const file of (await readdir('content/poems'))
  .filter((name) => name.endsWith('.json'))
  .sort()) {
  const poem = JSON.parse(await readFile(`content/poems/${file}`, 'utf8'));
  if (poem.demo && !args.has('--include-demo')) {
    console.log(`${file}: demonstração ignorada`);
    continue;
  }
  if (
    typeof poem.id !== 'string' ||
    !poem.id ||
    poem.id.length > 100 ||
    ids.has(poem.id)
  )
    throw new Error(`${file}: ID ausente ou duplicado`);
  if (poem.slug && slugs.has(poem.slug))
    throw new Error(`${file}: slug duplicado`);
  const input = {
    ...poem,
    status: args.has('--publish') ? 'published' : 'draft',
    publishAt: args.has('--publish') ? new Date().toISOString() : null,
    featuredOrder: poem.featuredOrder ?? 0,
  };
  const errors = validatePoem(input);
  if (Object.keys(errors).length)
    throw new Error(`${file}: ${JSON.stringify(errors)}`);
  rows.push(toRow(input, poem.id));
  ids.add(poem.id);
  if (poem.slug) slugs.add(poem.slug);
}
console.log(
  `${rows.length} poemas válidos. Destino editorial: ${args.has('--publish') ? 'publicados agora' : 'rascunhos'}.`,
);
if (!rows.length) process.exit(0);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_IMPORT_KEY;
if (!url || !key) {
  if (apply)
    throw new Error(
      'Defina SUPABASE_URL e SUPABASE_IMPORT_KEY apenas neste terminal.',
    );
  console.log(
    'Dry-run local: nenhum acesso ao banco. Configure as variáveis para também verificar conflitos remotos.',
  );
  process.exit(0);
}
const client = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
// Preflight all conflicts before the first write. Never change a different ID to reuse its slug.
for (const row of rows) {
  const { data: idMatch, error: idError } = await client
    .from('poems')
    .select('id')
    .eq('id', row.id)
    .maybeSingle();
  if (idError) throw new Error('Falha ao verificar IDs no banco.');
  if (idMatch && !args.has('--overwrite'))
    throw new Error(
      `ID ${row.id} já existe. Nada importado; --overwrite permite atualizar esse mesmo ID.`,
    );
  if (row.slug) {
    const { data, error } = await client
      .from('poems')
      .select('id')
      .eq('slug', row.slug)
      .maybeSingle();
    if (error) throw new Error('Falha ao verificar slugs.');
    if (data && data.id !== row.id)
      throw new Error(`Slug ${row.slug} pertence a outro ID. Nada importado.`);
  }
}
if (!apply) {
  console.log('Dry-run: conflitos verificados; nenhum registro alterado.');
  process.exit(0);
}
const { error } = args.has('--overwrite')
  ? await client.from('poems').upsert(rows, { onConflict: 'id' })
  : await client.from('poems').insert(rows);
if (error)
  throw new Error(
    `Importação recusada (${error.code}). Nenhuma chave foi registrada; verifique constraints e concorrência.`,
  );
console.log(`${rows.length} poemas importados; IDs e versos preservados.`);
