import { PageHeading, DemoNote } from '@/components/editorial';
import { MoodSelector } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Um poema para você', '/para-voce');
export default function Page() {
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="um poema para você"
        title="O que está aceso aí dentro?"
        description="Escolha o que mais se parece com agora."
      />
      <MoodSelector />
      <DemoNote />
    </div>
  );
}
