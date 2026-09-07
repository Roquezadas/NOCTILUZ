import { PageHeading, PlacesList } from '@/components/editorial';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Lugares', '/lugares');
export default function Page() {
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="uma geografia de sentimentos"
        title="Por onde você quer caminhar?"
        description="Alguns lugares não ficam no mapa. Ficam dentro da gente."
      />
      <PlacesList />
    </div>
  );
}
