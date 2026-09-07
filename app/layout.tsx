import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/editorial';
import { AmbientBackground } from '@/components/ambient-background';
import { site } from '@/config/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Noctiluz — um jardim para coisas não ditas.',
    template: '%s — Noctiluz',
  },
  description: site.description,
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <AmbientBackground />
        <Navbar />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
