import type { Poem } from '@/types/poem';
import type { PoemRow, PoemInsert } from '@/types/database';
import type { PoemInput } from './validation';
import { accents } from '@/config/editorial';
export function fromRow(row: PoemRow): Poem {
  const accent = accents.find((item) => item.value === row.accent)?.value;
  if (!accent) throw new Error('Atmosfera inválida no acervo.');
  return {
    id: row.id,
    slug: row.slug ?? '',
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    place: row.place,
    tags: row.tags,
    date: row.poem_date,
    featured: row.featured,
    featuredOrder: row.featured_order,
    mood: row.mood,
    accent,
    series: row.series,
    language: row.language,
    demo: row.demo,
    phrase: row.phrase ?? '',
    status: row.status,
    publishAt: row.publish_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export function toRow(input: PoemInput, id: string): PoemInsert {
  return {
    id,
    slug: input.slug || null,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    place: input.place,
    tags: input.tags,
    poem_date: input.date,
    featured: input.featured,
    featured_order: input.featuredOrder,
    mood: input.mood,
    accent: input.accent,
    series: input.series,
    language: input.language,
    demo: input.demo,
    phrase: input.phrase || null,
    status: input.status,
    publish_at: input.status === 'draft' ? null : input.publishAt,
  };
}
