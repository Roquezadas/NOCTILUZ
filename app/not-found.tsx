import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="page-wrap narrow">
      <p className="eyebrow">404 / fora do caminho</p>
      <h1>esta luz se apagou.</h1>
      <p className="intro" style={{ margin: '28px 0' }}>
        Você chegou a um lugar que não encontramos.
      </p>
      <Link href="/poemas" className="text-link">
        voltar para os poemas ↗
      </Link>
    </div>
  );
}
