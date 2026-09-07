'use client';
import { AuthorLink } from './author-link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Poem } from '@/types/poem';
import { places } from '@/config/places';
import {
  listAuthorPoems,
  deleteAuthorPoem,
  duplicateAuthorPoem,
} from '@/lib/poems/admin-service';
import { publicationState, searchPoems } from '@/lib/poems/queries';
import { Choice, Confirm } from './controls';
export const stateLabels = {
  draft: 'Rascunho',
  published: 'Publicado',
  scheduled: 'Agendado',
};
export function AuthorLibrary({ dashboard = false }: { dashboard?: boolean }) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [place, setPlace] = useState('all');
  const [sort, setSort] = useState('updated');
  const [deleting, setDeleting] = useState<Poem | null>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [now, setNow] = useState(Date.now);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void listAuthorPoems()
      .then((data) => {
        if (active) setPoems(data);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível carregar seus poemas.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const filtered = searchPoems(query, poems, true)
    .filter(
      (poem) =>
        (status === 'all' || publicationState(poem, now) === status) &&
        (place === 'all' || poem.place === place),
    )
    .sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title, 'pt-BR')
        : sort === 'date'
          ? b.date.localeCompare(a.date)
          : (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''),
    );
  const visible = dashboard ? filtered.slice(0, 5) : filtered;
  return (
    <>
      <div className="author-page-heading">
        <div>
          <p className="eyebrow">
            {dashboard ? 'um lugar para começar' : 'seu acervo'}
          </p>
          <h1>{dashboard ? 'O que floresce hoje?' : 'Meus poemas.'}</h1>
          <p className="muted">
            {dashboard
              ? 'Um verso de cada vez. O resto encontra seu tempo.'
              : 'Rascunhos, encontros e palavras prontas para partir.'}
          </p>
        </div>
        <AuthorLink href="/admin/poemas/novo" className="author-button">
          + novo poema
        </AuthorLink>
      </div>
      {dashboard && !loading && !error && (
        <div className="author-counts">
          {(['draft', 'published', 'scheduled'] as const).map((state) => (
            <div key={state}>
              <strong>
                {
                  poems.filter((poem) => publicationState(poem, now) === state)
                    .length
                }
              </strong>
              <span>{stateLabels[state]}s</span>
            </div>
          ))}
        </div>
      )}
      {!dashboard && (
        <div className="author-filters">
          <label className="author-field" htmlFor="author-search">
            Buscar no acervo
            <input
              id="author-search"
              type="search"
              placeholder="título, verso, sentimento…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Choice
            id="status-filter"
            label="Publicação"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Todos os estados' },
              ...Object.entries(stateLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <Choice
            id="place-filter"
            label="Lugar"
            value={place}
            onChange={setPlace}
            options={[
              { value: 'all', label: 'Todos os lugares' },
              ...places.map((item) => ({ value: item.slug, label: item.name })),
            ]}
          />
          <Choice
            id="sort-filter"
            label="Ordenar"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'updated', label: 'Última edição' },
              { value: 'date', label: 'Data do poema' },
              { value: 'title', label: 'Título' },
            ]}
          />
        </div>
      )}
      <div aria-live="polite">
        {loading && <p className="author-notice">Reunindo seus versos…</p>}
        {error && (
          <div className="author-error">
            <p role="alert">{error}</p>
            <button
              className="text-link"
              onClick={() => {
                setLoading(true);
                setError('');
                setVersion((value) => value + 1);
              }}
            >
              tentar novamente
            </button>
          </div>
        )}
      </div>
      {!loading && !error && (
        <>
          <p className="small-label">
            {dashboard
              ? 'últimas páginas abertas'
              : `${filtered.length} poemas`}
          </p>
          <div className="author-poems">
            {visible.map((poem) => (
              <article
                className={`author-poem accent-${poem.accent}`}
                key={poem.id}
              >
                <div>
                  <span
                    className={`author-status status-${publicationState(poem, now)}`}
                  >
                    {stateLabels[publicationState(poem, now)]}
                    {poem.demo ? ' · demonstração' : ''}
                  </span>
                  <h2>
                    <AuthorLink href={`/admin/poemas/${poem.id}`}>
                      {poem.title || 'Sem título'}
                    </AuthorLink>
                  </h2>
                  <p className="author-poem-meta">
                    {places.find((item) => item.slug === poem.place)?.name} ·{' '}
                    {poem.date.split('-').reverse().join('/')}
                    {poem.featured ? ' · em destaque' : ''}
                  </p>
                  {publicationState(poem, now) === 'scheduled' &&
                    poem.publishAt && (
                      <p className="author-help">
                        Publicação:{' '}
                        {new Date(poem.publishAt).toLocaleString('pt-BR', {
                          timeZone: 'America/Manaus',
                        })}{' '}
                        (Manaus)
                      </p>
                    )}
                </div>
                <div className="author-actions">
                  <AuthorLink href={`/admin/poemas/${poem.id}`}>
                    editar
                  </AuthorLink>
                  {publicationState(poem, now) === 'published' && (
                    <AuthorLink
                      href={`/poemas/${poem.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ver ↗
                    </AuthorLink>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      void duplicateAuthorPoem(poem)
                        .then((copy) => router.push(`/admin/poemas/${copy.id}`))
                        .catch((reason: unknown) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : 'Não foi possível duplicar.',
                          ),
                        )
                        .finally(() => setBusy(false));
                    }}
                  >
                    duplicar
                  </button>
                  <button
                    disabled={busy}
                    className="author-danger"
                    onClick={() => setDeleting(poem)}
                  >
                    excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="author-empty">
              <h2>
                {poems.length
                  ? 'Nenhum poema por este caminho.'
                  : 'Tudo começa com um verso.'}
              </h2>
              <p>
                {poems.length
                  ? 'Experimente outro termo ou filtro.'
                  : 'Abra uma página e guarde sua primeira ideia como rascunho.'}
              </p>
              <AuthorLink className="text-link" href="/admin/poemas/novo">
                escrever um poema →
              </AuthorLink>
            </div>
          )}
          {dashboard && poems.length > 0 && (
            <AuthorLink className="text-link" href="/admin/poemas">
              ver todo o acervo →
            </AuthorLink>
          )}
        </>
      )}
      <Confirm
        open={Boolean(deleting)}
        title="Deixar este poema partir?"
        description={`“${deleting?.title || 'Sem título'}” será excluído definitivamente. Esta ação não pode ser desfeita.`}
        confirmLabel="excluir poema"
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting || busy) return;
          setBusy(true);
          void deleteAuthorPoem(deleting)
            .then(() => {
              setPoems((items) =>
                items.filter((item) => item.id !== deleting.id),
              );
              setDeleting(null);
            })
            .catch((reason: unknown) => {
              setDeleting(null);
              setError(
                reason instanceof Error
                  ? reason.message
                  : 'Não foi possível excluir.',
              );
            })
            .finally(() => setBusy(false));
        }}
      />
    </>
  );
}
