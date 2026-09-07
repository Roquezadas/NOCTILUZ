import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/editorial';
import { AmbientBackground } from '@/components/ambient-background';
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main id="conteudo">{children}</main>
      <Footer />
    </>
  );
}
