import { notFound } from 'next/navigation';
import Link from 'next/link';
import { places } from '@/config/places';
import { poems } from '@/lib/poems';
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
        <PoemList poems={poems.filter((poem) => poem.place === slug)} />
        <DemoNote />
      </div>
    </div>
  );
}
