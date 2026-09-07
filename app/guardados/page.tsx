import { PageHeading } from '@/components/editorial';
import { SavedPoems } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = {
  ...pageMetadata('Guardados', '/guardados'),
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="sua pequena coleção"
        title="O que ficou com você."
      />
      <SavedPoems />
    </div>
  );
}
