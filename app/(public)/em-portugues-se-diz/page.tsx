import { CollectionUnavailable } from '@/components/collection-unavailable';
import { getPublishedPoems } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading, DemoNote } from '@/components/editorial';
import { PoemReveal } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata(
  'Em português se diz…',
  '/em-portugues-se-diz',
);
export default async function Page() {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="duas formas de sentir"
        title="Em português se diz…"
        description="Às vezes, uma frase precisa de mais espaço. Toque para descobrir o poema."
      />
      <PoemReveal poems={poems} />
      {poems.some((poem) => poem.demo) && <DemoNote />}
    </div>
  );
}
