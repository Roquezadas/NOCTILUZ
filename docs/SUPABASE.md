# Ativar o Jardim do Autor

O mesmo Noctiluz agora possui um CMS privado em `/admin`. A conexão ainda não foi ativada: o proprietário informou que não criou um projeto Supabase. O modo inicial continua sendo `static`, com os 12 exemplos locais. Nenhum usuário, banco remoto ou credencial foi criado nesta entrega.

## 1. Criar o projeto e aplicar o banco

1. No painel Supabase, crie um projeto e guarde a senha do banco no seu gerenciador de senhas. Essa senha não é usada pelo site.
2. Abra **SQL Editor**, copie integralmente `supabase/migrations/202609060001_author_garden.sql` e execute uma vez. O arquivo usa uma transação: uma falha não deixa metade da estrutura criada.
3. Confirme as tabelas `public.poems` e `public.admin_users` e que ambas estão com RLS habilitado. Não desative RLS para resolver erros de acesso.

Alternativa com a CLI oficial, instalada separadamente:

```sh
supabase login
supabase init
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Execute na pasta `site`. `supabase init` cria a configuração local da CLI; as migrations deste projeto já estão em `supabase/migrations`. Escolha SQL Editor **ou** CLI para a primeira aplicação. Se já executou pelo SQL Editor e passar a usar CLI, reconcilie o histórico conforme a documentação da CLI; não execute novamente a criação das tabelas. Mudanças futuras devem ter novos arquivos de migration. Não use `db reset` em um banco com conteúdo real.

## 2. Criar a conta do autor

1. Em **Authentication → Users**, crie o usuário de Marcelo com e-mail e senha. Confirme o e-mail pelo painel se necessário. O site não oferece cadastro.
2. Em configuração de provedores de autenticação, mantenha e-mail/senha habilitado e desabilite cadastros públicos se não forem necessários. Configure a URL definitiva do site em **Authentication → URL Configuration**. O login atual é por senha, sem callback OAuth.
3. Copie o **UUID** do usuário criado. No SQL Editor, executado como administrador do banco, substitua o UUID abaixo pelo valor real:

```sql
insert into public.admin_users (user_id)
values ('UUID-DO-USUARIO-AUTOR')
on conflict (user_id) do nothing;
```

O UUID é a identificação da conta, não o e-mail. Somente essa associação concede permissão editorial. Ser um usuário autenticado não basta. Não há botão de autopromoção ou criação de administradores no site. Para revogar acesso:

```sql
delete from public.admin_users where user_id = 'UUID-DO-USUARIO-AUTOR';
```

A revogação bloqueia as próximas operações no banco imediatamente. Dados que já estavam abertos no navegador não podem ser recolhidos remotamente; encerre a sessão no aparelho quando aplicável.

## 3. Configurar o Noctiluz

Copie `.env.example` para `.env.local` (ignorado pelo Git):

```dotenv
CONTENT_SOURCE=static
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
VITE_SITE_URL=http://127.0.0.1:3001
```

Encontre URL e chave pública no diálogo **Connect** ou em **Settings → API Keys**. Uma chave legada `anon` também é aceita. **Nunca** coloque chave `service_role`, `sb_secret_...` ou senha do banco nesta configuração. A aplicação rejeita chaves privilegiadas no campo público, inclusive antes de gerar os bindings do build.

| Variável                   | Onde atua                                | Conteúdo                                                              |
| -------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `CONTENT_SOURCE`           | Servidor/runtime                         | `static` ou `supabase`; erros de digitação interrompem a configuração |
| `SUPABASE_URL`             | Servidor e configuração pública do admin | URL HTTPS do projeto; localhost HTTP permitido no desenvolvimento     |
| `SUPABASE_PUBLISHABLE_KEY` | Servidor e browser                       | Somente publishable/anon; a proteção dos dados está em RLS            |
| `VITE_SITE_URL`            | Build                                    | Origem absoluta para canonical, sitemap e imagens sociais             |

`/api/public-config` entrega apenas as três informações públicas necessárias e `configured`, com `Cache-Control: no-store`. Nenhum segredo é enviado. O cliente público do servidor desabilita persistência/renovação de sessão e sempre usa a chave pública, sem cookies ou JWT do autor. O admin usa outro cliente, com sessão oficial do Supabase armazenada neste navegador.

Reinicie `npm run dev` ao mudar `.env.local`. Para a versão compilada: `npm run build` e `npm run start`. O build copia somente a allowlist de três variáveis de runtime para a configuração local do Worker. Em uma futura hospedagem, configure as mesmas variáveis no ambiente do Worker/Sites e use `VITE_SITE_URL` com o domínio final. Alterar configuração é diferente de publicar um poema: a rotina editorial não executa build.

## 4. Importar, conferir e trocar a fonte

O importador é **somente local** e nunca é executado pelo build. O padrão é dry-run, exclui demos e importa como rascunhos. Os arquivos JSON originais não são alterados.

```sh
npm run import:poems
npm run import:poems -- --dry-run --include-demo
```

No Windows, se seu terminal não encaminhar flags, use `npm.cmd --% run import:poems -- --dry-run --include-demo` no PowerShell.

Para verificar conflitos no banco e importar, defina `SUPABASE_URL` e `SUPABASE_IMPORT_KEY` **apenas no terminal local**, usando sua chave secreta/service role do Supabase. Não registre o valor no histórico do shell: carregue-o pelo gerenciador de segredos ou use `Read-Host -MaskInput` no PowerShell 7. Não coloque essa chave em `.env.local`, bindings de hospedagem, código, capturas ou Git. Ao terminar, remova a variável do ambiente do terminal.

```sh
npm run import:poems -- --dry-run --include-demo
npm run import:poems -- --apply --include-demo
```

Sem `--include-demo`, os 12 exemplos atuais são ignorados, propositalmente. `--apply` autoriza escrita. `--publish` publica imediatamente os registros importados; omiti-lo cria rascunhos. `--overwrite` permite atualizar um ID já existente e pode substituir seu conteúdo e estado: faça backup antes. Um slug pertencente a outro ID continua sendo recusado. Todos os conflitos são verificados antes da primeira escrita; a inserção/upsert em lote é uma única operação PostgreSQL. Constraints também impedem conflitos ocorridos após a verificação.

IDs, versos, espaços e quebras de linha são preservados. Não há `trim()` ou normalização do texto poético. Preservar o ID mantém os guardados existentes; um poema em rascunho simplesmente não aparece na coleção pública.

Após conferir os poemas no `/admin`, mude:

```dotenv
CONTENT_SOURCE=supabase
```

Reinicie a prévia/reconfigure o runtime da hospedagem. A partir daí, **Supabase é a fonte de verdade**. Um banco vazio mostra estados vazios; uma conexão indisponível mostra erro. Nenhum desses casos retorna silenciosamente aos JSON. Os JSON são apenas exemplos/importação; não precisam acompanhar as edições no CMS.

## 5. Rotina editorial

1. Abra `/admin` e entre com e-mail e senha da conta autorizada.
2. Escolha **novo poema**, escreva título e versos e selecione Lugar/sentimentos. Enter adiciona sentimentos; chips permitem remover.
3. Veja a prévia ao lado no computador ou na aba **Prévia** no celular. É o mesmo `PoemReader` público, sem ações de compartilhar nem endereço acessível para rascunhos.
4. **Salvar rascunho** mantém o texto privado. **Publicar agora** o libera. **Agendar publicação** escolhe um instante futuro em Manaus (UTC−04:00). Não há autosave: o estado informa alterações não salvas.
5. Para a série, marque “Em português se diz” e escreva a frase cotidiana. O fragmento das listas é extraído das três primeiras linhas não vazias; pode ser personalizado em “Outras escolhas”.
6. Use “Destacar na entrada” e a ordem numérica para escolher os dois fragmentos da home. Se faltarem destaques, o site completa com os mais recentes.
7. Em um poema publicado, salve alterações, retire do site ou altere seu agendamento. Retirar/cancelar converte para rascunho. Alterar o slug publicado pede confirmação porque o endereço antigo deixa de funcionar; não há histórico de redirecionamentos.
8. “Duplicar” cria outro ID em rascunho, com slug novo e sem destaque. “Excluir” é permanente e pede confirmação. Edições concorrentes são recusadas quando `updated_at` mudou; reabra o poema antes de substituir outra edição.
9. Use **sair** em aparelhos compartilhados. A sessão local é removida e o conteúdo administrativo desmontado. Links da área editorial usam navegação de documento para respeitar o aviso do navegador ao voltar/sair com alterações, além da confirmação interna ao clicar em links ou sair da conta.

A publicação utiliza `status = published AND publish_at <= now()` no banco, além do filtro público. Agendamentos não dependem de cron, build nem do relógio do computador do visitante. A data exibida no poema (`poem_date`) é independente do instante de publicação. Novas leituras HTTP refletem a publicação; uma página já aberta deve ser atualizada para mostrar alterações recentes.

## 6. Segurança e arquitetura

- `poems`: ID textual estável, slug único, metadados, conteúdo `text`, data editorial `date`, publicação e auditoria `timestamptz`.
- `admin_users`: allowlist ligada a `auth.users`; autenticados só leem sua própria associação. Nenhum usuário do site pode inserir/alterar a allowlist.
- Visitantes e contas sem acesso leem somente publicados já liberados. Apenas allowlist autenticada tem CRUD. A proteção efetiva é RLS no PostgreSQL, não a interface ou o `noindex`.
- Triggers preservam ID/data de criação, atualizam `updated_at` e validam tags. Constraints validam publicação, Lugar, atmosfera, conteúdo, slug e série. Índices cobrem slug, publicação, Lugar, destaques e tags.
- Rotas do admin não contêm dados privados no HTML inicial e são `noindex,nofollow`; robots exclui `/admin`. O sitemap usa somente o repository público, dinamicamente.
- `getPublishedPoems` usa `cache` do React por render e páginas `force-dynamic`; não mantém cache compartilhado de acervo ou fallback de banco. Busca, série, guardados e recomendações recebem apenas o acervo público serializado.
- O servidor jamais reutiliza a sessão do navegador do autor. Renderizar o site público enquanto o autor está logado não amplia permissões.
- Textos são renderizados como texto React, sem HTML arbitrário. Não há uploads, editor HTML, endpoint de administração com service role ou cadastro público criado pelo aplicativo.
- Open Graph usa a imagem geral já existente para conteúdo dinâmico, com título/descrição do poema. Novos slugs não dependem de PNG gerado no build. Geração dinâmica de imagens individuais fica como evolução opcional.

## 7. Verificação

```sh
npm run lint
npm run typecheck
npm test
npm run build
node scripts/check-routes.mjs http://127.0.0.1:3001
```

O último comando usa o acervo inicial em modo `static`. Os testes de domínio verificam os 12 JSON, mapper, espaços, IDs, busca, ordem, estados, fuso e rejeição de chaves privilegiadas. `test:security` executa **a migration real** em PostgreSQL via PGlite, com papéis anon/autenticado, três casos de visibilidade, escrita negada, allowlist, revogação, constraints e trigger. Somente `auth.users`/`auth.uid()` são fixtures locais; isso não equivale a testar GoTrue, JWT e a Data API do projeto remoto.

### Integração real, após criar o projeto

Use um projeto de teste e crie duas contas reais: autor allowlisted e leitor sem allowlist. Defina no terminal (não em arquivos versionados): as duas variáveis públicas Supabase, `SUPABASE_TEST_AUTHOR_EMAIL`, `SUPABASE_TEST_AUTHOR_PASSWORD`, `SUPABASE_TEST_READER_EMAIL`, `SUPABASE_TEST_READER_PASSWORD`, `SUPABASE_TEST_ALLOW_WRITES=yes`. Opcionalmente `NOCTILUZ_TEST_URL=http://127.0.0.1:3001` para incluir rotas e sitemap com `CONTENT_SOURCE=supabase`.

```sh
npm run test:supabase
```

Esse teste faz login/renovação reais, verifica RLS por Data API, cria somente seu próprio registro `integration-...`, testa rascunho/agendamento/publicação/despublicação e o remove no final. Com a URL local, também verifica novo slug sem build, 404 privado e sitemap atualizado. Não cria usuários nem concede permissões automaticamente. Não foi executado nesta entrega porque ainda não há projeto Supabase.

Complete a aceitação visual com a conta real: login, novo poema com espaços/estrofes, rascunho, recarga, edição, publicação, busca/Lugar/home/série/guardados, agendamento e cancelamento, duplicação, exclusão confirmada, logout e acesso negado ao leitor. Confira em 360/390/412 px as abas, teclado, formulários e ausência de rolagem horizontal. A ferramenta de navegador desta sessão falhou ao inicializar; a nova interface não foi declarada visualmente validada.

## Referências oficiais

- [Chaves e diálogo Connect](https://supabase.com/docs/guides/getting-started/api-keys)
- [RLS e políticas](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Autenticação por senha](https://supabase.com/docs/guides/auth/passwords)
- [Usuários e identidades](https://supabase.com/docs/guides/auth/users)
- [Cliente Auth e persistência](https://supabase.com/docs/reference/javascript/auth)
- [Migrations e ambientes locais](https://supabase.com/docs/guides/local-development/overview)
