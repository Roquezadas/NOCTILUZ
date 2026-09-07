import { CollectionUnavailable } from '@/components/collection-unavailable';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { places } from '@/config/places';
import { getPoemsByPlace } from '@/lib/poems/repository';
export const dynamic = 'force-dynamic';
import { PageHeading, PoemList, DemoNote } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return places.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;
  const current = places.find((item) => item.slug === slug);
  return current
    ? pageMetadata(current.name, `/lugares/${slug}`, current.description)
    : {};
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const place = places.find((item) => item.slug === slug);
  if (!place) notFound();
  const poems = await getPoemsByPlace(slug).catch(() => null);
  if (!poems) return <CollectionUnavailable />;
  return (
    <div className={`page-glow accent-${place.accent}`}>
      <div className="page-wrap narrow">
        <Link href="/lugares" className="reader-place">
          ← todos os lugares
        </Link>
        <PageHeading
          eyebrow={place.feelings}
          title={place.name}
          description={place.description}
        />
        {poems.length ? (
          <PoemList poems={poems} />
        ) : (
          <p className="empty-state">
            Este lugar aguarda seus primeiros versos.
          </p>
        )}
        {poems.some((poem) => poem.demo) && <DemoNote />}
      </div>
    </div>
  );
}
