'use client';
export function CollectionUnavailable() {
  return (
    <div className="page-wrap narrow empty-state">
      <p className="eyebrow">um breve intervalo</p>
      <h1>O jardim precisa de um instante.</h1>
      <p>
        Não foi possível carregar os poemas. Tente novamente em alguns momentos.
      </p>
      <button className="text-link" onClick={() => window.location.reload()}>
        tentar novamente
      </button>
    </div>
  );
}
