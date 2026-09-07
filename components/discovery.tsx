'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { searchPoems, matchPoem } from '@/lib/poems/queries';
import type { Poem } from '@/types/poem';
import { PoemList } from '@/components/editorial';
import { useSavedPoems } from '@/components/poem-actions';
export function SearchPoems({ poems }: { poems: Poem[] }) {
  const [query, setQuery] = useState('');
  const results = searchPoems(query, poems);
  return (
    <>
      <label htmlFor="poem-search" className="small-label">
        Busque um verso, sentimento ou lugar
      </label>
      <input
        className="search-field"
        id="poem-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="procure alguma coisa que você esteja sentindo…"
      />
      <output className="search-summary">
        {query
          ? `${results.length} ${results.length === 1 ? 'poema encontrado' : 'poemas encontrados'}`
          : 'O acervo inteiro, à espera de uma palavra.'}
      </output>
      {results.length ? (
        <PoemList poems={results} />
      ) : (
        <div className="empty-state">
          <h2>esta palavra ainda não floresceu aqui.</h2>
          <p>Tente outro verso, sentimento ou lugar.</p>
          <button className="text-link" onClick={() => setQuery('')}>
            limpar a busca
          </button>
        </div>
      )}
    </>
  );
}
export function SavedPoems({ poems }: { poems: Poem[] }) {
  const ids = useSavedPoems();
  const saved = poems.filter((poem) => ids.includes(poem.id));
  return saved.length ? (
    <>
      <p className="search-summary">
        {saved.length} {saved.length === 1 ? 'poema ficou' : 'poemas ficaram'}{' '}
        por aqui. Guardados neste navegador.
      </p>
      <PoemList poems={saved} />
    </>
  ) : (
    <div className="empty-state">
      <h2>nenhum poema ficou por aqui ainda.</h2>
      <p>
        quando algum texto doer do jeito certo,
        <br />
        guarde-o.
      </p>
      <Link className="text-link" href="/poemas">
        encontrar poemas <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
const feelings = [
  { label: 'estou apaixonado', tags: ['amor', 'paixao'] },
  { label: 'sinto falta de alguém', tags: ['saudade', 'ausencia'] },
  { label: 'estou tentando esquecer', tags: ['termino', 'ausencia'] },
  { label: 'não fui escolhido', tags: ['rejeicao'] },
  { label: 'estou sozinho', tags: ['solidao'] },
  { label: 'tenho medo de perder alguém', tags: ['medo'] },
  { label: 'queria dizer algo que nunca disse', tags: ['confissao'] },
  { label: 'nem eu sei', tags: [] },
];
export function MoodSelector({ poems }: { poems: Poem[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const poem =
    selected === null ? undefined : matchPoem(feelings[selected].tags, poems);
  return (
    <>
      <div className="mood-options">
        {feelings.map((feeling, index) => (
          <button
            key={feeling.label}
            className="mood-option"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
          >
            {feeling.label}
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {selected !== null && !poem && (
          <p className="empty-state">
            Ainda não há um poema para este sentimento. Experimente outro
            caminho.
          </p>
        )}
        {poem && (
          <div className="found-poem" key={selected}>
            <p className="eyebrow">acho que este poema encontrou você.</p>
            <PoemList poems={[poem]} />
            <button className="text-link" onClick={() => setSelected(null)}>
              escolher outro sentimento
            </button>
          </div>
        )}
      </div>
    </>
  );
}
export function PoemReveal({ poems }: { poems: Poem[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div>
      {!poems.some((poem) => poem.series === 'Em português se diz') && (
        <p className="empty-state">Novas formas de dizer estão a caminho.</p>
      )}
      {poems
        .filter((poem) => poem.series === 'Em português se diz')
        .map((poem) => (
          <section
            className={`reveal-item accent-${poem.accent}`}
            key={poem.id}
          >
            <span className="small-label">em português se diz</span>
            <button
              className="reveal-button"
              aria-expanded={active === poem.id}
              aria-controls={`reveal-${poem.id}`}
              onClick={() => setActive(active === poem.id ? null : poem.id)}
            >
              <span>“{poem.phrase}”</span>
              {active === poem.id ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            {active === poem.id && (
              <div id={`reveal-${poem.id}`} className="reveal-content">
                <p className="small-label">mas em poema se diz…</p>
                <p className="verses">{poem.content}</p>
                <Link className="text-link" href={`/poemas/${poem.slug}`}>
                  entrar no poema <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
