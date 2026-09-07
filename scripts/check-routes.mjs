import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3000';
const poems = await Promise.all(
  (await readdir('content/poems'))
    .filter((file) => file.endsWith('.json'))
    .map(async (file) =>
      JSON.parse(await readFile(`content/poems/${file}`, 'utf8')),
    ),
);
const paths = [
  '/',
  '/poemas',
  '/lugares',
  '/busca',
  '/para-voce',
  '/guardados',
  '/em-portugues-se-diz',
  '/livro',
  '/sobre',
  ...['jardim', 'ruinas', 'ceu', 'quarto', 'abismo', 'cartas'].map(
    (slug) => `/lugares/${slug}`,
  ),
  ...poems.map((poem) => `/poemas/${String(poem.slug)}`),
];
for (const path of paths) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes('<h1'), `${path}: H1 ausente`);
  assert.ok(html.includes('rel="canonical"'), `${path}: canonical ausente`);
  assert.ok(html.includes('og:image'), `${path}: OG ausente`);
  if (path.startsWith('/poemas/')) {
    const poem = poems.find((item) => path.endsWith(item.slug));
    assert.ok(html.includes(poem.title), `${path}: título ausente`);
    const image = await fetch(`${base}/og/${String(poem.slug)}.png`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /image\/png/);
  }
}
for (const path of ['/nao-existe', '/poemas/nao-existe', '/lugares/nao-existe'])
  assert.equal((await fetch(base + path)).status, 404, path);
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
for (const poem of poems) assert.ok(sitemap.includes(poem.slug));
assert.ok(
  (await (await fetch(base + '/robots.txt')).text()).includes('Sitemap:'),
);
console.log(
  `${paths.length} páginas, 3 erros 404, 12 imagens OG, sitemap e robots verificados.`,
);
