# Backlog e Próximos Passos (O Vértice)

Este documento centraliza as tarefas de refatoração, otimização e melhorias futuras identificadas no projeto.

## O Vértice Consolidado (V1)

- **Normalização Definitiva de Dados:** Embora a interface agora tolere variações (lendo `nome` ou `titulo`), o ideal seria executar um script de transformação definitiva em `dossies-data.js` padronizando todas as chaves.
- **Motor de Busca Aprimorado (Fuzzy Search):** A busca por categoria atende perfeitamente ao texto exato, mas um sistema de busca mais robusto pode ser explorado.
- **Otimização de Carregamento (Lazy Load):** Como `DossiesDB` contém grandes bases de dados carregadas em memória simultaneamente, para futuras expansões (se ultrapassar megabytes), seria recomendável carregar o JSON do dossiê específico apenas sob demanda via `fetch()`.
