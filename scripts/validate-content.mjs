import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const files = (await readdir('content/poems')).filter((name) =>
  name.endsWith('.json'),
);
const ids = new Set();
const slugs = new Set();
const places = ['jardim', 'ruinas', 'ceu', 'quarto', 'abismo', 'cartas'];
for (const file of files) {
  const poem = JSON.parse(await readFile(`content/poems/${file}`, 'utf8'));
  for (const key of [
    'id',
    'slug',
    'title',
    'excerpt',
    'content',
    'place',
    'tags',
    'date',
    'featured',
    'mood',
    'accent',
    'series',
    'language',
    'demo',
  ])
    assert.ok(key in poem, `${file}: falta ${key}`);
  assert.ok(!ids.has(poem.id), `id duplicado: ${String(poem.id)}`);
  assert.ok(!slugs.has(poem.slug), `slug duplicado: ${String(poem.slug)}`);
  assert.match(poem.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(places.includes(poem.place), `${file}: Lugar inválido`);
  assert.ok(
    Array.isArray(poem.tags) &&
      poem.tags.every((tag) => typeof tag === 'string'),
  );
  assert.ok(!Number.isNaN(Date.parse(poem.date)));
  assert.ok(typeof poem.content === 'string' && poem.content.trim().length > 0);
  assert.equal(typeof poem.demo, 'boolean');
  ids.add(poem.id);
  slugs.add(poem.slug);
}
console.log(`${files.length} poemas: metadata válida, IDs e slugs únicos.`);
