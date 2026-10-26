
window.currentDossie = null;

window.mudarDossie = function(dossieId) {
    if (!DossiesDB[dossieId]) return;
    window.currentDossie = DossiesDB[dossieId];

    if (window.currentDossie.centerNode) {
        let cn = window.currentDossie.centerNode;
        if (document.getElementById('center-text-title1')) if (document.getElementById('center-text-title1')) document.getElementById('center-text-title1').textContent = cn.text1 || '';
        if (document.getElementById('center-text-title2')) if (document.getElementById('center-text-title2')) document.getElementById('center-text-title2').textContent = cn.text2 || '';
        if (document.getElementById('center-text-sub1')) if (document.getElementById('center-text-sub1')) document.getElementById('center-text-sub1').textContent = cn.sub1 || '';
        if (document.getElementById('center-text-sub2')) if (document.getElementById('center-text-sub2')) document.getElementById('center-text-sub2').textContent = cn.sub2 || '';
    }

    if(document.getElementById('search-input')) if (document.getElementById('search-input')) document.getElementById('search-input').value = '';

    currentLimit = window.currentDossie.nodes.length;
    if(document.getElementById('node-count')) {
        let nodeCountEl = document.getElementById('node-count');
        nodeCountEl.max = currentLimit;
        nodeCountEl.value = currentLimit;
    }
    if(document.getElementById('node-count-display')) {
        const totalNodes = window.currentDossie.nodes.length;
        document.getElementById('node-count-display').textContent = currentLimit + '/' + totalNodes;
    }

    currentCategory = 'todas';
    populateCategories();
    renderDynamicDiagram();
}

const defaultColors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
let catColorMap = {};

function getCategoriaCor(cat, nodeCor) {
  if (nodeCor) return nodeCor;
  if (!catColorMap[cat]) {
    catColorMap[cat] = defaultColors[Object.keys(catColorMap).length % defaultColors.length];
  }
  return catColorMap[cat];
}

function populateCategories() {
    const selector = document.getElementById('category-filter');
    if (!selector) return;
    selector.innerHTML = '<option value="todas">Todas Categorias</option>';
    if (!window.currentDossie || !window.currentDossie.nodes) return;

    const cats = new Set();
    window.currentDossie.nodes.forEach(n => {
        if (n.categoria) cats.add(n.categoria);
    });

    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
        selector.appendChild(opt);
    });
}


    /* BANCO DE DADOS DOS 18 PERSONAGENS E CASOS ARMAMENTISTAS */

    /* VARIÁVEIS GLOBAIS DE ESTADO E GEOMETRIA DO CANVAS */
    const svgEl = document.getElementById('svg-diagram');
    const viewportContent = document.getElementById('viewport-content');
    const layerArrows = document.getElementById('layer-arrows');
    const layerNodes = document.getElementById('layer-nodes');
    const centerNode = document.getElementById('center-node');
    const cardsWrapper = document.getElementById('cards-wrapper');

    // Geometria adaptativa (calculada dinamicamente)
    let CX = 800;
    let CY = 550;
    let RX = 620;
    let RY = 410;
    let isPortraitMode = false;
    const NODE_W = 126;
    const NODE_H = 64;

    // Estado do Zoom e Pan
    let currentScale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    // Estado do Touch Pinch-to-Zoom
    let initialPinchDistance = 0;
    let initialPinchScale = 1;
    let isTouchInteracting = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    let isSoundOn = true;
    let audioCtx = null;
    let currentLayout = 'noir'; // 'noir' ou 'clean'
    let currentTheme = 'dark'; // 'dark' ou 'light'
    let currentView = 'radial'; // 'radial' ou 'grid'

    // Parâmetros de Filtro
    let currentCategory = 'todas';
    let currentSearch = '';
    let currentLimit = 18;

    /* RECALCULAR GEOMETRIA ADAPTATIVA (MOBILE VERTICAL VS DESKTOP) */
    function atualizarGeometriaResponsiva() {
      const container = document.getElementById('container-radial');
      const rect = container.getBoundingClientRect();
      const isPortrait = rect.width < 768 || rect.height > rect.width;

      if (isPortrait) {
        // Layout Vertical para Smartphones (Elipse alta)
        isPortraitMode = true;
        svgEl.setAttribute('viewBox', '0 0 1100 1600');
        CX = 550;
        CY = 800;
        RX = 390;
        RY = 640;
      } else {
        // Layout Panorâmico Widescreen (Elipse larga)
        isPortraitMode = false;
        svgEl.setAttribute('viewBox', '0 0 1600 1100');
        CX = 800;
        CY = 550;
        RX = 620;
        RY = 410;
      }

      // Reposiciona o nó central
      atualizarPosicaoCentro();
    }

    function atualizarPosicaoCentro() {
      const centerCircleMain = document.getElementById('center-circle-main');
      const centerCircleDashed = document.getElementById('center-circle-dashed');
      const t1 = document.getElementById('center-text-title1');
      const t2 = document.getElementById('center-text-title2');
      const line = document.getElementById('center-text-line');
      const s1 = document.getElementById('center-text-sub1');
      const s2 = document.getElementById('center-text-sub2');

      if (centerCircleMain) {
        centerCircleMain.setAttribute('cx', CX);
        centerCircleMain.setAttribute('cy', CY);
      }
      if (centerCircleDashed) {
        centerCircleDashed.setAttribute('cx', CX);
        centerCircleDashed.setAttribute('cy', CY);
      }
      if (t1) { t1.setAttribute('x', CX); t1.setAttribute('y', CY - 38); }
      if (t2) { t2.setAttribute('x', CX); t2.setAttribute('y', CY - 8); }
      if (line) {
        line.setAttribute('x1', CX - 70);
        line.setAttribute('y1', CY + 10);
        line.setAttribute('x2', CX + 70);
        line.setAttribute('y2', CY + 10);
      }
      if (s1) { s1.setAttribute('x', CX); s1.setAttribute('y', CY + 33); }
      if (s2) { s2.setAttribute('x', CX); s2.setAttribute('y', CY + 54); }
    }

    /* MOTOR DINÂMICO DE FILTRAGEM E DISTRIBUIÇÃO EQUIDISTANTE */
    function getActiveCharacters() {
      let filtered = window.currentDossie.nodes.filter(char => {
        const matchCat = (currentCategory === 'todas' || char.categoria === currentCategory);
        const matchSearch = currentSearch === '' ||
          (char.nome || char.titulo || '').toLowerCase().includes(currentSearch) ||
          char.subtitulo.toLowerCase().includes(currentSearch) ||
          (char.papel || char.operadores || '').toLowerCase().includes(currentSearch);
        return matchCat && matchSearch;
      });

      return filtered.slice(0, currentLimit);
    }

    function renderDynamicDiagram() {
      atualizarGeometriaResponsiva();

      layerArrows.innerHTML = '';
      layerNodes.innerHTML = '';
      cardsWrapper.innerHTML = '';

      const isClean = (currentLayout === 'clean');
      const isLight = (currentTheme === 'light');

      const activeNodes = getActiveCharacters();
      const count = activeNodes.length;

      if (document.getElementById('badge-nodes-count')) document.getElementById('badge-nodes-count').textContent = `${count} Conexões Bélicas`;
      if (document.getElementById('slider-val')) document.getElementById('slider-val').textContent = currentLimit;

      if (count === 0) {
        const textEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEmpty.setAttribute('x', CX);
        textEmpty.setAttribute('y', CY + 180);
        textEmpty.setAttribute('text-anchor', 'middle');
        textEmpty.setAttribute('fill', '#ef4444');
        textEmpty.setAttribute('font-size', '15');
        textEmpty.setAttribute('font-family', "'JetBrains Mono', monospace");
        textEmpty.textContent = "Nenhum caso ou operador localizado com este filtro bélico.";
        layerNodes.appendChild(textEmpty);
        return;
      }

      /* DISTRIBUIÇÃO EQUIDISTANTE EM 360 GRAUS */
      activeNodes.forEach((char, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI / count);
        const x = CX + RX * Math.cos(angle);
        const y = CY + RY * Math.sin(angle);

        // Geometria das Setas apontando para o Vértice Central
        const centerRadius = 110;
        const outerNodeRadius = 36;

        const dx = CX - x;
        const dy = CY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const xStart = x + (dx / dist) * outerNodeRadius;
        const yStart = y + (dy / dist) * outerNodeRadius;
        const xEnd = CX - (dx / dist) * centerRadius;
        const yEnd = CY - (dy / dist) * centerRadius;

        // 1. Linha com Marcador de Flecha apontada para o Vértice Central
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', xStart);
        line.setAttribute('y1', yStart);
        line.setAttribute('x2', xEnd);
        line.setAttribute('y2', yEnd);

        const strokeColor = isClean
          ? (isLight ? '#94a3b8' : '#475569')
          : (isLight ? '#64748b' : '#64748b');

        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', isClean ? '1.5' : '1.8');
        line.setAttribute('marker-end', isClean ? 'url(#arrowhead-clean)' : 'url(#arrowhead)');
        line.setAttribute('class', 'arrow-line');
        line.setAttribute('id', `arrow-${char.id}`);
        line.setAttribute('data-target', char.id);
        layerArrows.appendChild(line);

        // 2. Grupo SVG do Nó Periférico
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-outer cursor-pointer');
        g.setAttribute('id', `node-${char.id}`);
        g.setAttribute('onclick', `abrirModalPersonagem(${char.id})`);
        g.setAttribute('onmouseenter', `destacarConexao(${char.id}, true)`);
        g.setAttribute('onmouseleave', `destacarConexao(${char.id}, false)`);

        if (isClean) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', x - NODE_W / 2);
          rect.setAttribute('y', y - NODE_H / 2);
          rect.setAttribute('width', NODE_W);
          rect.setAttribute('height', NODE_H);
          rect.setAttribute('rx', '12');
          rect.setAttribute('ry', '12');
          rect.setAttribute('fill', isLight ? '#ffffff' : '#1e293b');
          rect.setAttribute('stroke', char.cor);
          rect.setAttribute('stroke-width', '2');
          g.appendChild(rect);
        } else {
          const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          ellipse.setAttribute('cx', x);
          ellipse.setAttribute('cy', y);
          ellipse.setAttribute('rx', NODE_W / 2);
          ellipse.setAttribute('ry', NODE_H / 2);
          ellipse.setAttribute('fill', isLight ? 'url(#grad-node-clean-light)' : 'url(#grad-node)');
          ellipse.setAttribute('stroke', char.cor);
          ellipse.setAttribute('stroke-width', '2');
          g.appendChild(ellipse);
        }

        // Badge com Número do Personagem
        const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        badgeBg.setAttribute('cx', x - NODE_W / 2 + 13);
        badgeBg.setAttribute('cy', y - NODE_H / 2 + 13);
        badgeBg.setAttribute('r', '9.5');
        badgeBg.setAttribute('fill', isClean ? (isLight ? '#f1f5f9' : '#0f172a') : '#070a12');
        badgeBg.setAttribute('stroke', char.cor);
        badgeBg.setAttribute('stroke-width', '1.5');
        g.appendChild(badgeBg);

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('x', x - NODE_W / 2 + 13);
        badgeText.setAttribute('y', y - NODE_H / 2 + 16.5);
        badgeText.setAttribute('text-anchor', 'middle');
        badgeText.setAttribute('fill', char.cor);
        badgeText.setAttribute('font-size', '8.5');
        badgeText.setAttribute('font-weight', 'bold');
        badgeText.setAttribute('font-family', "'JetBrains Mono', monospace");
        badgeText.textContent = char.numero;
        g.appendChild(badgeText);

        // Nome do Personagem
        const textTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textTitle.setAttribute('x', x);
        textTitle.setAttribute('y', y - 3);
        textTitle.setAttribute('text-anchor', 'middle');
        textTitle.setAttribute('fill', isLight ? '#0f172a' : '#ffffff');
        textTitle.setAttribute('font-size', '10.5');
        textTitle.setAttribute('font-weight', '800');
        textTitle.textContent = formatarNomeSvg(((char.nome || char.titulo || '') || char.titulo));
        g.appendChild(textTitle);

        // Subtítulo
        const textSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textSub.setAttribute('x', x);
        textSub.setAttribute('y', y + 13);
        textSub.setAttribute('text-anchor', 'middle');
        textSub.setAttribute('fill', isLight ? '#64748b' : '#94a3b8');
        textSub.setAttribute('font-size', '7.8');
        textSub.setAttribute('font-weight', '500');
        textSub.textContent = formatarSubtitulo(char.subtitulo);
        g.appendChild(textSub);

        layerNodes.appendChild(g);

        // Renderizar Cartão para a Visão em Grade
        renderCard(char);
      });

      atualizarAparenciaCentro();
      atualizarTransformViewport();
    }

    function formatarNomeSvg(str) {
      return (str.length > 18) ? str.substring(0, 16) + '..' : str;
    }

    function formatarSubtitulo(str) {
      return (str.length > 22) ? str.substring(0, 20) + '...' : str;
    }

    function renderCard(char) {
      const isLight = (currentTheme === 'light');
      const googleLink = `https://www.google.com/search?q=${encodeURIComponent((char.googleQuery || char.titulo || ''))}`;
      const card = document.createElement('div');
      card.className = `${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'} border hover:border-red-600/60 p-4 rounded-xl cursor-pointer transition transform hover:-translate-y-1 shadow-lg flex flex-col justify-between`;

      card.innerHTML = `
        <div onclick="abrirModalPersonagem(${char.id})">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${isLight ? 'bg-slate-100 text-red-600 border-slate-300' : 'bg-slate-950 text-red-400 border-slate-800'} border">#${char.numero}</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono uppercase font-bold text-slate-400">${char.categoria}</span>
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${char.cor}"></span>
            </div>
          </div>
          <h3 class="font-bold text-sm mb-1 ${isLight ? 'text-slate-900' : 'text-white'}">${(char.nome || char.titulo || '')}</h3>
          <p class="text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-relaxed">${char.subtitulo}</p>
        </div>
        <div class="mt-4 pt-3 border-t ${isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800/80 text-slate-500'} flex items-center justify-between text-xs font-mono">
          <a href="${googleLink}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
            <span>Google IA</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <span onclick="abrirModalPersonagem(${char.id})" class="text-red-500 font-semibold flex items-center gap-1">Dossiê 4 Abas &rarr;</span>
        </div>
      `;
      cardsWrapper.appendChild(card);
    }

    function atualizarAparenciaCentro() {
      const isClean = (currentLayout === 'clean');
      const centerCircleMain = document.getElementById('center-circle-main');
      const centerCircleDashed = document.getElementById('center-circle-dashed');

      if (centerCircleMain) {
        centerCircleMain.setAttribute('fill', isClean ? 'url(#grad-center-clean)' : 'url(#grad-center)');
        centerCircleMain.setAttribute('stroke', isClean ? '#fee2e2' : '#fca5a5');
      }
      if (centerCircleDashed) {
        centerCircleDashed.style.display = isClean ? 'none' : 'block';
      }
    }

    /* SISTEMA DE ZOOM UNIFICADO E TOUCH PINCH/PAN ANTI-DESLOCAMENTO */
    function atualizarTransformViewport() {
      if (viewportContent) {
        viewportContent.setAttribute('transform', `translate(${panX}, ${panY}) scale(${currentScale})`);
      }
    }

    function aplicarZoomBotao(fator) {
      const novoScale = Math.min(Math.max(currentScale * fator, 0.45), 3.2);
      // Zoom focado no centro geométrico (CX, CY)
      panX = CX * (1 - novoScale);
      panY = CY * (1 - novoScale);
      currentScale = novoScale;
      atualizarTransformViewport();
      playBeep(420, 'sine', 0.04);
    }

    function resetZoom() {
      currentScale = 1;
      panX = 0;
      panY = 0;
      atualizarTransformViewport();
      playBeep(450, 'sine', 0.05);
    }

    // Eventos de Mouse Drag e Wheel
    svgEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node-outer') || e.target.closest('.node-center')) return;
      isDragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      atualizarTransformViewport();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    svgEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const novoScale = Math.min(Math.max(currentScale * delta, 0.45), 3.2);

      // Ponto focal do cursor do mouse
      const rect = svgEl.getBoundingClientRect();
      const mouseSvgX = (e.clientX - rect.left) * (isPortraitMode ? 1100 : 1600) / rect.width;
      const mouseSvgY = (e.clientY - rect.top) * (isPortraitMode ? 1600 : 1100) / rect.height;

      panX = mouseSvgX - (mouseSvgX - panX) * (novoScale / currentScale);
      panY = mouseSvgY - (mouseSvgY - panY) * (novoScale / currentScale);
      currentScale = novoScale;
      atualizarTransformViewport();
    }, { passive: false });

    // Eventos de Touch: Pan com 1 dedo e Pinch-to-Zoom com 2 dedos
    svgEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isTouchInteracting = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isTouchInteracting = false; // modo pinça
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchScale = currentScale;
      }
    }, { passive: false });

    svgEl.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isTouchInteracting) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        panX += dx;
        panY += dy;
        atualizarTransformViewport();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistance > 0) {
          const factor = dist / initialPinchDistance;
          const novoScale = Math.min(Math.max(initialPinchScale * factor, 0.45), 3.2);

          panX = CX * (1 - novoScale);
          panY = CY * (1 - novoScale);
          currentScale = novoScale;
          atualizarTransformViewport();
        }
      }
    }, { passive: false });

    svgEl.addEventListener('touchend', () => {
      isTouchInteracting = false;
    });

    /* SISTEMA DE ÁUDIO SINTETIZADO */
    function playBeep(freq = 440, type = 'sine', duration = 0.08) {
      if (!isSoundOn) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function toggleAudio() {
      isSoundOn = !isSoundOn;
      const btn = document.getElementById('btn-sound');
      if (isSoundOn) {
        btn.classList.replace('text-slate-500', 'text-emerald-400');
        playBeep(659, 'sine', 0.1);
      } else {
        btn.classList.replace('text-emerald-400', 'text-slate-500');
      }
    }

    function destacarConexao(id, ativar) {
      const arrow = document.getElementById(`arrow-${id}`);
      if (!arrow) return;
      if (ativar) {
        arrow.classList.add('arrow-highlight');
        playBeep(290 + id * 14, 'sine', 0.04);
      } else {
        arrow.classList.remove('arrow-highlight');
      }
    }

    /* FILTRAGEM DINÂMICA EQUIDISTANTE */
    function selecionarCategoria(cat) {
      currentCategory = cat;
      playBeep(540, 'triangle', 0.08);

      document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
          btn.className = "filter-btn px-2.5 py-1 rounded bg-red-700 text-white font-semibold transition whitespace-nowrap";
        } else {
          btn.className = "filter-btn px-2 py-1 rounded text-slate-400 hover:text-white transition whitespace-nowrap";
        }
      });

      renderDynamicDiagram();
    }

    function atualizarFiltroBusca(termo) {
      currentSearch = termo.trim().toLowerCase();
      renderDynamicDiagram();
    }

    function alterarLimiteQuantidade(val) {
      currentLimit = parseInt(val, 10);
      const displayElem = document.getElementById('node-count-display');
      if (displayElem) {
        const totalNodes = window.currentDossie.nodes.length;
        displayElem.textContent = currentLimit + '/' + totalNodes;
      }
      playBeep(420 + currentLimit * 10, 'sine', 0.03);
      renderDynamicDiagram();
    }

    /* MODAL DE DETALHAMENTO EM 4 ABAS COM GOOGLE SEARCH LINK */
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalPanel = document.getElementById('modal-panel');

    function abrirModalPersonagem(id) {
      const char = window.currentDossie.nodes.find(c => c.id === id);
      if (!char) return;

      playBeep(520, 'triangle', 0.12);

      // Topo
      if (document.getElementById('modal-badge-avatar')) document.getElementById('modal-badge-avatar').textContent = char.numero;
      document.getElementById('modal-badge-avatar').style.borderColor = char.cor;
      if (document.getElementById('modal-badge-cat')) document.getElementById('modal-badge-cat').textContent = char.categoria;
      document.getElementById('modal-badge-cat').style.color = char.cor;
      document.getElementById('modal-badge-cat').style.borderColor = char.cor + '60';
      if (document.getElementById('modal-nome')) document.getElementById('modal-nome').textContent = `${char.numero}. ${(char.nome || char.titulo || '')}`;

      // Configurar links de busca no Google IA
      const googleLink = `https://www.google.com/search?q=${encodeURIComponent((char.googleQuery || char.titulo || ''))}`;
      document.getElementById('modal-google-btn').href = googleLink;
      document.getElementById('modal-google-footer-btn').href = googleLink;
      document.getElementById('modal-tab-search-btn').href = googleLink;

      // ABA 1: Conexão Bélica & Cifras
      if (document.getElementById('modal-grau-conexao')) document.getElementById('modal-grau-conexao').textContent = char.conexaoGrau;
      if (document.getElementById('modal-conexao-desc')) document.getElementById('modal-conexao-desc').textContent = (char.conexaoDesc || char.descricao || '');
      if (document.getElementById('modal-papel')) document.getElementById('modal-papel').textContent = (char.papel || char.operadores || '');
      if (document.getElementById('modal-proximidade')) document.getElementById('modal-proximidade').textContent = char.proximidade;

      const cifrasList = document.getElementById('modal-cifras-list');
      cifrasList.innerHTML = '';
      if (char.cifras && char.cifras.length > 0) {
        char.cifras.forEach(item => {
          const li = document.createElement('div');
          li.className = "flex items-start gap-2 bg-slate-900/80 p-2 rounded border border-emerald-900/30";
          li.innerHTML = `<span class="text-emerald-400 font-bold">🎯</span><span>${item}</span>`;
          cifrasList.appendChild(li);
        });
      }

      // ABA 2: Fatos Forenses & Inquéritos
      if (document.getElementById('modal-inquerito-desc')) document.getElementById('modal-inquerito-desc').textContent = char.inqueritoDesc;
      if (document.getElementById('modal-modus-operandi')) document.getElementById('modal-modus-operandi').textContent = char.modusOperandi;
      if (document.getElementById('modal-operacoes')) document.getElementById('modal-operacoes').textContent = char.operacoes;
      if (document.getElementById('modal-status-judicial')) document.getElementById('modal-status-judicial').textContent = char.statusJudicial;

      // ABA 3: Sátira & Músicas
      const codinomesList = document.getElementById('modal-codinomes-list');
      codinomesList.innerHTML = '';
      if (char.codinomes && char.codinomes.length > 0) {
        char.codinomes.forEach(cod => {
          const sp = document.createElement('span');
          sp.className = "text-xs font-mono font-bold bg-amber-950/70 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded";
          sp.textContent = `"${cod}"`;
          codinomesList.appendChild(sp);
        });
      }
      if (document.getElementById('modal-cena-desc')) document.getElementById('modal-cena-desc').textContent = `"${char.cena}"`;
      if (document.getElementById('modal-musica-nome')) document.getElementById('modal-musica-nome').textContent = char.musicaNome;
      if (document.getElementById('modal-musica-ritmo')) document.getElementById('modal-musica-ritmo').textContent = char.musicaRitmo;
      if (document.getElementById('modal-musica-refrão')) document.getElementById('modal-musica-refrão').textContent = char.musicaRefrão;

      // ABA 4: Fontes & Cronologia
      const fontesCont = document.getElementById('modal-fontes-container');
      fontesCont.innerHTML = '';
      if (char.fontes && char.fontes.length > 0) {
        char.fontes.forEach(f => {
          const div = document.createElement('div');
          div.className = "bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5";

          let linkHtml = '';
          if (f.url && f.url.trim() !== '') {
            linkHtml = `
              <a href="${f.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 transition">
                <span>Acessar Reportagem Verificada</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            `;
          } else {
            linkHtml = `<span class="text-xs text-slate-500 italic">Registro oficial arquivado</span>`;
          }

          div.innerHTML = `
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">${f.veiculo}</span>
              <span class="text-slate-500">${f.data}</span>
            </div>
            <h5 class="text-sm font-bold text-white">${f.titulo}</h5>
            <div class="pt-1 flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs text-slate-400 font-mono">${f.linkTexto}</span>
              ${linkHtml}
            </div>
          `;
          fontesCont.appendChild(div);
        });
      }

      const timelineCont = document.getElementById('modal-timeline-container');
      timelineCont.innerHTML = '<div class="timeline-line"></div>';
      if (char.timeline && char.timeline.length > 0) {
        char.timeline.forEach(t => {
          const div = document.createElement('div');
          div.className = "relative flex items-start gap-3 text-xs";
          div.innerHTML = `
            <span class="absolute -left-[1.85rem] sm:-left-[2.1rem] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow"></span>
            <div>
              <span class="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 inline-block mb-1">${t.ano}</span>
              <p class="text-slate-300 leading-relaxed">${t.texto}</p>
            </div>
          `;
          timelineCont.appendChild(div);
        });
      }

      trocarAbaModal('conexao');

      modalBackdrop.classList.remove('hidden', 'pointer-events-none');
      setTimeout(() => {
        modalBackdrop.classList.replace('opacity-0', 'opacity-100');
        modalPanel.classList.replace('scale-95', 'scale-100');
      }, 10);
    }

    /* MODAL DO VÉRTICE CENTRAL: FLÁVIO BOLSONARO ARMAMENTISTA */

    function abrirModalCentro() {
      playBeep(220, 'sawtooth', 0.2);

      const cn = window.currentDossie.centerNode || {};
      const t1 = cn.text1 || 'VÉRTICE';
      const t2 = cn.text2 || 'CENTRAL';

      if (document.getElementById('modal-badge-avatar')) document.getElementById('modal-badge-avatar').textContent = "★";
      document.getElementById('modal-badge-avatar').style.borderColor = '#ef4444';
      if (document.getElementById('modal-badge-cat')) document.getElementById('modal-badge-cat').textContent = "Vértice Central (Hub)";
      document.getElementById('modal-badge-cat').style.color = '#ef4444';
      document.getElementById('modal-badge-cat').style.borderColor = '#ef444460';
      if (document.getElementById('modal-nome')) document.getElementById('modal-nome').textContent = t1 + " " + t2;

      if (document.getElementById('modal-grau-conexao')) document.getElementById('modal-grau-conexao').textContent = cn.sub1 || "Nó / Vértice Central";
      if (document.getElementById('modal-conexao-desc')) document.getElementById('modal-conexao-desc').textContent = cn.desc || "Vértice central do esquema.";
      if (document.getElementById('modal-papel')) document.getElementById('modal-papel').textContent = cn.sub2 || "Líder político e beneficiário.";
      if (document.getElementById('modal-proximidade')) document.getElementById('modal-proximidade').textContent = "O Vértice Central Absoluto da Rede.";

      const cifrasList = document.getElementById('modal-cifras-list');
      if (cifrasList) {
          cifrasList.innerHTML = `<div class="flex items-start gap-2 bg-slate-900/80 p-2 rounded border border-emerald-900/30">
            <span class="text-emerald-400 font-bold">★</span>
            <span>Centro do Ecossistema Consolidado</span>
          </div>`;
      }

      trocarAbaModal('fatos');
      document.getElementById('modal-backdrop').classList.remove('hidden');
      document.getElementById('modal-panel').classList.remove('scale-95', 'opacity-0');
    }


function fecharModal() {
      playBeep(350, 'sine', 0.05);
      modalBackdrop.classList.replace('opacity-100', 'opacity-0');
      modalPanel.classList.replace('scale-100', 'scale-95');
      setTimeout(() => {
        modalBackdrop.classList.add('hidden', 'pointer-events-none');
      }, 200);
    }

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) fecharModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fecharModal();
    });

    function trocarAbaModal(aba) {
      playBeep(480, 'sine', 0.04);

      const abas = ['conexao', 'fatos', 'satira', 'fontes'];
      const cores = {
        conexao: 'border-emerald-500 text-white',
        fatos: 'border-red-500 text-white',
        satira: 'border-amber-500 text-white',
        fontes: 'border-cyan-500 text-white'
      };

      abas.forEach(nome => {
        const conteudo = document.getElementById(`modal-tab-${nome}`);
        const botao = document.getElementById(`tab-btn-${nome}`);

        if (nome === aba) {
          conteudo.classList.remove('hidden');
          botao.className = `px-4 py-3 border-b-2 ${cores[nome]} flex items-center gap-1.5 whitespace-nowrap transition`;
        } else {
          conteudo.classList.add('hidden');
          botao.className = "px-4 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-1.5 whitespace-nowrap transition";
        }
      });
    }

    /* CONTROLE DE LAYOUT (NOIR VS CLEAN) */
    function alternarLayoutEstilo() {
      playBeep(640, 'triangle', 0.08);
      const body = document.body;
      const label = document.getElementById('label-layout');

      if (currentLayout === 'noir') {
        currentLayout = 'clean';
        body.classList.replace('style-noir', 'style-clean');
        label.textContent = "Dossiê";
      } else {
        currentLayout = 'noir';
        body.classList.replace('style-clean', 'style-noir');
        label.textContent = "Clean";
      }

      renderDynamicDiagram();
    }

    /* CONTROLE DE TEMA (DARK VS LIGHT) */
    function alternarTemaCor() {
      playBeep(500, 'sine', 0.06);
      const html = document.documentElement;
      const icon = document.getElementById('icon-theme');
      const label = document.getElementById('label-theme');

      if (currentTheme === 'dark') {
        currentTheme = 'light';
        html.classList.remove('dark');
        html.classList.add('light');
        label.textContent = "Escuro";
        icon.innerHTML = `<svg class="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
      } else {
        currentTheme = 'dark';
        html.classList.remove('light');
        html.classList.add('dark');
        label.textContent = "Claro";
        icon.innerHTML = `<svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
      }

      renderDynamicDiagram();
    }

    /* CONTROLE DE VISÃO (RADIAL 360° VS GRADE DE CARDS) */
    function alternarVisao() {
      const containerRadial = document.getElementById('container-radial');
      const containerGrid = document.getElementById('container-grid');
      const label = document.getElementById('label-toggle-view');

      playBeep(420, 'sine', 0.06);

      if (currentView === 'radial') {
        currentView = 'grid';
        containerRadial.classList.add('hidden');
        containerGrid.classList.remove('hidden');
        label.textContent = "Diagrama 360°";
      } else {
        currentView = 'radial';
        containerRadial.classList.remove('hidden');
        containerGrid.classList.add('hidden');
        label.textContent = "Lista";
      }
    }

    function toggleMobileFilters() {
      const tb = document.getElementById('toolbar-actions');
      tb.classList.toggle('hidden');
      tb.classList.toggle('flex');
    }

    // Redimensionamento e Reorientação de Tela
    window.addEventListener('resize', () => {
      renderDynamicDiagram();
    });

    /* INICIALIZAÇÃO NA CARGA DA PÁGINA */
    window.onload = function() {
      renderDynamicDiagram();
    };

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('dossie-selector');
    if (selector && selector.value) {
        window.mudarDossie(selector.value);
    } else {
        window.mudarDossie('armamentista');
    }
});
