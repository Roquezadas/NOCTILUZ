import type { Poem } from '@/types/poem';
import { places } from '@/config/places';
import { accents, seriesName } from '@/config/editorial';
import { normalize } from './queries';
export type PoemInput = Omit<Poem, 'id' | 'createdAt' | 'updatedAt'> & {
  status: 'draft' | 'published';
  publishAt: string | null;
  featuredOrder: number;
};
export type ValidationErrors = Partial<Record<keyof PoemInput, string>>;
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value
  );
}
export function normalizeTags(tags: string[]) {
  return [
    ...new Set(
      tags.map((tag) => normalize(tag).replace(/\s+/g, '-')).filter(Boolean),
    ),
  ];
}
export function validatePoem(poem: PoemInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (
    poem.title.length > 240 ||
    (poem.status === 'published' && !poem.title.trim())
  )
    errors.title = 'Informe um título de até 240 caracteres.';
  if (
    poem.content.length > 100000 ||
    (poem.status === 'published' && !poem.content.trim())
  )
    errors.content = 'Escreva o poema (até 100 mil caracteres).';
  if (!poem.title.trim() && !poem.content.trim())
    errors.content =
      'Escreva um título ou alguns versos para guardar o rascunho.';
  if (
    (poem.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(poem.slug)) ||
    poem.slug.length > 160 ||
    (poem.status === 'published' && !poem.slug)
  )
    errors.slug = 'Use um endereço com letras minúsculas, números e hífens.';
  if (!places.some((place) => place.slug === poem.place))
    errors.place = 'Escolha um Lugar válido.';
  if (!accents.some((accent) => accent.value === poem.accent))
    errors.accent = 'Escolha uma atmosfera válida.';
  if (!validDate(poem.date))
    errors.date = 'Informe uma data válida para o poema.';
  if (poem.status !== 'draft' && poem.status !== 'published')
    errors.status = 'Estado de publicação inválido.';
  if (
    poem.status === 'published' &&
    (!poem.publishAt || Number.isNaN(Date.parse(poem.publishAt)))
  )
    errors.publishAt = 'Informe quando publicar.';
  if (
    poem.tags.length > 20 ||
    poem.tags.some(
      (tag) => tag.length > 40 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag),
    )
  )
    errors.tags = 'Use até 20 sentimentos, com até 40 caracteres cada.';
  if (poem.series === seriesName && !poem.phrase?.trim())
    errors.phrase = 'Escreva a frase cotidiana desta série.';
  if ((poem.phrase?.length ?? 0) > 500)
    errors.phrase = 'Use até 500 caracteres.';
  if (poem.excerpt.length > 500)
    errors.excerpt = 'Use até 500 caracteres no fragmento.';
  if (
    !Number.isInteger(poem.featuredOrder) ||
    poem.featuredOrder < 0 ||
    poem.featuredOrder > 9999
  )
    errors.featuredOrder = 'Use uma posição de 0 a 9999.';
  if (poem.language.length > 20 || !poem.language.trim())
    errors.language = 'Informe um idioma válido.';
  if (poem.mood.length > 80 || (poem.series?.length ?? 0) > 120)
    errors.mood = 'Metadados longos demais.';
  return errors;
}
export function manaustimeToISO(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ||
    !validDate(value.slice(0, 10)) ||
    Number(value.slice(11, 13)) > 23 ||
    Number(value.slice(14, 16)) > 59
  )
    return null;
  const date = new Date(value + '-04:00');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
export function isoToManausInput(value: string) {
  return new Date(new Date(value).getTime() - 4 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}
