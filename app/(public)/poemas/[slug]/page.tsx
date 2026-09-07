import { CollectionUnavailable } from '@/components/collection-unavailable';
import { notFound } from 'next/navigation';
import { getPublishedPoems } from '@/lib/poems/repository';
import { relatedPoem } from '@/lib/poems/queries';
import { PoemReader } from '@/components/poem-reader';
import { PoemActions } from '@/components/poem-actions';
import { PoemList, DemoNote } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems)
    return {
      title: 'Acervo indisponível',
      robots: { index: false, follow: false },
    };
  const poem = poems.find((item) => item.slug === slug);
  return poem
    ? pageMetadata(
        poem.title,
        '/poemas/' + poem.slug,
        (poem.demo ? 'Poema de demonstração. ' : 'Por Marcelo Roque. ') +
          poem.excerpt.replaceAll('\n', ' '),
      )
    : { robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  const slug = (await params).slug;
  const poem = poems.find((item) => item.slug === slug);
  if (!poem) notFound();
  const related = relatedPoem(poem, poems);
  return (
    <PoemReader poem={poem}>
      <PoemActions id={poem.id} title={poem.title} />
      {poem.demo && <DemoNote />}
      {related && (
        <aside className="related" aria-label="Outro poema">
          <p className="eyebrow">continue pela noite</p>
          <PoemList poems={[related]} />
        </aside>
      )}
    </PoemReader>
  );
}
