import Image from 'next/image';
import { PageHeading } from '@/components/editorial';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata(site.book.title, '/livro');
export default function Page() {
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="um livro de Marcelo Roque"
        title={site.book.title}
      />
      <div className="book-page">
        {site.book.cover ? (
          <Image
            unoptimized
            src={site.book.cover}
            alt={`Capa de ${site.book.title}`}
            width={300}
            height={435}
          />
        ) : (
          <div className="book-type">
            <span>MARCELO ROQUE</span>
            <p>
              Em Meu
              <br />
              Leito de Morte
              <br />
              <em>Você Apareceu</em>
            </p>
            <small>ESTUDO DE CAPA · PROVISÓRIO</small>
          </div>
        )}
        <div className="prose">
          <h2 style={{ marginTop: 0 }}>Além dos versos daqui.</h2>
          <p>
            {site.book.synopsis ||
              'A sinopse oficial será apresentada aqui. Este espaço aguarda os materiais do autor.'}
          </p>
          {site.book.fragments.length > 0 ? (
            site.book.fragments.map((text) => (
              <blockquote key={text}>{text}</blockquote>
            ))
          ) : (
            <p>Fragmentos e poemas do livro: em preparação.</p>
          )}
          <dl className="book-details">
            <div>
              <dt>autor</dt>
              <dd>Marcelo Roque</dd>
            </div>
            <div>
              <dt>edição</dt>
              <dd>{site.book.edition || 'A confirmar'}</dd>
            </div>
            <div>
              <dt>capa</dt>
              <dd>
                {site.book.cover
                  ? 'Capa oficial'
                  : 'Proposta visual provisória'}
              </dd>
            </div>
          </dl>
          {site.book.buyUrl ? (
            <a
              href={site.book.buyUrl}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              encontrar o livro ↗
            </a>
          ) : (
            <p className="demo-note">
              O link de compra será incluído quando informado pelo autor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
