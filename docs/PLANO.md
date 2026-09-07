# Noctiluz — direção e plano técnico

## Conceito
Uma publicação que se atravessa como um jardim à noite. O poema é a principal fonte de luz. A composição usa grandes intervalos, alinhamento editorial à esquerda e uma única presença botânica na entrada, sem painéis ou cartões de produto.

## Identidade e tipografia
Wordmark NOCTILUZ, serifado, em caixa alta e tracking generoso. Comparar visualmente Cormorant Garamond e EB Garamond antes da escolha final: Cormorant para títulos pela personalidade e contraste; EB Garamond como alternativa mais densa para leitura. Interface em Instrument Sans. No máximo duas famílias na entrega, locais e com font-display swap.

## Design system
Fundo #08090D, profundidade #0B0C12, superfície #101018. Texto #F2EEE8, secundário #AAA6AE. Luz violeta #9B7BFF nas ruínas, rosa #FF70B7 no jardim, ciano #55DDE0 no céu, âmbar #D7B76D no quarto/cartas, cinza no abismo. Acentos pontuais; linhas finas apenas em índices e ações. Escala espacial 4/8/12/16/24/32/48/64/96/144px. Cantos quase retos. Tokens de tipografia, espaço, duração e breakpoints centralizados.

## Arquitetura e sitemap
App Router, TypeScript, Tailwind; renderização estática onde possível e componentes de cliente somente para interações. Rotas: /, /poemas, /poemas/[slug], /lugares, /lugares/[slug], /em-portugues-se-diz, /para-voce, /guardados, /livro, /sobre, /busca e 404. Metadata por poema, canonical, Open Graph, Twitter, sitemap e robots. Hospedagem será avaliada pelo suporte da plataforma à stack solicitada.

## Conteúdo
Um JSON por poema em content/poems, descoberto automaticamente durante build. Campos: id, slug, title, excerpt, content, place, tags, date, featured, mood, accent, series, language; adicional demo identifica exemplos. Doze poemas de desenvolvimento, com 2 a 20 versos, marcados explicitamente como demonstração. Loader isolado para futura integração de CMS. Lugares em config/places: Jardim, Ruínas, Céu, Quarto, Abismo e Cartas, cada qual com descrição, sentimentos e acento.

## Experiência
Home: entrada literária → fragmentos → caminhos pelos Lugares → revelação de uma frase → poema por sentimento → livro → saída silenciosa. Índices em listas editoriais; leitura em coluna confortável com versos e estrofes preservados. Livro e redes sem dados reais terão indicação clara e nenhuma ação falsa.

## Componentes e interações
AmbientBackground, Wordmark, Navbar, Footer, PoemPreview, PlacePreview, FavoriteButton, ShareButton, Search, MoodSelector e PoemReveal. Guardados em localStorage, com recuperação de dados inválidos e feedback de falha. Busca normalizada por título, versos, tags, Lugar e série. Seleção por interseção de tags, determinística; recomendação exclui o poema atual. Web Share com fallback para copiar URL e opção manual em caso de bloqueio.

## Mobile e acessibilidade
Primeiro 360, 390 e 412px; menu colapsável, alvos de 44px, margens de 24px, versos sem overflow, tipografia fluida. Desktop: assimetria moderada e coluna editorial limitada. Sem scroll-jacking. HTML semântico, link de salto, foco visível, labels, contraste AA e estados anunciados. Respeitar reduced-motion. Animações de opacidade e deslocamento curto, 600–1000ms; pontos de luz mínimos e sem cursor customizado obrigatório.

## Sequência e validação
1. Configurar projeto, conteúdo e tokens.
2. Construir ambiente, navegação e primeira experiência.
3. Completar todas as rotas e interações.
4. Implementar SEO, previews e documentação de publicação.
5. Lint, typecheck, build, testes funcionais e navegação.
6. Inspeção visual desktop/mobile e comparação tipográfica.
7. Segunda passagem de ritmo/contraste; terceira passagem de remoção de excessos.
8. Entrega com estado real da publicação e instruções de manutenção.
