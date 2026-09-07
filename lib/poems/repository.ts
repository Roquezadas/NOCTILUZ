import 'server-only';
import { cache } from 'react';
import { getContentConfig } from '@/lib/supabase/server';
import { staticPoems } from './static-repository';
import { publishedPoems } from './supabase-repository';
import { homePoems } from './queries';
export const getPublishedPoems = cache(async () =>
  (await getContentConfig()).source === 'static'
    ? staticPoems()
    : publishedPoems(),
);
export async function getPublishedPoemBySlug(slug: string) {
  return (await getPublishedPoems()).find((poem) => poem.slug === slug);
}
export async function getPoemsByPlace(place: string) {
  return (await getPublishedPoems()).filter((poem) => poem.place === place);
}
export async function getFeaturedPoems() {
  return homePoems(await getPublishedPoems());
}
export async function getSeriesPoems(series: string) {
  return (await getPublishedPoems()).filter((poem) => poem.series === series);
}
