# NOCTILUZ

Um jardim para coisas não ditas. Projeto literário de Marcelo Roque.

O site público e o **Jardim do Autor** pertencem à mesma aplicação existente. O CMS Supabase está implementado e aguardando configuração do projeto; o modo inicial continua usando os 12 exemplos locais. Veja o passo a passo em [docs/SUPABASE.md](docs/SUPABASE.md).

## Executar

Requer Node.js 22.13 ou superior e npm. Execute na pasta `site`:

```sh
npm ci
npm run dev
```

Copie `.env.example` para `.env.local` quando for configurar o banco. Sem configuração, o público usa JSON e `/admin` explica como conectar o projeto. O guia inclui criação da conta, allowlist, migration SQL/CLI, variáveis, importação e ativação de `CONTENT_SOURCE=supabase`.

## Publicar um poema

Depois de conectar o Supabase:

1. Entre em `/admin` com sua conta autorizada.
2. Escolha **novo poema**, escreva os versos, selecione Lugar e sentimentos.
3. Confira a prévia e **salve como rascunho**, **publique agora** ou **agende** em horário de Manaus.
4. Edite, duplique ou retire poemas do site pela lista. Excluir e mudar endereço publicado exigem confirmação.

Não é necessário editar JSON, código ou executar build para publicar. O estado informa alterações não salvas; não há autosave. Título, versos, espaços e estrofes são preservados. O fragmento das listas é automático, com edição opcional. O destaque da home respeita a ordem escolhida e completa com poemas recentes.

## Stack e arquitetura

React 19, TypeScript, Tailwind 4, **Vinext 1.0.0-beta.5 / Vite 8** e Cloudflare Workers. Preserva o scaffold e as APIs `next/*`; não usa o runtime oficial Next.js nem migra para outra plataforma. A integração utiliza o cliente oficial `@supabase/supabase-js`, sem Prisma, middleware de autenticação ou Server Actions.

```text
app/(public)/        URLs públicas e layout literário preservados
app/admin/           login, resumo, acervo, criação e edição
app/api/public-config/ configuração pública do cliente, sem segredos
components/admin/    sessão, lista, editor e controles acessíveis
components/poem-reader.tsx  leitura compartilhada com a prévia
lib/poems/           repositories, mapper, domínio e CRUD do autor
lib/supabase/        clientes público/autor isolados e configuração
supabase/migrations/ esquema PostgreSQL, RLS, constraints e trigger
content/poems/       JSON de demonstração e origem de importação
config/              marca, Lugares e opções editoriais
scripts/             build, importação e verificações locais/remotas
```

Dados públicos são consultados pelo servidor com chave publishable/anon, independentemente da sessão do autor. Rascunhos e agendamentos futuros ficam protegidos por RLS. No browser, busca/guardados/recomendações recebem apenas os publicados. A fonte é explícita: falhas do Supabase nunca retornam aos JSON. Páginas de acervo e sitemap são dinâmicos; novos slugs funcionam sem build. O build não consulta o banco nem importa poemas.

## Testes e ferramentas

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
node scripts/check-routes.mjs http://127.0.0.1:3001
npm run import:poems
```

Use o endereço exibido pelo servidor; o teste de rotas acima exige modo static com o acervo original. `npm test` verifica domínio e RLS em PostgreSQL/PGlite. `npm run test:supabase` é opt-in, exige contas reais de teste e está documentado no guia. `npm run format` formata o projeto. Componentes vendorizados permanecem fora do lint do produto; o código novo é verificado normalmente.

A importação é dry-run por padrão, ignora demos, preserva IDs e cria rascunhos. `--apply`, `--include-demo`, `--publish` e `--overwrite` são opções explícitas. Chave privilegiada é permitida **somente** no terminal do importador; nunca no runtime/build/client. Consulte o guia antes de usar sobrescrita.

## Identidade e conteúdo

Fontes locais Cormorant Garamond e Instrument Sans, imagem botânica WebP e movimento reduzido mantidos. Tokens públicos em `app/globals.css`; área do autor em `app/admin/author.css`. Fontes e imagem estão documentadas em [ASSETS.md](ASSETS.md). A comparação tipográfica original permanece em `docs/type-proof.html`.

Marca, redes e dados do livro ficam em `config/site.ts`; os campos ainda não fornecidos mantêm os estados editoriais anteriores. Lugares em `config/places.ts`; adicionar um Lugar também exige migration para atualizar a constraint do banco e os validadores/importador.

Guardados continuam em `noctiluz:guardados:v1` no navegador, sem sincronização entre aparelhos. IDs importados permanecem iguais. Poemas retirados do ar desaparecem das listas públicas, inclusive guardados. Compartilhar mantém Web Share, Clipboard e fallback manual.

## SEO e hospedagem

Configure `VITE_SITE_URL` antes do build para o domínio definitivo. Canonical, sitemap e redes usam essa origem. O admin é noindex/nofollow, excluído de robots e sitemap. O poema dinâmico usa a imagem social geral existente, com título e descrição próprios; não depende de PNG gerado por slug. As imagens antigas permanecem disponíveis, e `prepare:assets` é apenas uma ferramenta manual do acervo local.

A aplicação continua preparada para Sites/Cloudflare Workers. Não foi publicada esta atualização nem enviada ao repositório remoto. O banco ainda precisa ser criado e configurado; a integração real Auth/Data API não foi declarada validada. Consulte [docs/REVISAO-ADMIN.md](docs/REVISAO-ADMIN.md) para resultados e limites da verificação.

## Documentação

- [Ativar Supabase e rotina do autor](docs/SUPABASE.md)
- [Auditoria e decisões anteriores à implementação](docs/AUDITORIA-ADMIN.md)
- [Revisão desta implementação](docs/REVISAO-ADMIN.md)
- [Revisão visual original, antes do CMS](docs/REVISAO.md)
