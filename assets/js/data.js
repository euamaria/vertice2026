/**
 * Data structure containing all the pages available in the /sites directory.
 *
 * Each object in the array represents a page and should have the following properties:
 * - title (string): The title of the page to be displayed on the card.
 * - url (string): The relative path to the HTML file (e.g., 'sites/filename.html').
 * - description (string): A short description of the page content.
 * - category (string): The main category of the page (used for primary filtering).
 * - tags (array of strings): An array of tags for secondary filtering.
 *
 * To add a new page, simply add a new object to this array following the same format.
 */
const pagesData = [
  {
    title: "16 Esquemas",
    url: "sites/16esquemas.html",
    description: "Visualização original dos 16 esquemas.",
    category: "Esquemas",
    tags: ["v1", "esquemas", "referência"]
  },
  {
    title: "16 Esquemas (V2)",
    url: "sites/16esquemas-v2.html",
    description: "Versão atualizada e aprimorada dos 16 esquemas.",
    category: "Esquemas",
    tags: ["v2", "esquemas", "atualizado"]
  },
  {
    title: "20 Personagens",
    url: "sites/20personagens.html",
    description: "Detalhes e características de 20 personagens.",
    category: "Personagens",
    tags: ["personagens", "lista", "20"]
  },
  {
    title: "32 Personagens",
    url: "sites/32personagens.html",
    description: "Lista expandida com detalhes de 32 personagens.",
    category: "Personagens",
    tags: ["personagens", "lista", "estendido", "32"]
  },
  {
    title: "Rachadinha",
    url: "sites/rachadinha.html",
    description: "Detalhes e ramificações sobre o esquema da Rachadinha.",
    category: "Esquemas",
    tags: ["rachadinha", "esquema"]
  },
  {
    title: "O Vértice Armamentista",
    url: "sites/armamentista.html",
    description: "A Teia Bélica, os Arsenais e Decretos do Clã Bolsonaro.",
    category: "Esquemas",
    tags: ["armamentista", "armas", "bolsonaro", "milícia", "cacs"]
  },
  {
    title: "Apresentação PowerPoint",
    url: "powerpoint.html",
    description: "Confira os slides com os infográficos em detalhes ou faça o download para editar.",
    category: "Recursos",
    tags: ["powerpoint", "apresentação", "slides", "download"]
  }
];
