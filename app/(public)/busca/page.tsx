import { CollectionUnavailable } from '@/components/collection-unavailable';
import { getPublishedPoems } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading } from '@/components/editorial';
import { SearchPoems } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Busca', '/busca');
export default async function Page() {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className="page-wrap narrow">
      <PageHeading eyebrow="entre os versos" title="O que você procura?" />
      <SearchPoems poems={poems} />
    </div>
  );
}
