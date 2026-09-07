import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://127.0.0.1:3001';
const unconfigured = process.argv.includes('--unconfigured-supabase');
const configResponse = await fetch(`${base}/api/public-config`);
assert.match(configResponse.headers.get('cache-control'), /no-store/);
const config = await configResponse.json();
assert.deepEqual(Object.keys(config).sort(), [
  'configured',
  'key',
  'source',
  'url',
]);
for (const path of [
  '/admin',
  '/admin/login',
  '/admin/poemas',
  '/admin/poemas/novo',
  '/admin/poemas/demo-01',
]) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /noindex/);
  assert.match(html, /nofollow/);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.ok(!html.includes('inventario-da-ausencia'));
  assert.ok(!html.includes('noctiluz:guardados:v1'));
}
assert.ok(
  (await (await fetch(`${base}/robots.txt`)).text()).includes('/admin'),
);
if (unconfigured) {
  assert.equal(config.source, 'supabase');
  assert.equal(config.configured, false);
  for (const path of [
    '/',
    '/poemas',
    '/poemas/o-peso-do-silencio',
    '/busca',
    '/guardados',
    '/para-voce',
    '/em-portugues-se-diz',
    '/lugares/jardim',
  ]) {
    const response = await fetch(base + path);
    const html = await response.text();
    assert.ok(
      html.includes('O jardim precisa de um instante.'),
      `Erro editorial ausente: ${path}`,
    );
    assert.ok(!html.includes('demo-01'));
    assert.ok(!html.includes('inventario-da-ausencia'));
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  assert.equal((await fetch(`${base}/sitemap.xml`)).status, 500);
}
console.log(
  `Admin: cinco rotas privadas sem dados, noindex/nofollow, no-store e robots. ${unconfigured ? 'Falha Supabase explícita em oito páginas, sem fallback JSON.' : ''}`,
);
