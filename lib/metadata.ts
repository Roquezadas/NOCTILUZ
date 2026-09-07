import type { Metadata } from 'next';
import { site } from '@/config/site';
export function pageMetadata(
  title: string,
  path: string,
  description = site.description,
  image = '/og/default.png',
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${site.url}${path}` },
    openGraph: {
      title: `${title} — Noctiluz`,
      description,
      url: `${site.url}${path}`,
      siteName: 'Noctiluz',
      locale: 'pt_BR',
      type: 'website',
      images: [
        { url: `${site.url}${image}`, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Noctiluz`,
      description,
      images: [`${site.url}${image}`],
    },
  };
}
