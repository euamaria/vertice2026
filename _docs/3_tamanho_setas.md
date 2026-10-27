# Estudo sobre o Tamanho das Setas no Consolidado v1

O usuário solicitou: *"Estudar a possibilidade de diminuir o tamanho das setas quando tem poucos nós. Acho que o tamanho máximo até que está funcionando bem, mas quando a QTD é muito pequena, daria para diminuir o tamanho das setas sem ficar um nó por cima do outro."*

## Análise do Atual Funcionamento (dossie-engine.js)

No arquivo `consolidado/assets/js/dossie-engine.js`, a função `renderDynamicDiagram` é responsável pela distribuição dos nós e pelo desenho das setas. A distribuição geométrica é gerenciada pela função `atualizarGeometriaResponsiva()`, que define as variáveis de raio (X e Y) estáticas baseadas no tamanho da tela:

```javascript
// Exemplo em Widescreen:
CX = 800;
CY = 550;
RX = 620; // Raio estático
RY = 410; // Raio estático
```

Os nós são então posicionados através das fórmulas:
```javascript
const angle = -Math.PI / 2 + (i * 2 * Math.PI / count);
const x = CX + RX * Math.cos(angle);
const y = CY + RY * Math.sin(angle);
```

Como `RX` e `RY` (raios da elipse) são **valores fixos**, não importando o número de nós renderizados, o comprimento das setas permanece sempre o mesmo. Isso significa que, independentemente de termos 32 nós ou 3 nós filtrados na tela, os nós sempre serão desenhados a uma distância equivalente a `RX` e `RY` em relação ao centro (vértice).

## Impacto Atual com Poucos Nós

Quando há poucos nós, a circunferência fica escassamente preenchida (ex: 3 nós formam um triângulo imenso). Embora não resulte em "um nó por cima do outro", as setas longas e o vasto espaço vazio podem prejudicar a estética e dificultar a associação visual com o centro, gerando uma experiência exagerada em termos de distância em relação ao vértice.

## Solução Proposta

Para diminuir o tamanho das setas (e consequentemente a distância dos nós em relação ao centro) de forma dinâmica, proporcional à quantidade de nós visíveis, sem gerar colisões, propõe-se um ajuste que calcula um "fator de escala" (scale factor) ou um raio dinâmico.

A ideia é que, quando o número de nós (`count`) for baixo (por exemplo, menor que 10 ou 15), o raio da elipse se contraia levemente, encurtando o comprimento visual da seta.

### Exemplo Lógico para o Raio Dinâmico

Poderíamos modificar os valores base de `RX` e `RY` com base no `count` no momento do loop de renderização:

```javascript
// Número máximo de nós para escala total (ex: 16 ou mais)
const maxNodesForFullScale = 16;

// Fator multiplicador mínimo (ex: quando há só 1 nó, a seta será 60% do tamanho total)
const minScale = 0.6;

// Fator de proporção baseado na quantidade
let countScaleFactor = count >= maxNodesForFullScale ? 1.0 : (minScale + ((count - 1) / (maxNodesForFullScale - 1)) * (1.0 - minScale));

// Variáveis locais para o desenho atual
const dynamicRX = RX * countScaleFactor;
const dynamicRY = RY * countScaleFactor;

// Posicionamento ajustado
const angle = -Math.PI / 2 + (i * 2 * Math.PI / count);
const x = CX + dynamicRX * Math.cos(angle);
const y = CY + dynamicRY * Math.sin(angle);
```

## Benefícios e Limitações

**Benefícios:**
- **Estética Melhorada:** Quando há poucos nós (ex: ao usar um filtro ou em dossiês menores), as setas serão mais curtas, tornando a visualização mais coesa e centralizada.
- **Leitura Visual:** Menor distância até o vértice facilita a visualização imediata da conexão.

**Limitações:**
- **Limite Mínimo Necessário:** É essencial ter um `minScale` (como `0.6` ou `0.5`) e limites mínimos (`centerRadius + outerNodeRadius + margin`) para não deixar os nós colidirem com o texto ou avatar do vértice central se as setas ficarem muito curtas.
- **Impacto no Zoom/Enquadramento:** O layout responsivo em monitores pode deixar muito espaço em branco nas margens quando o diagrama estiver retraído, precisando avaliar se é necessário ajustar também o "zoom-level" (`viewBox`) da SVG ou apenas a escala dos nós.

Esta solução oferece um meio-termo dinâmico que não requer reescrever a biblioteca gráfica, mantendo a geometria elíptica atual, mas incorporando uma contração paramétrica atrelada ao número de nós presentes.
