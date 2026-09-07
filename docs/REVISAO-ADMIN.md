# Revisão do Jardim do Autor — 6 de setembro de 2026

Implementação sobre o mesmo Noctiluz local, preservando Vinext, identidade visual, URLs públicas e os 12 JSON originais. Não houve clone de outro repositório, criação de Supabase, publicação nem push remoto.

## Entregue

- Área `/admin` com layout próprio, login, verificação de conta na allowlist, resumo, acervo com busca/filtros/ordem e criação/edição por ID.
- Editor com prévia compartilhada com a leitura pública, tags, Lugar, atmosfera, série/frase, fragmento, destaque/ordem, data, rascunho/publicação/agendamento, cancelamento e despublicação. Duplicação em rascunho e exclusão confirmada. Slug existente não muda com o título; sua alteração publicada é confirmada. Conflitos de edição usam `updated_at`.
- Sessão oficial persistente/renovável e saída local. Avisos de alterações não salvas em links/saída; navegação de documento na área privada permite o aviso nativo ao voltar/sair.
- Repositories separados, mapper tipado, consultas públicas anônimas independentes da sessão do autor, fonte explícita e páginas dinâmicas. Estados vazios e erro editorial sem fallback silencioso.
- Migration real com tabelas, RLS, políticas, constraints, índices, identidade imutável e timestamps. Importador local dry-run, com demos e sobrescrita opt-in.
- Configuração documentada, `.env.example` sem segredos, README da rotina editorial e script opt-in de integração remota.

## Verificado nesta implementação

| Verificação                                                          | Resultado                                                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                                                       | Sem erros no código da aplicação                                                                                |
| `npm run typecheck`                                                  | Sem erros                                                                                                       |
| `npm test`                                                           | Domínio + PostgreSQL/PGlite aprovados                                                                           |
| `npm run build`                                                      | Compilação padrão aprovada                                                                                      |
| Build com `CONTENT_SOURCE=supabase` sem URL/chave                    | Aprovado, sem consultar banco ou validar JSON como fonte de verdade                                             |
| `node scripts/check-routes.mjs http://127.0.0.1:3001`                | 27 páginas públicas, 3 erros 404, 12 OG legados, sitemap e robots                                               |
| `node scripts/check-admin-routes.mjs http://127.0.0.1:3001`          | Cinco rotas de admin com noindex/nofollow, no-store e sem dados privados                                        |
| Mesmo teste com `--unconfigured-supabase`, instância temporária 3002 | Oito páginas exibem erro editorial no HTML; nenhum retorno aos demos; sitemap falha em vez de inventar conteúdo |
| Importador `--dry-run --include-demo`                                | 12 poemas válidos, rascunhos; nenhuma escrita/acesso remoto sem variáveis                                       |
| Bundle cliente                                                       | Sem IDs demo estáticos e sem importador/chave privilegiada da aplicação                                         |

O teste PostgreSQL executa a migration versionada com papéis `anon` e `authenticated`: público lê só liberados; leitor não escreve nem se promove; autor cria/edita/exclui, vê privados e não altera IDs; revogação remove o acesso. Também verifica unicidade, tags, série, lugares, agendamento, despublicação, espaços e `updated_at`. As identidades e `auth.uid()` são fixtures; o mecanismo de RLS e SQL é real dentro do PGlite.

## Limites reais

O proprietário ainda não criou projeto Supabase. Portanto **não foram executados login, renovação de JWT, Data API e CRUD remoto reais**, nem o fluxo editorial completo com essa conta. `npm run test:supabase` e o roteiro manual estão prontos para a ativação. Nenhum mock de backend ou bypass de autenticação foi inserido na aplicação.

A ferramenta de navegador falhou antes de inicializar, com `failed to write kernel assets ... path not found`, inclusive após reset. Por isso a interface nova **não recebeu validação visual/interativa em desktop e 360/390/412 px nesta etapa**. O CSS responsivo e as abas estão implementados; não se confundem com um teste visual executado. A revisão anterior registra apenas a versão pública anterior ao CMS.

As páginas de erro de acervo preservam o shell e mostram indisponibilidade; no runtime atual respondem 200 com `no-store`. O sitemap indisponível responde 500 para não fornecer uma lista falsa. A metadata do poema indisponível usa noindex. Uma página já aberta precisa ser atualizada para refletir uma edição posterior.

Imagens sociais individuais dinâmicas, histórico de slugs/redirecionamentos, autosave e recuperação de versões são evoluções opcionais. O fallback social é a imagem geral existente com metadata própria do poema. O salvamento atual é manual e a exclusão é permanente após confirmação.

## Ativação restante

Siga `docs/SUPABASE.md`: criar projeto, aplicar migration, criar conta, inserir UUID na allowlist, configurar URL/chave pública, conferir/importar poemas e ativar `CONTENT_SOURCE=supabase`. Depois execute a integração opt-in e a aceitação visual. A prévia local padrão permanece em `http://127.0.0.1:3001`, no modo static enquanto essa configuração não for feita.
