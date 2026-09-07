import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  homePoems,
  searchPoems,
  matchPoem,
  publicationState,
  slugify,
} from '../lib/poems/queries';
import {
  validatePoem,
  normalizeTags,
  manaustimeToISO,
  isoToManausInput,
  type PoemInput,
} from '../lib/poems/validation';
import { fromRow, toRow } from '../lib/poems/mapper';
import { contentConfig } from '../lib/supabase/config';
import type { Poem } from '../types/poem';
const poems: Poem[] = readdirSync('content/poems')
  .filter((name) => name.endsWith('.json'))
  .map(
    (name) => JSON.parse(readFileSync(`content/poems/${name}`, 'utf8')) as Poem,
  );
for (const poem of poems) {
  const input: PoemInput = {
    ...poem,
    status: 'published',
    publishAt: `${poem.date}T12:00:00Z`,
    featuredOrder: 0,
  };
  assert.deepEqual(validatePoem(input), {}, poem.slug);
  const mapped = fromRow({
    ...toRow(input, poem.id),
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });
  assert.equal(mapped.content, poem.content);
  assert.equal(mapped.id, poem.id);
}
assert.equal(slugify('Às vezes, o Céu!'), 'as-vezes-o-ceu');
assert.deepEqual(normalizeTags(['Paixão', 'paixao', '  sem resposta ']), [
  'paixao',
  'sem-resposta',
]);
assert.equal(manaustimeToISO('2026-09-07T20:30'), '2026-09-08T00:30:00.000Z');
assert.equal(isoToManausInput('2026-09-08T00:30:00Z'), '2026-09-07T20:30');
for (const date of [
  '2026-02-30T10:00',
  '2026-09-07T24:00',
  '2026-09-07T12:99',
  'garbage',
])
  assert.equal(manaustimeToISO(date), null);
assert.equal(
  publicationState(
    { status: 'published', publishAt: '2030-01-01T00:00:00Z' },
    Date.parse('2026-01-01'),
  ),
  'scheduled',
);
assert.equal(
  publicationState(
    { status: 'published', publishAt: '2026-01-01T00:00:00Z' },
    Date.parse('2026-01-01'),
  ),
  'published',
);
assert.equal(publicationState({ status: 'draft', publishAt: null }), 'draft');
assert.deepEqual(homePoems([]), []);
assert.equal(matchPoem(['missing'], poems), undefined);
assert.ok(searchPoems('ausência', poems).length);
assert.deepEqual(
  searchPoems('ausencia', poems),
  searchPoems('ausência', poems),
);
const a = { ...poems[0], featured: true, featuredOrder: 2 };
const b = { ...poems[1], featured: true, featuredOrder: 1 };
assert.equal(homePoems([a, b])[0].id, b.id);
assert.equal(contentConfig({}).source, 'static');
assert.equal(contentConfig({ CONTENT_SOURCE: 'supabase' }).configured, false);
assert.throws(() => contentConfig({ CONTENT_SOURCE: 'typo' }));
assert.throws(() =>
  contentConfig({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test',
  }),
);
assert.throws(() =>
  contentConfig({
    SUPABASE_PUBLISHABLE_KEY: `a.${btoa(JSON.stringify({ role: 'service_role' }))}.b`,
  }),
);
console.log(
  'Editorial: JSON preservado, busca, destaques, estados, fuso e configuração seguros.',
);
