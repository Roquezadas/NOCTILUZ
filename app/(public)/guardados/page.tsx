import { CollectionUnavailable } from '@/components/collection-unavailable';
import { getPublishedPoems } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading } from '@/components/editorial';
import { SavedPoems } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = {
  ...pageMetadata('Guardados', '/guardados'),
  robots: { index: false, follow: true },
};
export default async function Page() {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="sua pequena coleção"
        title="O que ficou com você."
      />
      <SavedPoems poems={poems} />
    </div>
  );
}
