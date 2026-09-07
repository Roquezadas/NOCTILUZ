import type { MetadataRoute } from 'next';
import { poems } from '@/lib/poems';
import { places } from '@/config/places';
import { site } from '@/config/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...[
      '',
      '/poemas',
      '/lugares',
      '/para-voce',
      '/em-portugues-se-diz',
      '/livro',
      '/sobre',
    ].map((path) => ({ url: `${site.url}${path}` })),
    ...poems.map((poem) => ({
      url: `${site.url}/poemas/${poem.slug}`,
      lastModified: new Date(poem.date),
    })),
    ...places.map((place) => ({ url: `${site.url}/lugares/${place.slug}` })),
  ];
}
