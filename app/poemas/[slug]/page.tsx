import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPoem, poems, relatedPoem } from '@/lib/poems';
import { places } from '@/config/places';
import { PoemActions } from '@/components/poem-actions';
import { PoemList, DemoNote } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return poems.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const poem = getPoem((await params).slug);
  return poem
    ? pageMetadata(
        poem.title,
        `/poemas/${poem.slug}`,
        `${poem.demo ? 'Poema de demonstração. ' : 'Por Marcelo Roque. '}${poem.excerpt.replaceAll('\n', ' ')}`,
        `/og/${poem.slug}.png`,
      )
    : {};
}
export default async function Page({ params }: Props) {
  const poem = getPoem((await params).slug);
  if (!poem) notFound();
  const place = places.find((item) => item.slug === poem.place);
  const related = relatedPoem(poem);
  return (
    <div className={`page-glow accent-${poem.accent}`}>
      <article className="reader">
        <Link className="reader-place" href={`/lugares/${poem.place}`}>
          <span>←</span>
          {place?.name}
        </Link>
        <h1>{poem.title}</h1>
        <div className="verses">{poem.content}</div>
        <div className="poem-byline">
          {poem.demo
            ? 'Texto de demonstração · autoria fictícia'
            : 'Marcelo Roque'}
          <time dateTime={poem.date}>
            {new Date(`${poem.date}T12:00:00Z`).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </div>
        <PoemActions id={poem.id} title={poem.title} />
        {poem.demo && <DemoNote />}
        {related && (
          <aside className="related" aria-label="Outro poema">
            <p className="eyebrow">continue pela noite</p>
            <PoemList poems={[related]} />
          </aside>
        )}
      </article>
    </div>
  );
}
