/* js/catalog.js — каталог и страница товара.
   Генерирует карточки товаров, обрабатывает поиск, фильтр по категории,
   сортировку и «только избранное», рисует пустое состояние каталога
   и страницу отдельного товара (product.html?id=...). */

const catalogState = {
  search: '',
  category: 'all',
  sort: 'default',
  onlyFavorites: false
};

/* ---------- Фильтрация и сортировка ---------- */

function getVisibleProducts() {
  const searchValue = catalogState.search.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchValue);
    const matchesCategory =
      catalogState.category === 'all' || product.category === catalogState.category;
    const matchesFavorites = !catalogState.onlyFavorites || isFavorite(product.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  /* Сортируем копию массива, чтобы не менять исходный порядок products. */
  const sorted = [...filtered];

  if (catalogState.sort === 'price-asc') {
    sorted.sort((first, second) => first.price - second.price);
  } else if (catalogState.sort === 'price-desc') {
    sorted.sort((first, second) => second.price - first.price);
  } else if (catalogState.sort === 'title-asc') {
    sorted.sort((first, second) => first.title.localeCompare(second.title, 'ru'));
  } else if (catalogState.sort === 'title-desc') {
    sorted.sort((first, second) => second.title.localeCompare(first.title, 'ru'));
  }

  return sorted;
}

/* ---------- Карточка товара ---------- */

function createProductCard(product) {
  const card = createNode('article', 'product-card');
  card.dataset.id = String(product.id);
  if (!product.isAvailable) card.classList.add('product-card--unavailable');

  const media = createNode('div', 'product-card__media');
  const image = document.createElement('img');
  image.className = 'product-card__image';
  image.src = product.image;
  image.alt = product.title;
  image.width = 400;
  image.height = 300;
  image.loading = 'lazy';
  media.append(image);

  if (product.badge) {
    media.append(createNode('span', 'product-card__badge', product.badge));
  }

  if (!product.isAvailable) {
    media.append(createNode('span', 'product-card__badge product-card__badge--muted', 'Нет в наличии'));
  }

  const favoriteButton = createButton('♥', 'product-card__favorite', 'favorite', product.id);
  const favoriteActive = isFavorite(product.id);
  favoriteButton.classList.toggle('is-active', favoriteActive);
  favoriteButton.setAttribute('aria-pressed', String(favoriteActive));
  favoriteButton.setAttribute(
    'aria-label',
    favoriteActive ? 'Убрать из избранного' : 'Добавить в избранное'
  );
  media.append(favoriteButton);

  const body = createNode('div', 'product-card__body');
  body.append(createNode('span', 'product-card__category', product.category));

  const titleLink = createNode('a', 'product-card__title', product.title);
  titleLink.href = 'product.html?id=' + product.id;
  body.append(titleLink);

  body.append(createNode('p', 'product-card__description', product.shortDescription));

  const meta = createNode('div', 'product-card__meta');
  meta.append(
    createNode('span', 'product-card__rating', '★ ' + product.rating.toFixed(1)),
    createNode(
      'span',
      product.isAvailable ? 'product-card__availability' : 'product-card__availability is-off',
      product.isAvailable ? 'В наличии' : 'Ожидается'
    )
  );
  body.append(meta);

  const priceRow = createNode('div', 'product-card__price-row');
  priceRow.append(createNode('span', 'product-card__price', formatPrice(product.price)));
  if (product.oldPrice) {
    priceRow.append(createNode('span', 'product-card__old-price', formatPrice(product.oldPrice)));
  }
  body.append(priceRow);

  const actions = createNode('div', 'product-card__actions');
  const addButton = createButton(
    product.isAvailable ? 'В корзину' : 'Нет в наличии',
    'button button--primary button--small',
    'add',
    product.id
  );
  addButton.disabled = !product.isAvailable;
  addButton.setAttribute('aria-label', 'Добавить в корзину: ' + product.title);

  const detailsButton = createButton(
    'Быстрый просмотр',
    'button button--ghost button--small',
    'details',
    product.id
  );
  detailsButton.setAttribute('aria-label', 'Быстрый просмотр: ' + product.title);

  actions.append(addButton, detailsButton);
  body.append(actions);

  card.append(media, body);
  return card;
}

/* ---------- Обработка кликов по сетке карточек ---------- */

function handleProductsClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const productId = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === 'add') {
    addToCart(productId);
  }

  if (action === 'favorite') {
    toggleFavorite(productId);
    if (catalogState.onlyFavorites && document.querySelector('#catalog-grid')) {
      renderCatalog();
    }
  }

  if (action === 'details') {
    openProductModal(productId);
  }
}

function attachProductEvents(container) {
  if (container) container.addEventListener('click', handleProductsClick);
}

/* ---------- Каталог ---------- */

function fillCategoryFilter() {
  const select = document.querySelector('#category-filter');
  if (!select) return;

  const categories = [...new Set(products.map((product) => product.category))];

  select.replaceChildren();
  select.append(new Option('Все категории', 'all'));

  categories.forEach((category) => {
    const count = products.filter((product) => product.category === category).length;
    select.append(new Option(category + ' (' + count + ')', category));
  });
}

function renderCatalog() {
  const grid = document.querySelector('#catalog-grid');
  if (!grid) return;

  const visibleProducts = getVisibleProducts();

  grid.replaceChildren();
  visibleProducts.forEach((product) => grid.append(createProductCard(product)));

  grid.classList.toggle('is-hidden', visibleProducts.length === 0);

  const counter = document.querySelector('#catalog-count');
  if (counter) {
    counter.textContent =
      visibleProducts.length === 0
        ? 'Ничего не найдено'
        : 'Найдено: ' + visibleProducts.length + ' из ' + products.length;
  }

  const emptyState = document.querySelector('#catalog-empty');
  if (emptyState) emptyState.classList.toggle('is-hidden', visibleProducts.length !== 0);
}

function resetCatalogFilters() {
  catalogState.search = '';
  catalogState.category = 'all';
  catalogState.sort = 'default';
  catalogState.onlyFavorites = false;

  const searchInput = document.querySelector('#search-input');
  const categoryFilter = document.querySelector('#category-filter');
  const sortSelect = document.querySelector('#sort-select');
  const favoritesToggle = document.querySelector('#only-favorites');

  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = 'all';
  if (sortSelect) sortSelect.value = 'default';
  if (favoritesToggle) favoritesToggle.checked = false;

  renderCatalog();
  if (searchInput) searchInput.focus();
}

function initCatalogPage() {
  const grid = document.querySelector('#catalog-grid');
  if (!grid) return;

  fillCategoryFilter();

  const searchInput = document.querySelector('#search-input');
  const categoryFilter = document.querySelector('#category-filter');
  const sortSelect = document.querySelector('#sort-select');
  const favoritesToggle = document.querySelector('#only-favorites');

  /* Ссылка «Избранное» из шапки: catalog.html?favorites=1 */
  const query = new URLSearchParams(window.location.search);
  if (query.get('favorites') === '1' && favoritesToggle) {
    favoritesToggle.checked = true;
    catalogState.onlyFavorites = true;
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      catalogState.search = searchInput.value;
      renderCatalog();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      catalogState.category = categoryFilter.value;
      renderCatalog();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      catalogState.sort = sortSelect.value;
      renderCatalog();
    });
  }

  if (favoritesToggle) {
    favoritesToggle.addEventListener('change', () => {
      catalogState.onlyFavorites = favoritesToggle.checked;
      renderCatalog();
    });
  }

  document
    .querySelectorAll('.js-reset-filters')
    .forEach((button) => button.addEventListener('click', resetCatalogFilters));

  attachProductEvents(grid);
  renderCatalog();
}

/* ---------- Подборка на главной ---------- */

function initFeaturedProducts() {
  const grid = document.querySelector('#featured-grid');
  if (!grid) return;

  const featured = [...products]
    .filter((product) => product.isAvailable)
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 4);

  grid.replaceChildren();
  featured.forEach((product) => grid.append(createProductCard(product)));

  attachProductEvents(grid);
}

/* ---------- Страница товара ---------- */

function renderProductNotFound(container) {
  container.replaceChildren();

  const relatedSection = document.querySelector('#related-grid');
  if (relatedSection) {
    const section = relatedSection.closest('.section');
    if (section) section.classList.add('is-hidden');
  }

  const wrapper = createNode('div', 'empty-state');
  wrapper.append(
    createNode('span', 'empty-state__icon', '🔎'),
    createNode('h1', 'empty-state__title', 'Товар не найден'),
    createNode(
      'p',
      'empty-state__text',
      'Возможно, ссылка устарела или товар убран из каталога. Посмотрите другие позиции.'
    )
  );

  const link = createNode('a', 'button button--primary', 'Вернуться в каталог');
  link.href = 'catalog.html';
  wrapper.append(link);

  container.append(wrapper);
  document.title = 'Товар не найден — ТехноМаркет';
}

function renderProductPage(container, product) {
  container.replaceChildren();
  document.title = product.title + ' — ТехноМаркет';

  const breadcrumbs = createNode('nav', 'breadcrumbs');
  breadcrumbs.setAttribute('aria-label', 'Хлебные крошки');

  const catalogLink = createNode('a', 'breadcrumbs__link', 'Каталог');
  catalogLink.href = 'catalog.html';

  const categoryLink = createNode('a', 'breadcrumbs__link', product.category);
  categoryLink.href = 'catalog.html';

  breadcrumbs.append(
    catalogLink,
    createNode('span', 'breadcrumbs__separator', '/'),
    categoryLink,
    createNode('span', 'breadcrumbs__separator', '/'),
    createNode('span', 'breadcrumbs__current', product.title)
  );

  const layout = createNode('div', 'product-view');

  const media = createNode('div', 'product-view__media');
  const image = document.createElement('img');
  image.className = 'product-view__image';
  image.src = product.image;
  image.alt = product.title;
  image.width = 400;
  image.height = 300;
  media.append(image);
  if (product.badge) {
    media.append(createNode('span', 'product-card__badge', product.badge));
  }

  const info = createNode('div', 'product-view__info');
  info.append(createNode('span', 'product-view__category', product.category));
  info.append(createNode('h1', 'product-view__title', product.title));

  const ratingRow = createNode('div', 'product-view__meta');
  ratingRow.append(
    createNode('span', 'product-card__rating', '★ ' + product.rating.toFixed(1)),
    createNode(
      'span',
      product.isAvailable ? 'product-card__availability' : 'product-card__availability is-off',
      product.isAvailable ? 'В наличии на складе' : 'Ожидается поставка'
    )
  );
  info.append(ratingRow);

  const priceRow = createNode('div', 'product-view__price-row');
  priceRow.append(createNode('span', 'product-view__price', formatPrice(product.price)));
  if (product.oldPrice) {
    priceRow.append(
      createNode('span', 'product-view__old-price', formatPrice(product.oldPrice))
    );
  }
  info.append(priceRow);

  info.append(createNode('p', 'product-view__description', product.description));

  const actions = createNode('div', 'product-view__actions');
  const addButton = createButton(
    product.isAvailable ? 'Добавить в корзину' : 'Нет в наличии',
    'button button--primary',
    'add',
    product.id
  );
  addButton.disabled = !product.isAvailable;

  const favoriteButton = createButton(
    isFavorite(product.id) ? '♥ В избранном' : '♡ В избранное',
    'button button--ghost',
    'favorite',
    product.id
  );
  favoriteButton.classList.toggle('is-active', isFavorite(product.id));
  favoriteButton.setAttribute('aria-pressed', String(isFavorite(product.id)));

  actions.append(addButton, favoriteButton);
  info.append(actions);

  info.append(createNode('p', 'product-view__note', 'Доставка по городу — на следующий день. Оплата при получении.'));

  layout.append(media, info);
  container.append(breadcrumbs, layout);
}

function initProductPage() {
  const container = document.querySelector('#product-view');
  if (!container) return;

  const productId = Number(new URLSearchParams(window.location.search).get('id'));
  const product = products.find((item) => item.id === productId);

  if (!product) {
    renderProductNotFound(container);
    return;
  }

  renderProductPage(container, product);
  container.addEventListener('click', handleProductsClick);

  /* Похожие товары из той же категории. */
  const relatedGrid = document.querySelector('#related-grid');
  if (relatedGrid) {
    const related = products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 3);

    relatedGrid.replaceChildren();
    related.forEach((item) => relatedGrid.append(createProductCard(item)));
    attachProductEvents(relatedGrid);
  }
}

/* ---------- Запуск ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initCatalogPage();
  initFeaturedProducts();
  initProductPage();
});
