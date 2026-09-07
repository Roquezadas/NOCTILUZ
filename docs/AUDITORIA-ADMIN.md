# Auditoria e plano — Jardim do Autor

Base auditada: Noctiluz local em `site/`, commit b45a703. Esta é a aplicação já criada nesta tarefa; o endereço GitHub do briefing não é utilizado como uma segunda base.

## Estado confirmado

React 19.2.6, Vinext 1.0.0-beta.5, Vite 8, Tailwind 4 e Worker Cloudflare com nodejs_compat. `vinext build --prerender-all` pré-renderizava 28 rotas. O dispatcher instalado reconhece explicitamente `dynamic = 'force-dynamic'` e desativa cache da página nessas rotas. Conteúdo estava em import.meta.glob no módulo lib/poems.ts; componentes de descoberta importavam esse array no cliente. IDs demo-01…demo-12 alimentam guardados em localStorage. Home fixava dois slugs. Imagens OG dependiam do build. Layout raiz inseria atmosfera/nav/footer públicos em todas as rotas.

## Decisões antes da implementação

1. Manter Vinext/Workers, fontes, tokens, URLs e acervo original intactos.
2. Separar layouts com grupo (public); admin com shell próprio sem partículas.
3. Conteúdo público consultado no servidor por repository assíncrono; funções de busca/matching puras recebem arrays. Client Components recebem apenas poemas públicos serializados.
4. Fonte explícita CONTENT_SOURCE=static|supabase. Falha do Supabase nunca recorre silenciosamente aos JSON. Configuração runtime por allowlist; endpoint público entrega apenas URL, chave publishable validada e estado de configuração.
5. Supabase Auth no browser e JWT oficial, sem middleware/cookies/Server Actions específicos de Next. RLS é a fronteira efetiva; allowlist admin_users não pode ser alterada pelo usuário comum. Nenhuma service role no runtime.
6. Poemas e páginas que consultam banco usam force-dynamic. Livro/sobre permanecem pré-renderizáveis. Sitemap dinâmico; OG genérico seguro para conteúdo de banco, sem depender da existência de PNG por slug.
7. SQL com constraints, índices, updated_at e ID imutável. Publicação efetiva: published AND publish_at <= now(). Sem cron. Datas editoriais DATE; publicação TIMESTAMPTZ, editor em America/Manaus (UTC−04:00), explicitamente rotulado.
8. Admin: login, resumo, índice com filtros, novo/edição por ID, rascunho/publicar/agendar/despublicar/duplicar/excluir confirmado, tags e prévia com o reader real. Proteção de alterações não salvas; conflito de edição detectado por updated_at.
9. Importador local dry-run por padrão, demos excluídas por padrão, IDs/textos preservados, conflitos sem sobrescrita implícita.
10. Validação: TypeScript, lint, build, rotas estáticas e dinâmicas, testes de domínio e SQL em PostgreSQL local via PGlite. Integração Auth/Data API real terá teste opt-in documentado, pois o proprietário confirmou que ainda não criou projeto Supabase. Não declarar o serviço remoto configurado ou esse teste executado.

## Referências verificadas

- Supabase Auth e persistência: https://supabase.com/docs/reference/javascript/auth
- RLS e grants: https://supabase.com/docs/guides/database/postgres/row-level-security
- Chaves públicas/privilegiadas: https://supabase.com/docs/guides/getting-started/api-keys
- Senha: https://supabase.com/docs/guides/auth/passwords
- Compatibilidade/cache: node_modules/vinext/dist/server/app-page-dispatch.js, versão instalada.
