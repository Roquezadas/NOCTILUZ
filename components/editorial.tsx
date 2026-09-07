import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { places } from '@/config/places';
import { site } from '@/config/site';
import type { Poem } from '@/types/poem';
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="intro">{description}</p>}
    </div>
  );
}
export function PoemList({ poems }: { poems: Poem[] }) {
  return (
    <div className="poem-list">
      {poems.map((poem, index) => (
        <Link
          className={`poem-row accent-${poem.accent}`}
          href={`/poemas/${poem.slug}`}
          key={poem.id}
        >
          <span className="row-number">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <span className="small-label">
              {places.find((place) => place.slug === poem.place)?.name}
            </span>
            <h2>{poem.title}</h2>
            <p>{poem.excerpt}</p>
          </div>
          <ArrowUpRight size={19} className="row-arrow" />
        </Link>
      ))}
    </div>
  );
}
export function PlacesList() {
  return (
    <div className="places-list">
      {places.map((place, index) => (
        <Link
          className={`place-row accent-${place.accent}`}
          href={`/lugares/${place.slug}`}
          key={place.slug}
        >
          <span className="row-number">0{index + 1}</span>
          <h3>
            <i className="place-light" />
            {place.name}
          </h3>
          <p>{place.description}</p>
          <ArrowUpRight size={18} />
        </Link>
      ))}
    </div>
  );
}
export function DemoNote() {
  return (
    <p className="demo-note">
      Acervo de demonstração · textos fictícios para apresentação do projeto.
    </p>
  );
}
export function BookPreview() {
  return (
    <section className="book-preview">
      <div
        className="book-type"
        aria-label="Proposta tipográfica provisória para a capa"
      >
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
      <div className="book-copy">
        <p className="eyebrow">além deste jardim</p>
        <h2>
          Há coisas que
          <br />
          precisam de um livro.
        </h2>
        <p className="muted">
          {site.book.title}
          <br />
          um livro de Marcelo Roque.
        </p>
        <Link className="text-link" href="/livro">
          conhecer o livro <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link href="/" className="wordmark">
          NOCTILUZ
        </Link>
        <p>um jardim para coisas não ditas.</p>
      </div>
      <div className="footer-links">
        <Link href="/sobre">sobre</Link>
        <Link href="/guardados">guardados</Link>
        {Object.entries(site.socials)
          .filter(([, url]) => url)
          .map(([name, url]) => (
            <a href={url} key={name} target="_blank" rel="noreferrer">
              {name}
            </a>
          ))}
      </div>
      <p className="copyright">
        por Marcelo Roque
        <br />© {new Date().getFullYear()} Noctiluz
      </p>
    </footer>
  );
}
