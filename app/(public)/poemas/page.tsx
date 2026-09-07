import { CollectionUnavailable } from '@/components/collection-unavailable';
import { getPublishedPoems } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading, PoemList, DemoNote } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Poemas', '/poemas');
export default async function Page() {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="o acervo"
        title="Pequenas formas de ficar."
        description="Poemas para coisas que eu nunca soube dizer."
      />
      {poems.length ? (
        <PoemList poems={poems} />
      ) : (
        <p className="empty-state">
          Os primeiros versos ainda estão florescendo.
        </p>
      )}
      {poems.some((poem) => poem.demo) && <DemoNote />}
    </div>
  );
}
