import { PageHeading } from '@/components/editorial';
import { SearchPoems } from '@/components/discovery';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Busca', '/busca');
export default function Page() {
  return (
    <div className="page-wrap narrow">
      <PageHeading eyebrow="entre os versos" title="O que você procura?" />
      <SearchPoems />
    </div>
  );
}
