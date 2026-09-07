import { PageHeading, PoemList, DemoNote } from '@/components/editorial';
import { poems } from '@/lib/poems';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Poemas', '/poemas');
export default function Page() {
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="o acervo"
        title="Pequenas formas de ficar."
        description="Poemas para coisas que eu nunca soube dizer."
      />
      <PoemList poems={poems} />
      <DemoNote />
    </div>
  );
}
