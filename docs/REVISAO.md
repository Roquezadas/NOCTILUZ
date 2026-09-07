# Revisão da primeira versão

## Funcional

Lint e TypeScript sem erros no código do produto. Build de produção concluído, 28 rotas pré-renderizadas (inclui 404), 27 caminhos de conteúdo. Validação HTTP executada também contra o Worker de produção local: 27 páginas com H1, canonical e OG, três URLs inexistentes com 404 real, doze imagens OG PNG válidas, sitemap com todos os poemas e robots.

Navegador: menu móvel abre e fecha ao navegar; poema aberto a partir da listagem; guardar persiste ao recarregar e aparece em Guardados; compartilhamento nativo retorna sucesso; busca AUSENCIA encontra dois poemas, ignorando acentos e caixa; termo inexistente mostra o estado vazio. Seleção “sinto falta de alguém” encontra “inventário da ausência”; revelação de frase exibe os versos e link correto. Web Share depende do sistema; a cópia automática e a cópia manual possuem tratamento de falha, mas não foi possível forçar todos os diálogos de permissão do sistema neste navegador.

## Visual — primeira passagem

Comparação visual Cormorant Garamond × EB Garamond: mantida Cormorant por ritmo mais aberto e delicado. Instrument Sans para ações. Corrigido carregamento das fontes: referências locais absolutas ao diretório público, eliminando URLs relativas incorretas identificadas no primeiro build. Imagem WebP de aproximadamente 19 KB, sem requisição externa.

## Visual — segunda passagem

Entrada, poema curto e poema longo inspecionados no navegador. Texto permanece à esquerda, sem decoração ao lado dos versos. Tela de 390px mantém margens confortáveis, título legível e ação de entrada visível. Layouts de entrada, Lugares, poema longo, livro e seleção de sentimento medidos em 360px e 390px sem overflow horizontal. Entrada, Lugares e poema longo também verificados em 412px. A composição desktop foi verificada em 1440px. Ajustes intermediários respeitam 640/900px.

## Simplificação — terceira passagem

Um único asset botânico, nenhum card de feature, partículas limitadas a três pontos minúsculos. Sem cursor customizado, parallax, efeito de vidro, animação de zoom, vídeo ou biblioteca de motion. A revelação usa apenas opacidade e pequeno deslocamento. Nenhum botão de compra ou link social fictício. As informações ausentes do livro são identificadas. Os exemplos não são atribuídos ao autor real.

## Limites explícitos

Doze poemas são dados de demonstração, não o acervo real. Perfis sociais, sinopse, capa, edição e compra aguardam materiais oficiais. Guardados não sincronizam entre dispositivos. O runtime é Vinext beta compatível com App Router, não o pacote oficial Next.js. A hospedagem privada não permite indexação pública nem acesso dos robôs de redes sociais; metadata e imagens estão prontas para quando houver publicação pública autorizada. Não foi realizada auditoria formal WCAG nem medição Lighthouse; houve revisão de semântica, contraste, foco, reduced-motion e layout.
