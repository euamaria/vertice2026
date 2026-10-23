document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer = document.getElementById('cards-container');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  // Populate categories dynamically
  const categories = [...new Set(pagesData.map(page => page.category))].sort();
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Function to render cards
  const renderCards = (data) => {
    cardsContainer.innerHTML = '';

    if (data.length === 0) {
      cardsContainer.innerHTML = '<p class="no-results">Nenhuma página encontrada.</p>';
      return;
    }

    data.forEach(page => {
      const card = document.createElement('div');
      card.className = 'card';

      const tagsHtml = page.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

      card.innerHTML = `
        <h2>${page.title}</h2>
        <div class="card-meta">
          <span class="category">${page.category}</span>
          ${tagsHtml}
        </div>
        <p>${page.description}</p>
        <a href="${page.url}" class="card-link">Acessar Página</a>
      `;

      cardsContainer.appendChild(card);
    });
  };

  // Initial render
  renderCards(pagesData);

  // Filter functionality
  const filterCards = () => {
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    const filteredData = pagesData.filter(page => {
      const matchCategory = selectedCategory === '' || page.category === selectedCategory;

      // Search in title, description, category and tags
      const searchString = `${page.title} ${page.description} ${page.category} ${page.tags.join(' ')}`.toLowerCase();
      const matchSearch = searchString.includes(searchTerm);

      return matchCategory && matchSearch;
    });

    renderCards(filteredData);
  };

  categoryFilter.addEventListener('change', filterCards);
  searchInput.addEventListener('input', filterCards);
});
