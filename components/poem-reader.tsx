import Link from 'next/link';
import type { Poem } from '@/types/poem';
import { places } from '@/config/places';
export function PoemReader({
  poem,
  preview = false,
  children,
}: {
  poem: Poem;
  preview?: boolean;
  children?: React.ReactNode;
}) {
  const place = places.find((item) => item.slug === poem.place);
  return (
    <div className={`page-glow accent-${poem.accent}`}>
      <article className="reader">
        {preview ? (
          <p className="reader-place">{place?.name}</p>
        ) : (
          <Link className="reader-place" href={`/lugares/${poem.place}`}>
            <span>←</span>
            {place?.name}
          </Link>
        )}
        <h1>{poem.title || 'Seu título floresce aqui'}</h1>
        <div className="verses">
          {poem.content || (preview ? 'Escreva os primeiros versos…' : '')}
        </div>
        <div className="poem-byline">
          {poem.demo
            ? 'Texto de demonstração · autoria fictícia'
            : 'Marcelo Roque'}
          <time dateTime={poem.date}>
            {/^\d{4}-\d{2}-\d{2}$/.test(poem.date) &&
            !Number.isNaN(Date.parse(poem.date))
              ? new Date(`${poem.date}T12:00:00Z`).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })
              : ''}
          </time>
        </div>
        {children}
      </article>
    </div>
  );
}
