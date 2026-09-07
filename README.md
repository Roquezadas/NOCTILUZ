# NOCTILUZ

Um jardim para coisas não ditas. Projeto literário de Marcelo Roque.

## Executar

Requer Node.js 22.13 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo servidor (normalmente http://localhost:3000).

```sh
npm run lint
npm run typecheck
npm run build
npm run start
```

O build valida o acervo, gera as imagens Open Graph e pré-renderiza as rotas. `npm run test:routes -- http://localhost:3000` verifica o servidor em execução: 27 páginas do acervo inicial, metadados, imagens, sitemap, robots e URLs inexistentes. `npm run format` formata o código.

## Stack e arquitetura

React 19, TypeScript e Tailwind CSS 4. App Router, Server Components, metadata e APIs `next/*`, executados pelo **Vinext 1.0 beta**, adaptação compatível com a arquitetura do Next.js usada pelo scaffold do Sites para Cloudflare Workers. Portanto esta entrega não usa o runtime oficial `next`. As rotas são pré-renderizadas no build e também atendidas pelo Worker. O loader usa `import.meta.glob`, específico de Vite: para migrar ao Next.js oficial, substitua-o por descoberta de conteúdo no build via filesystem/manifesto e ajuste os scripts de execução. Não há banco, autenticação da aplicação ou CMS.

Animações leves em CSS dispensam Framer Motion. Dependências de componentes do scaffold são preservadas; a interface literária utiliza HTML semântico e Lucide apenas para ações. Componentes vendorizados não utilizados (`components/ui` e `hooks/use-mobile.ts`) estão fora do lint do produto, pois trazem problemas próprios do scaffold. O código da aplicação passa por lint e typecheck.

```text
app/                 rotas, layout, tokens/estilos e metadata
components/          navegação, listas, leitura e interações
content/poems/       um JSON por poema
config/site.ts       marca, autor, URL, redes e livro
config/places.ts     Lugares e atmosferas
lib/poems.ts         acesso ao conteúdo, busca e relação por tags
lib/metadata.ts      canonical, Open Graph e Twitter
types/poem.ts        contrato de conteúdo
public/              fontes, imagem botânica e previews
scripts/             validação, geração de imagens e teste de rotas
docs/                comparação tipográfica e revisão
.openai/hosting.json projeto Sites
```

## Publicar ou editar um poema

Crie um arquivo em `content/poems/meu-poema.json`. Não precisa modificar componentes.

```json
{
  "id": "poema-001",
  "slug": "meu-poema",
  "title": "meu poema",
  "excerpt": "primeiro verso\nsegundo verso",
  "content": "primeiro verso\nsegundo verso\n\noutra estrofe",
  "place": "jardim",
  "tags": ["amor", "paixao"],
  "date": "2026-09-06",
  "featured": false,
  "mood": "romantic",
  "accent": "pink",
  "series": null,
  "language": "pt-BR",
  "demo": false,
  "phrase": "estou apaixonado"
}
```

Use `\n` para versos e `\n\n` para estrofes. IDs e slugs são únicos; preserve o ID para manter os guardados. Evite mudar slugs publicados sem providenciar redirecionamento. O poema aparece automaticamente na listagem, Lugar, busca, seleção por tags, sitemap e geração de OG. A home tem dois fragmentos editoriais escolhidos manualmente em `app/page.tsx`; não é um feed automático.

Para editar, altere o JSON e faça novo build/deploy. Não execute `scripts/seed-demo.mjs` sobre conteúdo real: é apenas a origem dos 12 exemplos iniciais e sobrescreve os arquivos com slugs de demonstração. Todos os exemplos têm `demo: true`, e sua autoria não é atribuída a Marcelo Roque. Remova os arquivos de exemplo quando adicionar os originais.

## Tags, Lugares e séries

Tags ficam em cada poema, preferencialmente minúsculas e sem acentos. Busca tolera acentos e maiúsculas e combina palavras. A seleção em `components/discovery.tsx` usa tags das oito opções de sentimento; a maior interseção vence, com desempate por ID. Nenhuma IA é chamada. A recomendação exclui o poema atual.

Para criar um Lugar, adicione uma entrada em `config/places.ts`, adicione o slug permitido em `scripts/validate-content.mjs` e relacione poemas por `place`. Rotas e sitemap são gerados automaticamente. Use um acento existente, ou amplie `Accent` e os tokens CSS. Para a revelação, configure `series: "Em português se diz"` e a frase cotidiana em `phrase`.

## Marca, livro e redes

Tudo em `config/site.ts`. Informe URLs oficiais completas em `socials`; entradas vazias não produzem links falsos. O livro aceita `cover`, `synopsis`, `buyUrl`, `edition` e `fragments`. Guarde a capa otimizada em `public/images` e informe `/images/capa.webp`. Enquanto os dados não forem fornecidos, a página identifica o estudo de capa, a sinopse pendente e a falta do link de compra.

## Cores, fontes e movimento

Tokens centralizados em `app/globals.css`: fundo, texto, acentos, espaços, raio e duração. Os dois breakpoints principais são 640 e 900px, com ajuste ultrawide em 1600px. A tipografia final usa Cormorant Garamond e Instrument Sans, locais em `public/fonts`. Ajuste as regras `@font-face` e `--font-serif`/`--font-sans` para substituí-las. A comparação com EB Garamond fica em `docs/type-proof.html`. Movimento é reduzido a zero com `prefers-reduced-motion`. A imagem da entrada é WebP otimizada; não há vídeo, canvas de partículas ou WebGL.

## Guardados e compartilhar

Chave `noctiluz:guardados:v1` no localStorage. A coleção pertence ao navegador/dispositivo; não sincroniza entre aparelhos. JSON inválido ou bloqueio do armazenamento não quebra a aplicação. O botão informa quando a gravação falha. Web Share API quando disponível, fallback para Clipboard API e campo selecionável se ambas falharem. Os diálogos e destinos nativos variam por navegador e sistema.

## SEO e deploy

Atualize `site.url` para o domínio definitivo antes de publicar. Canonical, sitemap, robots, OG e Twitter usam essa origem. `scripts/prepare-assets.mjs` gera PNG 1200×630 por poema; exemplos não recebem autoria real nas imagens. A prévia privada do Sites é restrita ao proprietário: indexação e leitura por robôs de redes sociais só funcionarão após liberar acesso público. Isso não é feito automaticamente.

O projeto está preparado para Sites/Cloudflare Workers. Faça lint, typecheck e build, registre a versão do código e use o fluxo Sites para salvar e publicar. O helper de empacotamento da skill sites-hosting reúne `dist/server`, assets e `.openai/hosting.json`. Nenhuma credencial deve entrar no repositório. Para outro host, use um adaptador compatível com Workers ou faça a migração explícita para o runtime Next.js descrita acima; não envie esse build diretamente a um servidor Next.js convencional.

## CMS futuro

O contrato `Poem` e a camada `lib/poems.ts` isolam os dados. Um CMS deve adaptar suas respostas para esse contrato. Para manter páginas e buscas estáticas, obtenha os conteúdos no build e dispare rebuild por webhook. Sanity, Payload, Contentful ou Supabase não estão implementados.

Veja `ASSETS.md` para origem da imagem, prompt e fontes, e `docs/REVISAO.md` para validação e limites desta versão.
