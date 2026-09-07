import { PageHeading } from '@/components/editorial';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Sobre', '/sobre');
export default function Page() {
  return (
    <div className="page-wrap narrow">
      <PageHeading
        eyebrow="sobre o projeto"
        title="Um lugar para o que permanece."
      />
      <div className="prose">
        <p>
          Noctiluz é um espaço de poesia autoral de Marcelo Roque. Um jardim
          noturno para atravessar sentimentos, encontrar palavras e ficar um
          pouco.
        </p>
        <p>
          Aqui, a noite não esconde tudo. Há sempre um verso, uma lembrança,
          alguma coisa que ainda emite luz.
        </p>
        <h2>Marcelo Roque</h2>
        <p>
          Autor de “Em Meu Leito de Morte Você Apareceu” e criador de Noctiluz.
        </p>
        <h2>Em outros lugares</h2>
        {Object.entries(site.socials).some(([, url]) => url) ? (
          Object.entries(site.socials)
            .filter(([, url]) => url)
            .map(([name, url]) => (
              <p key={name}>
                <a href={url} target="_blank" rel="noreferrer">
                  {name} ↗
                </a>
              </p>
            ))
        ) : (
          <p>
            Os perfis oficiais de Instagram e TikTok serão adicionados aqui.
            YouTube, futuramente.
          </p>
        )}
        <h2>Sobre esta primeira versão</h2>
        <p>
          O acervo atual contém 12 textos fictícios para demonstrar a
          experiência. Eles não são poemas de Marcelo Roque e serão substituídos
          pelos originais. A apresentação do livro também aguarda capa, sinopse
          e informações oficiais.
        </p>
      </div>
    </div>
  );
}
