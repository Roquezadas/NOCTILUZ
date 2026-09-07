'use client';
export default function CollectionError({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap narrow empty-state">
      <h1>O jardim precisa de um instante.</h1>
      <p>
        Não foi possível carregar os poemas. Tente novamente em alguns momentos.
      </p>
      <button className="text-link" onClick={reset}>
        tentar novamente
      </button>
    </div>
  );
}
