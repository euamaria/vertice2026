# Análise de Campos e Padronização no Consolidado v1

Este documento mapeia todos os campos do modelo consolidado, identifica aqueles que estão em branco ou faltando em comparação ao modelo mais completo, documenta necessidades de padronização, e mantém o registro da verificação contra os diagramas originais.

## 1. O "Super Conjunto" de Campos (O Modelo Mais Completo)

Analisando todos os nós em todos os dossiês dentro do `DossiesDB`, encontramos o seguinte conjunto total de campos possíveis:
`id, numero, titulo, subtitulo, categoria, cor, seta, descricao, operadores, status, codinome, cena, musicaTitulo, musicaEstilo, musicaGancho, fontes, timeline, nome, conexaoGrau, conexaoDesc, cifras, papel, proximidade, inqueritoDesc, modusOperandi, operacoes, statusJudicial, codinomes, musicaNome, musicaRitmo, musicaRefrão, googleQuery`

## 2. Necessidades de Padronização de Dados

Foram identificados vários campos com propósitos idênticos, mas com nomenclaturas diferentes (consequência da junção de diferentes HTMLs legados num único motor). Para que o motor de renderização (SPA) funcione de forma consistente e recursos como a Busca no Google, Cards e abas de detalhes funcionem para todos, precisamos padronizar:

- **`titulo` vs `nome`**: Representam a entidade principal do nó. Devemos adotar `titulo` (ou `nome`) universalmente.
- **`musicaTitulo` vs `musicaNome`**: Campos de música. Adotar um padrão único (ex: `musicaTitulo`).
- **`musicaEstilo` vs `musicaRitmo`**: Campos de estilo musical. Adotar um único.
- **`musicaGancho` vs `musicaRefrão`**: O trecho da música. Adotar um único.
- **`operadores` vs `papel` / `conexaoDesc`**: Alguns dossiês usam 'operadores', outros usam 'papel' e 'conexaoDesc' para explicar o envolvimento.
- **`status` vs `statusJudicial`**: O status atual do inquérito. Adotar apenas um.
- **`codinome` vs `codinomes`**: Plural x Singular. Adotar um único.
- **`googleQuery`**: Alguns poucos nós possuem esse campo. Ele alimenta o botão de busca. Ele deveria existir em TODOS os nós (ou ser gerado dinamicamente caso não exista, baseado no `titulo`).

## 3. Campos Faltando ou Em Branco (Comparados ao Modelo Completo)

Comparando a estrutura de cada nó individual contra o "super conjunto" de todos os campos possíveis, identificamos o que falta em cada um.

### Dossiê: O Vértice Central: Flávio Bolsonaro (esquemas16_v2)

**Campos Ausentes na Estrutura de Todos os Nós:**
- `nome`
- `conexaoGrau`
- `conexaoDesc`
- `cifras`
- `papel`
- `proximidade`
- `inqueritoDesc`
- `modusOperandi`
- `operacoes`
- `statusJudicial`
- `codinomes`
- `musicaNome`
- `musicaRitmo`
- `musicaRefrão`
- `googleQuery`

### Dossiê: A Teia de Flávio: 20 Personagens, Conexões e Cifras (personagens20)

**Campos Ausentes na Estrutura de Todos os Nós:**
- `titulo`
- `seta`
- `descricao`
- `operadores`
- `status`
- `codinome`
- `musicaTitulo`
- `musicaEstilo`
- `musicaGancho`
- `googleQuery`

### Dossiê: A Teia de Flávio: 32 Personagens, Cifras e Inquéritos (personagens32)

**Campos Ausentes na Estrutura de Todos os Nós:**
- `titulo`
- `seta`
- `descricao`
- `operadores`
- `status`
- `codinome`
- `musicaTitulo`
- `musicaEstilo`
- `musicaGancho`
- `googleQuery`

### Dossiê: O Vértice Armamentista: Decretos, Milícias & Arsenais (armamentista)

**Campos Ausentes na Estrutura de Todos os Nós:**
- `titulo`
- `seta`
- `descricao`
- `operadores`
- `status`
- `codinome`
- `musicaTitulo`
- `musicaEstilo`
- `musicaGancho`

### Dossiê: O Vértice das Rachadinhas: A Teia de Flávio Bolsonaro na ALERJ (rachadinha)

**Campos Ausentes na Estrutura de Todos os Nós:**
- `titulo`
- `seta`
- `descricao`
- `operadores`
- `status`
- `codinome`
- `musicaTitulo`
- `musicaEstilo`
- `musicaGancho`
- `googleQuery`

## 4. Verificação de Migração (Fidelidade da Cópia Original)

Abaixo está a análise original verificando se informações presentes nos antigos diagramas `.html` foram copiadas corretamente para o consolidado.

### Dossiê: O Vértice Central: Flávio Bolsonaro


Nenhum campo vazio/fora do padrão encontrado e todas as informações foram copiadas com sucesso de forma idêntica.

## Dossiê: A Teia de Flávio: 20 Personagens, Conexões e Cifras

Nenhum campo vazio/fora do padrão encontrado e todas as informações foram copiadas com sucesso de forma idêntica.

## Dossiê: A Teia de Flávio: 32 Personagens, Cifras e Inquéritos

Nenhum campo vazio/fora do padrão encontrado e todas as informações foram copiadas com sucesso de forma idêntica.

## Dossiê: O Vértice Armamentista: Decretos, Milícias & Arsenais

Nenhum campo vazio/fora do padrão encontrado e todas as informações foram copiadas com sucesso de forma idêntica.

## Dossiê: O Vértice das Rachadinhas: A Teia de Flávio Bolsonaro na ALERJ

Nenhum campo vazio/fora do padrão encontrado e todas as informações foram copiadas com sucesso de forma idêntica.
