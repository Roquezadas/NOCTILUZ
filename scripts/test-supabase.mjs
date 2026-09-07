// Opt-in integration: use a disposable Supabase project, never a production account.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const names = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_TEST_AUTHOR_EMAIL',
  'SUPABASE_TEST_AUTHOR_PASSWORD',
  'SUPABASE_TEST_READER_EMAIL',
  'SUPABASE_TEST_READER_PASSWORD',
];
if (
  process.env.SUPABASE_TEST_ALLOW_WRITES !== 'yes' ||
  names.some((name) => !process.env[name])
)
  throw new Error(
    'Teste opt-in: configure as variáveis de teste em docs/SUPABASE.md.',
  );
const client = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
const anon = client();
const reader = client();
const author = client();
const id = `integration-${crypto.randomUUID()}`;
const slug = id;
const checkError = (error, step) =>
  assert.equal(error, null, `${step}: ${error?.code ?? 'falha'}`);
try {
  checkError(
    (
      await author.auth.signInWithPassword({
        email: process.env.SUPABASE_TEST_AUTHOR_EMAIL,
        password: process.env.SUPABASE_TEST_AUTHOR_PASSWORD,
      })
    ).error,
    'Login autor',
  );
  checkError(
    (
      await reader.auth.signInWithPassword({
        email: process.env.SUPABASE_TEST_READER_EMAIL,
        password: process.env.SUPABASE_TEST_READER_PASSWORD,
      })
    ).error,
    'Login leitor',
  );
  const {
    data: { user },
  } = await reader.auth.getUser();
  assert.ok(
    (await reader.from('admin_users').insert({ user_id: user.id })).error,
    'Leitor não pode se promover',
  );
  checkError(
    (
      await author.from('poems').insert({
        id,
        slug,
        title: 'Teste descartável de integração',
        content: '  verso um\n\n    verso dois  ',
        status: 'draft',
      })
    ).error,
    'Criar rascunho',
  );
  const hidden = async () => {
    for (const c of [anon, reader]) {
      const { data, error } = await c.from('poems').select('*').eq('id', id);
      checkError(error, 'Leitura pública');
      assert.equal(data.length, 0);
    }
  };
  await hidden();
  assert.ok(
    (await anon.from('poems').insert({ id: `${id}-anon`, title: 'negado' }))
      .error,
  );
  assert.ok(
    (await reader.from('poems').insert({ id: `${id}-reader`, title: 'negado' }))
      .error,
  );
  assert.equal(
    (
      await reader
        .from('poems')
        .update({ title: 'negado' })
        .eq('id', id)
        .select()
    ).data?.length,
    0,
  );
  assert.equal(
    (await reader.from('poems').delete().eq('id', id).select()).data?.length,
    0,
  );
  checkError(
    (
      await author
        .from('poems')
        .update({
          status: 'published',
          publish_at: new Date(Date.now() + 86400000).toISOString(),
        })
        .eq('id', id)
    ).error,
    'Agendar',
  );
  await hidden();
  const origin = process.env.NOCTILUZ_TEST_URL;
  if (origin)
    assert.equal(
      (await fetch(`${origin}/poemas/${slug}`)).status,
      404,
      'Agendamento privado na rota pública',
    );
  checkError(
    (
      await author
        .from('poems')
        .update({ publish_at: new Date(Date.now() - 60000).toISOString() })
        .eq('id', id)
    ).error,
    'Publicar',
  );
  const { data: visible, error } = await anon
    .from('poems')
    .select('*')
    .eq('id', id)
    .single();
  checkError(error, 'Poema público');
  assert.equal(visible.content, '  verso um\n\n    verso dois  ');
  if (origin) {
    assert.equal(
      (await fetch(`${origin}/poemas/${slug}`)).status,
      200,
      'Novo slug sem build',
    );
    assert.ok(
      (await (await fetch(`${origin}/sitemap.xml`)).text()).includes(slug),
    );
  }
  checkError((await author.auth.refreshSession()).error, 'Renovar sessão');
  checkError(
    (
      await author
        .from('poems')
        .update({ status: 'draft', publish_at: null })
        .eq('id', id)
    ).error,
    'Despublicar',
  );
  await hidden();
  if (origin) {
    assert.equal((await fetch(`${origin}/poemas/${slug}`)).status, 404);
    assert.ok(
      !(await (await fetch(`${origin}/sitemap.xml`)).text()).includes(slug),
    );
  }
  console.log(
    'Integração real: Auth, renovação, RLS, CRUD e publicação passaram.',
  );
} finally {
  const { error } = await author.from('poems').delete().eq('id', id);
  if (error)
    console.error(
      `Remova manualmente o registro de teste ${id}; a limpeza falhou.`,
    );
  await author.auth.signOut();
  await reader.auth.signOut();
}
