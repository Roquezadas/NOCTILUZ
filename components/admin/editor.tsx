'use client';
import { AuthorLink } from './author-link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Accent, Poem } from '@/types/poem';
import { places } from '@/config/places';
import { accents, seriesName, tagSuggestions } from '@/config/editorial';
import { makeExcerpt, publicationState, slugify } from '@/lib/poems/queries';
import {
  isoToManausInput,
  manaustimeToISO,
  normalizeTags,
  validatePoem,
  type PoemInput,
  type ValidationErrors,
} from '@/lib/poems/validation';
import { readAuthorPoem, saveAuthorPoem } from '@/lib/poems/admin-service';
import { PoemReader } from '@/components/poem-reader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Choice, Confirm, Toggle } from './controls';
import { stateLabels } from './library';
function initialInput(poem?: Poem): PoemInput {
  return {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    place: 'jardim',
    tags: [],
    date: isoToManausInput(new Date().toISOString()).slice(0, 10),
    featured: false,
    mood: '',
    accent: 'pink',
    series: null,
    language: 'pt-BR',
    demo: false,
    phrase: '',
    ...poem,
    status: poem?.status ?? 'draft',
    publishAt: poem?.publishAt ?? null,
    featuredOrder: poem?.featuredOrder ?? 0,
  };
}
export function EditorLoader({ id }: { id?: string }) {
  const [poem, setPoem] = useState<Poem>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    void readAuthorPoem(id)
      .then((value) => {
        if (active) setPoem(value);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível abrir o poema.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  if (loading || (id && poem?.id !== id && !error))
    return <output className="author-notice">Abrindo esta página…</output>;
  if (error)
    return (
      <div className="author-empty">
        <p role="alert">{error}</p>
        <button
          className="text-link"
          onClick={() => {
            setLoading(true);
            setError('');
            setRetry((value) => value + 1);
          }}
        >
          tentar novamente
        </button>
        <AuthorLink href="/admin/poemas">voltar aos poemas</AuthorLink>
      </div>
    );
  return <PoemEditor key={id ?? 'new'} initial={poem} />;
}
export function PoemEditor({ initial }: { initial?: Poem }) {
  const [existing, setExisting] = useState(initial);
  const [input, setInput] = useState(() => initialInput(initial));
  const [saved, setSaved] = useState(() =>
    JSON.stringify(initialInput(initial)),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [customSlug, setCustomSlug] = useState(Boolean(initial));
  const [customExcerpt, setCustomExcerpt] = useState(
    Boolean(
      initial?.excerpt && initial.excerpt !== makeExcerpt(initial.content),
    ),
  );
  const [tag, setTag] = useState('');
  const [schedule, setSchedule] = useState(
    initial?.publishAt ? isoToManausInput(initial.publishAt) : '',
  );
  const [confirm, setConfirm] = useState<{
    action: 'save' | 'leave';
    input?: PoemInput;
    href?: string;
    proceed?: () => void;
    description: string;
  } | null>(null);
  const [tab, setTab] = useState('edit');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const dirty =
    Boolean(tag.trim()) ||
    JSON.stringify(input) !== saved ||
    schedule !==
      (existing?.publishAt ? isoToManausInput(existing.publishAt) : '');
  const allowLeave = useRef(false);
  const router = useRouter();
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty && !allowLeave.current) event.preventDefault();
    };
    const click = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (
        !dirty ||
        allowLeave.current ||
        !anchor ||
        anchor.target === '_blank' ||
        anchor.href === window.location.href ||
        anchor.getAttribute('href')?.startsWith('#') ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      setConfirm({
        action: 'leave',
        href: anchor.href,
        description:
          'Há versos e alterações que ainda não foram salvos. Se sair agora, eles serão perdidos.',
      });
    };
    const leave = (event: Event) => {
      if (!dirty || allowLeave.current) return;
      event.preventDefault();
      setConfirm({
        action: 'leave',
        proceed: (event as CustomEvent<{ proceed: () => void }>).detail.proceed,
        description: 'Há alterações não salvas. Ao sair, elas serão perdidas.',
      });
    };
    window.addEventListener('noctiluz:author-leave', leave);
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', click, true);
    return () => {
      window.removeEventListener('noctiluz:author-leave', leave);
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', click, true);
    };
  }, [dirty]);
  function update<K extends keyof PoemInput>(key: K, value: PoemInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setNotice('');
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  const addTag = (value: string) => {
    const tags = normalizeTags([...input.tags, value]);
    if (
      tags.length > 20 ||
      tags.some(
        (item) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item) || item.length > 40,
      )
    ) {
      setErrors((current) => ({
        ...current,
        tags: 'Use até 20 sentimentos, com letras, números e hífens (até 40 caracteres).',
      }));
      return;
    }
    update('tags', tags);
    setTag('');
  };
  const persist = async (next: PoemInput) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice('');
    try {
      const result = await saveAuthorPoem(next, existing);
      const stored = initialInput(result);
      setExisting(result);
      setInput(stored);
      setSaved(JSON.stringify(stored));
      setTag('');
      setSchedule(result.publishAt ? isoToManausInput(result.publishAt) : '');
      setCustomSlug(true);
      setConfirm(null);
      setNotice(
        result.status === 'draft'
          ? 'Rascunho guardado.'
          : publicationState(result) === 'scheduled'
            ? 'Poema agendado. Ele aparecerá no horário escolhido.'
            : 'Poema publicado. A luz já está acesa.',
      );
      if (!existing) {
        allowLeave.current = true;
        router.replace(`/admin/poemas/${result.id}`);
      }
    } catch (reason) {
      setConfirm(null);
      setNotice(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível salvar. Seus versos continuam aqui.',
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  function prepare(action: 'draft' | 'publish' | 'schedule' | 'update') {
    let next = {
      ...input,
      excerpt: customExcerpt ? input.excerpt : makeExcerpt(input.content),
    };
    if (tag.trim()) next.tags = normalizeTags([...next.tags, tag]);
    if (action === 'draft')
      next = { ...next, status: 'draft', publishAt: null };
    if (action === 'publish')
      next = {
        ...next,
        status: 'published',
        publishAt: new Date().toISOString(),
      };
    if (action === 'schedule')
      next = {
        ...next,
        status: 'published',
        publishAt: manaustimeToISO(schedule),
      };
    const validation = validatePoem(next);
    if (
      action === 'schedule' &&
      (!next.publishAt || Date.parse(next.publishAt) <= Date.now())
    )
      validation.publishAt = 'Escolha um horário futuro em Manaus (UTC−04).';
    setErrors(validation);
    if (Object.keys(validation).length) {
      if (validation.slug || validation.excerpt || validation.mood)
        setAdvancedOpen(true);
      setNotice('Revise os campos indicados antes de salvar.');
      setTab('edit');
      return;
    }
    const changesAddress =
      existing?.status === 'published' && existing.slug !== next.slug;
    const unpublishes =
      existing?.status === 'published' && next.status === 'draft';
    if (changesAddress || unpublishes) {
      setConfirm({
        action: 'save',
        input: next,
        description: unpublishes
          ? 'O poema deixará de aparecer no site e seu endereço ficará indisponível. Os versos continuarão guardados como rascunho.'
          : 'O endereço anterior deixará de funcionar, inclusive em links já compartilhados. Deseja usar o novo endereço?',
      });
      return;
    }
    void persist(next);
  }
  const preview: Poem = { ...input, id: existing?.id ?? 'preview' };
  const fieldError = (key: keyof PoemInput) =>
    errors[key] ? (
      <p className="author-error" id={`error-${key}`}>
        {errors[key]}
      </p>
    ) : null;
  return (
    <>
      <div className="author-editor-heading">
        <AuthorLink href="/admin/poemas" className="text-link">
          ← meus poemas
        </AuthorLink>
        <span className="author-status">
          {existing ? stateLabels[publicationState(existing)] : 'Novo rascunho'}
          {dirty ? ' · alterações não salvas' : existing ? ' · salvo' : ''}
        </span>
      </div>
      <div className="author-page-heading">
        <div>
          <p className="eyebrow">uma página aberta</p>
          <h1>
            {existing ? 'Cuide destes versos.' : 'O começo de alguma coisa.'}
          </h1>
        </div>
        {existing && publicationState(existing) === 'published' && (
          <AuthorLink
            className="text-link"
            href={`/poemas/${existing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ver no site ↗
          </AuthorLink>
        )}
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(String(value))}
        className="author-editor"
      >
        <TabsList className="author-editor-tabs" aria-label="Escrita e prévia">
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>
        <div className="author-editor-columns">
          <TabsContent value="edit" keepMounted className="author-edit-panel">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                prepare(existing?.status === 'published' ? 'update' : 'draft');
              }}
            >
              <fieldset disabled={busy}>
                <label className="author-field" htmlFor="poem-title">
                  Título
                  <input
                    id="poem-title"
                    maxLength={240}
                    value={input.title}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'error-title' : undefined}
                    placeholder="Como se chama este sentimento?"
                    onChange={(event) => {
                      const title = event.target.value;
                      setInput((current) => ({
                        ...current,
                        title,
                        slug: customSlug ? current.slug : slugify(title),
                      }));
                      setNotice('');
                    }}
                  />
                </label>
                {fieldError('title')}
                <label className="author-field" htmlFor="poem-content">
                  Poema
                  <textarea
                    id="poem-content"
                    className="author-verses-input"
                    rows={14}
                    maxLength={100000}
                    spellCheck
                    value={input.content}
                    aria-invalid={Boolean(errors.content)}
                    aria-describedby={
                      errors.content ? 'error-content' : 'verse-help'
                    }
                    placeholder="Escreva sem pressa…"
                    onChange={(event) => {
                      const content = event.target.value;
                      setInput((current) => ({
                        ...current,
                        content,
                        excerpt: customExcerpt
                          ? current.excerpt
                          : makeExcerpt(content),
                      }));
                      setNotice('');
                    }}
                  />
                </label>
                <p id="verse-help" className="author-help">
                  Cada espaço e quebra de linha faz parte do poema. A prévia
                  acompanha seus versos.
                </p>
                {fieldError('content')}
                <div className="author-field-pair">
                  <Choice
                    id="poem-place"
                    label="Lugar"
                    value={input.place}
                    options={places.map((place) => ({
                      value: place.slug,
                      label: place.name,
                    }))}
                    onChange={(value) => update('place', value)}
                    disabled={busy}
                  />
                  <Choice
                    id="poem-accent"
                    label="Atmosfera"
                    value={input.accent}
                    options={accents}
                    onChange={(value) => update('accent', value as Accent)}
                    disabled={busy}
                  />
                </div>
                {fieldError('place')}
                {fieldError('accent')}
                <label className="author-field" htmlFor="poem-tags">
                  Sentimentos
                  <input
                    id="poem-tags"
                    value={tag}
                    maxLength={40}
                    placeholder="escreva um sentimento e pressione Enter"
                    aria-describedby="tags-help"
                    onChange={(event) => setTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addTag(tag);
                      }
                    }}
                  />
                </label>
                <p id="tags-help" className="author-help">
                  Até 20 sentimentos. Você também pode escolher abaixo.
                </p>
                <div className="author-tags">
                  {input.tags.map((item) => (
                    <button
                      type="button"
                      key={item}
                      aria-label={`Remover sentimento ${item}`}
                      onClick={() =>
                        update(
                          'tags',
                          input.tags.filter((value) => value !== item),
                        )
                      }
                    >
                      {item} ×
                    </button>
                  ))}
                </div>
                <div className="author-suggestions">
                  {tagSuggestions
                    .filter((item) => !input.tags.includes(item))
                    .slice(0, 8)
                    .map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => addTag(item)}
                      >
                        + {item}
                      </button>
                    ))}
                </div>
                {fieldError('tags')}
                <label className="author-field" htmlFor="poem-date">
                  Data do poema
                  <input
                    id="poem-date"
                    type="date"
                    value={input.date}
                    onChange={(event) => update('date', event.target.value)}
                  />
                </label>
                {fieldError('date')}
                <Toggle
                  id="poem-series"
                  label="Faz parte de “Em português se diz”"
                  checked={input.series === seriesName}
                  onChange={(checked) =>
                    update('series', checked ? seriesName : null)
                  }
                  disabled={busy}
                />
                {input.series === seriesName && (
                  <>
                    <label className="author-field" htmlFor="poem-phrase">
                      Em português se diz…
                      <input
                        id="poem-phrase"
                        value={input.phrase ?? ''}
                        maxLength={500}
                        placeholder="eu sinto sua falta"
                        onChange={(event) =>
                          update('phrase', event.target.value)
                        }
                      />
                    </label>
                    {fieldError('phrase')}
                  </>
                )}
                <Toggle
                  id="poem-featured"
                  label="Destacar na entrada do site"
                  checked={input.featured}
                  onChange={(checked) => update('featured', checked)}
                  disabled={busy}
                />
                {input.featured && (
                  <label className="author-field" htmlFor="poem-order">
                    Ordem do destaque (menor aparece primeiro)
                    <input
                      id="poem-order"
                      type="number"
                      min={0}
                      max={9999}
                      value={input.featuredOrder}
                      onChange={(event) =>
                        update('featuredOrder', Number(event.target.value))
                      }
                    />
                  </label>
                )}
                {fieldError('featuredOrder')}
                <details
                  className="author-details"
                  open={advancedOpen}
                  onToggle={(event) =>
                    setAdvancedOpen(event.currentTarget.open)
                  }
                >
                  <summary>Outras escolhas</summary>
                  <label className="author-field" htmlFor="poem-slug">
                    Endereço do poema
                    <input
                      id="poem-slug"
                      value={input.slug}
                      maxLength={160}
                      onChange={(event) => {
                        setCustomSlug(true);
                        update('slug', event.target.value);
                      }}
                    />
                  </label>
                  <p className="author-help">
                    /poemas/{input.slug || 'seu-poema'}
                    {existing?.status === 'published'
                      ? ' · Alterar este endereço interrompe links já compartilhados.'
                      : ''}
                  </p>
                  {fieldError('slug')}
                  <Toggle
                    id="custom-excerpt"
                    label="Escolher um fragmento para as listas"
                    checked={customExcerpt}
                    onChange={(checked) => {
                      setCustomExcerpt(checked);
                      if (!checked)
                        update('excerpt', makeExcerpt(input.content));
                    }}
                    disabled={busy}
                  />
                  {customExcerpt && (
                    <label className="author-field" htmlFor="poem-excerpt">
                      Fragmento
                      <textarea
                        id="poem-excerpt"
                        rows={3}
                        value={input.excerpt}
                        maxLength={500}
                        onChange={(event) =>
                          update('excerpt', event.target.value)
                        }
                      />
                    </label>
                  )}
                  {fieldError('excerpt')}
                  <label className="author-field" htmlFor="poem-mood">
                    Clima do poema
                    <input
                      id="poem-mood"
                      value={input.mood}
                      maxLength={80}
                      onChange={(event) => update('mood', event.target.value)}
                    />
                  </label>
                  <Toggle
                    id="poem-demo"
                    label="Identificar como texto de demonstração"
                    checked={input.demo}
                    onChange={(checked) => update('demo', checked)}
                    disabled={busy}
                  />
                </details>
                <div className="author-publication">
                  <h2>Quando acender esta luz?</h2>
                  <label className="author-field" htmlFor="poem-schedule">
                    Agendar · horário de Manaus (UTC−04)
                    <input
                      id="poem-schedule"
                      type="datetime-local"
                      value={schedule}
                      onChange={(event) => setSchedule(event.target.value)}
                    />
                  </label>
                  {fieldError('publishAt')}
                  <div className="author-actions">
                    <button
                      className="author-button"
                      type="button"
                      onClick={() => prepare('schedule')}
                    >
                      {existing && publicationState(existing) === 'scheduled'
                        ? 'alterar agendamento'
                        : 'agendar publicação'}
                    </button>
                    {existing?.status === 'published' && (
                      <button type="button" onClick={() => prepare('draft')}>
                        {publicationState(existing) === 'scheduled'
                          ? 'cancelar agendamento'
                          : 'retirar do site'}
                      </button>
                    )}
                  </div>
                </div>
              </fieldset>
            </form>
          </TabsContent>
          <TabsContent
            value="preview"
            keepMounted
            className="author-preview-panel"
          >
            <div className="author-preview-label">
              <span className="tiny-light" /> prévia · apenas você pode ver
            </div>
            <PoemReader poem={preview} preview />
          </TabsContent>
        </div>
      </Tabs>
      <div className="author-savebar">
        <div>
          <output className={Object.keys(errors).length ? 'author-error' : ''}>
            {notice ||
              (busy
                ? 'Guardando seus versos…'
                : dirty
                  ? 'Há alterações esperando para ser salvas.'
                  : 'Escreva no seu tempo.')}
          </output>
          {existing?.updatedAt && (
            <small>
              Último registro:{' '}
              {new Date(existing.updatedAt).toLocaleString('pt-BR', {
                timeZone: 'America/Manaus',
              })}{' '}
              · Manaus
            </small>
          )}
        </div>
        <div className="author-actions">
          {existing?.status !== 'published' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => prepare('draft')}
            >
              salvar rascunho
            </button>
          )}
          {existing?.status === 'published' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => prepare('update')}
            >
              salvar alterações
            </button>
          )}
          <button
            type="button"
            className="author-button"
            disabled={busy}
            onClick={() => prepare('publish')}
          >
            {busy
              ? 'aguarde…'
              : existing && publicationState(existing) === 'published'
                ? 'atualizar publicação'
                : 'publicar agora'}
          </button>
        </div>
      </div>
      <Confirm
        open={Boolean(confirm)}
        title={
          confirm?.action === 'leave'
            ? 'Sair sem guardar?'
            : 'Confirmar esta mudança?'
        }
        description={confirm?.description ?? ''}
        confirmLabel={
          confirm?.action === 'leave' ? 'sair sem salvar' : 'confirmar mudança'
        }
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.action === 'save' && confirm.input)
            void persist(confirm.input);
          else if (confirm?.proceed) {
            allowLeave.current = true;
            confirm.proceed();
          } else if (confirm?.href) {
            allowLeave.current = true;
            window.location.assign(confirm.href);
          }
        }}
      />
    </>
  );
}
