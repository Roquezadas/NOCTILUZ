import type { Poem } from '@/types/poem';
import { places } from '@/config/places';
const files = import.meta.glob<{ default: Poem }>('../content/poems/*.json', {
  eager: true,
});
export const poems = Object.values(files)
  .map((file) => file.default)
  .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
export function getPoem(slug: string) {
  return poems.find((poem) => poem.slug === slug);
}
export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
export function searchPoems(query: string, source = poems) {
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
      ].join(' '),
    );
    return terms.every((term) => text.includes(term));
  });
}
export function matchPoem(tags: string[], source = poems) {
  return [...source].sort(
    (a, b) =>
      b.tags.filter((tag) => tags.includes(tag)).length -
        a.tags.filter((tag) => tags.includes(tag)).length ||
      a.id.localeCompare(b.id),
  )[0];
}
export function relatedPoem(poem: Poem) {
  return matchPoem(
    poem.tags,
    poems.filter((item) => item.id !== poem.id),
  );
}
