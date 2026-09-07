import { CollectionUnavailable } from '@/components/collection-unavailable';
import { getPublishedPoems } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading, DemoNote } from '@/components/editorial';
import { MoodSelector } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Um poema para você', '/para-voce');
export default async function Page() {
  const poems = await getPublishedPoems().catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="um poema para você"
        title="O que está aceso aí dentro?"
        description="Escolha o que mais se parece com agora."
      />
      <MoodSelector poems={poems} />
      {poems.some((poem) => poem.demo) && <DemoNote />}
    </div>
  );
}
