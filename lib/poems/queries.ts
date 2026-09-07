import type { Poem } from '@/types/poem';
import { places } from '@/config/places';
export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
export function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 160)
    .replace(/-$/, '');
}
export function searchPoems(query: string, source: Poem[], admin = false) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return source.filter((poem) => {
    const place = places.find((item) => item.slug === poem.place);
    const text = normalize(
      [
        poem.title,
        poem.content,
        ...poem.tags,
        place?.name,
        place?.feelings,
        poem.series,
        poem.phrase,
        admin ? poem.slug : '',
      ].join(' '),
    );
    return terms.every((term) => text.includes(term));
  });
}
export function matchPoem(tags: string[], source: Poem[]) {
  const ranked = [...source].sort(
    (a, b) =>
      b.tags.filter((tag) => tags.includes(tag)).length -
        a.tags.filter((tag) => tags.includes(tag)).length ||
      a.id.localeCompare(b.id),
  );
  return tags.length && !ranked[0]?.tags.some((tag) => tags.includes(tag))
    ? undefined
    : ranked[0];
}
export function relatedPoem(poem: Poem, source: Poem[]) {
  return matchPoem(
    poem.tags,
    source.filter((item) => item.id !== poem.id),
  );
}
export function sortPoems(source: Poem[]) {
  return [...source].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
}
export function homePoems(source: Poem[]) {
  const featured = source
    .filter((poem) => poem.featured)
    .sort(
      (a, b) =>
        (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0) ||
        b.date.localeCompare(a.date) ||
        a.id.localeCompare(b.id),
    );
  return [
    ...featured,
    ...sortPoems(source).filter((poem) => !poem.featured),
  ].slice(0, 2);
}
export function publicationState(
  poem: Pick<Poem, 'status' | 'publishAt'>,
  now = Date.now(),
): 'draft' | 'scheduled' | 'published' {
  if (poem.status !== 'published' || !poem.publishAt) return 'draft';
  return Date.parse(poem.publishAt) > now ? 'scheduled' : 'published';
}
export function makeExcerpt(content: string) {
  return content
    .split('\n')
    .filter((line) => line.trim())
    .slice(0, 3)
    .join('\n')
    .slice(0, 500);
}
