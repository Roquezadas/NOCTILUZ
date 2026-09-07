import 'server-only';
import type { Poem } from '@/types/poem';
import { sortPoems } from './queries';
const files = import.meta.glob<string>('../../content/poems/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
});
export async function staticPoems() {
  return sortPoems(Object.values(files).map((raw) => JSON.parse(raw) as Poem));
}
