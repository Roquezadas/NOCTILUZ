import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { PlacesList, BookPreview, DemoNote } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Um jardim para coisas não ditas', '/');
export default function Home() {
  return (
    <>
      <section className="entrance">
        <div className="hero-botanical">
          <Image
            src="/images/night-garden.webp"
            alt="Flores delicadas iluminadas na escuridão"
            fill
            priority
            sizes="(max-width: 640px) 180vw, 100vw"
            unoptimized
          />
        </div>
        <div className="entrance-copy">
          <p className="eyebrow">
            <span className="tiny-light" /> poesia de Marcelo Roque
          </p>
          <h1>
            um jardim para
            <br />
            coisas <em>não ditas.</em>
          </h1>
          <p className="hero-fragment">
            algumas coisas não encontram palavras.
            <br />
            encontram um lugar.
          </p>
          <Link href="#primeira-luz" className="text-link entrance-link">
            atravesse a noite <ArrowDown size={16} />
          </Link>
        </div>
        <span className="margin-note">ainda há algo aceso.</span>
        <div className="entrance-foot">
          <span>um pouco de silêncio. um pouco de luz.</span>
          <span>01 — a entrada</span>
        </div>
      </section>
      <section className="fragment-section wrap" id="primeira-luz">
        <div className="section-side">
          <p className="eyebrow">01 / pequenos vestígios</p>
          <h2>
            O que ficou
            <br />
            aceso.
          </h2>
          <Link href="/poemas" className="text-link">
            todos os poemas <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="fragments">
          <Link
            href="/poemas/inventario-da-ausencia"
            className="fragment accent-violet"
          >
            <span className="small-label">
              <i className="place-light" /> nas ruínas
            </span>
            <blockquote>
              na casa vazia,
              <br />a luz do corredor
              <br />
              ainda espera alguém.
            </blockquote>
            <span className="fragment-read">
              ler o poema <ArrowUpRight size={14} />
            </span>
          </Link>
          <Link
            href="/poemas/o-que-floresce"
            className="fragment fragment-offset accent-pink"
          >
            <span className="small-label">
              <i className="place-light" /> no jardim
            </span>
            <blockquote>
              você chegou.
              <br />a tarde esqueceu de terminar.
            </blockquote>
            <span className="fragment-read">
              ler o poema <ArrowUpRight size={14} />
            </span>
          </Link>
          <DemoNote />
        </div>
      </section>
      <section className="paths-section wrap">
        <div className="section-top">
          <div>
            <p className="eyebrow">02 / os lugares</p>
            <h2>
              Por onde você
              <br />
              quer caminhar?
            </h2>
          </div>
          <p className="muted">
            Cada sentimento, um lugar.
            <br />
            Não precisa saber o caminho.
          </p>
        </div>
        <PlacesList />
      </section>
      <section className="language-preview wrap">
        <p className="eyebrow">03 / entre uma coisa e outra</p>
        <p className="small-label">em português se diz</p>
        <h2>“eu sinto sua falta.”</h2>
        <Link className="text-link" href="/em-portugues-se-diz">
          mas em poema se diz… <ArrowUpRight size={16} />
        </Link>
        <span className="quiet-rule" />
      </section>
      <section className="for-you-preview wrap">
        <p className="eyebrow">04 / um encontro</p>
        <h2>
          Talvez você não esteja
          <br />
          procurando um poema.
          <br />
          <em>Talvez ele procure você.</em>
        </h2>
        <Link className="text-link" href="/para-voce">
          encontre o seu poema <ArrowUpRight size={16} />
        </Link>
      </section>
      <div className="wrap">
        <BookPreview />
      </div>
      <p className="closing">mesmo na noite, alguma coisa floresce.</p>
    </>
  );
}
