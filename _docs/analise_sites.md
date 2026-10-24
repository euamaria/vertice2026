# Análise dos Arquivos em /sites

## 1. Visão Geral
A pasta `/sites` contém 6 arquivos HTML que representam a evolução de uma aplicação interativa (um "dossiê" ou diagrama radial) focada em mapear conexões, operadores e esquemas.

**Arquivos analisados:**
- `16esquemas.html`
- `16esquemas-v2.html`
- `20personagens.html`
- `32personagens.html`
- `armamentista.html`
- `rachadinha.html`

Todos os arquivos compartilham a mesma arquitetura base: um único arquivo HTML contendo marcação (DOM), estilos (CSS via Tailwind e tags `<style>`), e lógica (JavaScript inline), além dos dados inseridos diretamente no código fonte (hardcoded).

---

## 2. O Que Temos em Comum (Padrões e Estruturas)

Em todos os arquivos, identificamos a seguinte estrutura e funcionalidades de interface base:

1. **Stack Tecnológica Básica:**
   - HTML5 com Tailwind CSS (via CDN).
   - Uso de fontes do Google Fonts (`Inter` e `JetBrains Mono`).
   - Sem dependências de bibliotecas JS pesadas (Vanilla JS para a lógica).

2. **Layout Geral:**
   - **Header (`<header>`):** Contém logo, título do dossiê, badges informativos e uma barra de ferramentas com ações rápidas (filtros, troca de tema, zoom, som, alternância de visão).
   - **Área Principal (`<main>`):** Apresenta o conteúdo de duas formas intercambiáveis:
     - *Visão Radial (Diagrama 360°)* em SVG, onde há um nó central e "N" nós periféricos conectados por setas apontando para o centro.
     - *Visão em Grade (Grid/Cards)*, responsiva, listando todos os nós em formato de cartões.
   - **Modal de Detalhamento (`#modal-backdrop`):** Um painel flutuante rico em conteúdo, exibindo os dados completos de um nó ao ser clicado. Possui abas de navegação (ex: Fatos, Sátira).
   - **Rodapé (`<footer>`):** Um texto simples informativo.
   - **Legendas e Dicas Flutuantes:** Elementos sobrepostos ao diagrama para orientar o usuário e legendar as cores.

3. **Funcionalidades de Interface (UI/UX):**
   - Alternância entre **Modo Claro (Light) / Escuro (Dark)**.
   - Alternância de **Estilo de Layout** (Clean Moderno vs. Noir Investigativo).
   - **Filtros por Categoria:** Oculta nós e setas no diagrama que não pertencem à categoria selecionada.
   - **Feedback Sonoro (Beeps):** Síntese de áudio usando a Web Audio API nativa para interações (cliques, hover, troca de tema, etc).
   - Efeito visual de *Highlight* (destaque) nas setas de conexão ao fazer hover nos nós.

---

## 3. O Que Se Repete (Código Duplicado)

Devido ao desenvolvimento iterativo baseado na cópia e modificação de arquivos, muito código é duplicado:

- **Configuração do Tailwind e CSS Base:** Praticamente idênticos, variando apenas pequenos detalhes de cor ou animação.
- **Marcação do Header e Modal:** O HTML do header, dos botões de controle e da estrutura do modal se repetem, com variações no número de abas ou ícones.
- **Motor de Renderização SVG (`renderDiagram`):** O código que calcula as posições em um círculo (fórmula trigonométrica $x = CX + RX \cdot \cos(\theta)$ e $y = CY + RY \cdot \sin(\theta)$) e cria dinamicamente elementos `<line>`, `<g>`, `<circle>`, `<text>`.
- **Lógica de Áudio (`playBeep`):** A mesma função de síntese de onda ('sine', 'triangle') copiada em todos.
- **Lógica de Interface:** Funções como `alternarTemaCor`, `alternarLayoutEstilo`, `alternarVisao`, `fecharModal`, `abrirModalCentro`.

---

## 4. O Que Tem de Diferente (Evolução Funcional)

Ao longo das versões, o código evoluiu ganhando novas funcionalidades ("features"):

1. **Complexidade do Modal e Abas:**
   - *16esquemas.html:* Modal básico com 2 abas (Fatos Forenses e Sátira/Arte).
   - *Versões seguintes:* O modal se expande para 4 abas, adicionando "Fontes/Notícias" e "Linha do Tempo (Cronologia)".

2. **Interatividade de Pan & Zoom no Diagrama:**
   - *Versões antigas:* Apenas botões de Zoom (+ / - / Reset).
   - *Versões novas (32personagens, armamentista):* Implementação de Pan & Zoom avançado. Suporte a clique-e-arraste (mouse drag), scroll do mouse (wheel) para zoom centrado no ponteiro, e gestos de toque em dispositivos móveis (pan com 1 dedo, pinch-to-zoom com 2 dedos).

3. **Geometria Responsiva (Mobile vs Desktop):**
   - *Versões recentes (armamentista):* Cálculo adaptativo (`isPortraitMode`), onde os eixos `RX` e `RY` mudam para formar uma elipse vertical em telas de celular, melhorando drasticamente o uso de espaço.

4. **Filtros Avançados:**
   - *armamentista e rachadinha:* Adição de uma barra de busca em texto (`search-input`) em tempo real.
   - Adição de um **slider (controle deslizante)** para limitar a quantidade de nós renderizados, redistribuindo geometricamente os nós restantes em perfeitos 360°.

5. **Integração Externa:**
   - *32personagens, armamentista:* Adição de botões no modal para gerar pesquisas inteligentes no "Google IA" com base na propriedade `googleQuery`.

---

## 5. O Que São Apenas Dados

Os dados estão misturados no arquivo HTML sob a forma de arrays e objetos na tag `<script>`, além do nó central que está no HTML e em uma função própria. Os dados são:

1. **Os Arrays Principais:**
   - Recebem nomes como `nodesData`, `charactersData`, `armasData`, `rachadinhasData`.
   - Contêm objetos com chaves que evoluíram, incluindo propriedades essenciais como:
     - *Identificação:* `id`, `numero`, `titulo`/`nome`, `subtitulo`
     - *Visualização:* `categoria`, `cor`
     - *Fatos:* `seta`/`conexaoGrau`, `descricao`/`conexaoDesc`, `operadores`/`papel`, `status`/`statusJudicial`, `inqueritoDesc`, `modusOperandi`
     - *Cifras (nas versões mais novas):* Array de strings `cifras`.
     - *Arte/Sátira:* `codinome` (ou array de `codinomes`), `cena`, `musicaTitulo`, `musicaEstilo`, `musicaGancho`/`musicaRefrão`.
     - *Evidências:* Array de objetos `fontes` (com `veiculo`, `titulo`, `data`, `resumo`, `link`).
     - *Cronologia:* Array de objetos `timeline` (com `ano`, `texto`).
     - *Integração:* `googleQuery`.

2. **Dados do Nó Central (O Vértice):**
   - Atualmente, as informações do "Nó Central" (ex: "Flávio Bolsonaro") estão _hardcoded_ tanto na marcação SVG (textos em `<text>`) quanto no método JavaScript `abrirModalCentro()` em cada arquivo.

---

## 6. Plano Estruturado para a Nova Versão Unificada

O objetivo é extrair o melhor da interface (a versão mais avançada) e criar uma arquitetura que separe os dados da visualização, suportando todos os temas do diretório `/sites`.

### Etapa 1: Centralização e Estruturação dos Dados
- Extrair as listas de dados de todos os arquivos HTML (`16esquemas-v2`, `20personagens`, `32personagens`, `armamentista`, `rachadinha`).
- Extrair os dados correspondentes aos Nós Centrais (O Vértice) e as Metainformações de cada Dossiê (Título, categorias disponíveis com suas cores e nomes).
- Criar um arquivo `assets/js/dossies-data.js` que exporte um grande objeto `DossiesDB`, contendo chaves como `esquemas16`, `personagens20`, `armamentista`, etc. Cada chave conterá a configuração do dossiê, nós e propriedades.

### Etapa 2: Criação do Motor de Interface Central (SPA)
- Desenvolver um arquivo HTML único, limpo, importando a estrutura de layout e SVG da versão mais avançada (ex: `armamentista.html`).
- Mover a lógica JS (Pan & Zoom, Áudio, Filtros, Modal, Renderização Dinâmica) para `assets/js/dossie-engine.js`.
- A lógica de renderização deve ser adaptada para ler dados arbitrariamente. Se um nó não tiver `cifras` ou `timeline`, a interface (o modal) deve ocultar as seções ou abas correspondentes para evitar quebra.

### Etapa 3: Sistema de Seleção de Dossiê
- Adicionar ao `<header>` um componente (Dropdown / Select ou Menu Off-canvas) que liste todos os dossiês disponíveis.
- Ao selecionar um dossiê, a função JS limpará o palco SVG/Grid e chamará a renderização completa, populando as variáveis, categorias, botões de filtro, cor do nó central e os nós periféricos.

### Etapa 4: Unificação das Features Premium
A nova versão usará integralmente:
- A engine responsiva que forma elipses verticais em Mobile (evita nós cortados fora da tela).
- Sistema híbrido de Pan & Zoom: suportando mouse wheel, arrasto, botões UI e gestos touch com 2 dedos.
- Filtro por caixa de texto (Busca em Tempo Real) e Slider de quantidade.
- Integração de busca no Google IA nos modais.
- Efeitos sonoros mantidos via Web Audio API.

### Etapa 5: Qualidade e Verificação (Pre-commit)
- Testar exaustivamente a alternância de datasets no navegador.
- Validar as abas do modal em casos de nós simples (da primeira versão 16esquemas) vs nós complexos (32personagens).
- Rodar validações conforme o plano de testes do repositório (AGENTS.md, etc.) ou orientações estritas da plataforma.
- Efetuar commit de finalização e refatoração geral.
