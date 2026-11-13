/* js/modal.js — модальное окно быстрого просмотра товара.
   Разметка окна создаётся через createElement при первом открытии,
   поэтому отдельный HTML-блок на каждой странице не нужен. */

let modalElements = null;
let lastFocusedElement = null;

function createProductModal() {
  const overlay = createNode('div', 'modal');
  overlay.hidden = true;

  const dialog = createNode('div', 'modal__dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'modal-title');

  const closeButton = createButton('×', 'modal__close', 'close-modal');
  closeButton.setAttribute('aria-label', 'Закрыть окно');

  const media = createNode('div', 'modal__media');
  const image = document.createElement('img');
  image.className = 'modal__image';
  image.alt = '';
  image.width = 400;
  image.height = 300;
  media.append(image);

  const content = createNode('div', 'modal__content');
  const category = createNode('span', 'product-view__category');
  const title = createNode('h2', 'modal__title');
  title.id = 'modal-title';
  const meta = createNode('div', 'product-view__meta');
  const rating = createNode('span', 'product-card__rating');
  const availability = createNode('span', 'product-card__availability');
  const priceRow = createNode('div', 'product-view__price-row');
  const price = createNode('span', 'product-view__price');
  const oldPrice = createNode('span', 'product-view__old-price');
  const description = createNode('p', 'modal__description');
  const actions = createNode('div', 'modal__actions');
  const addButton = createButton('В корзину', 'button button--primary', 'modal-add');
  const detailsLink = createNode('a', 'button button--ghost', 'Открыть страницу');

  priceRow.append(price, oldPrice);
  meta.append(rating, availability);
  actions.append(addButton, detailsLink);
  content.append(category, title, meta, priceRow, description, actions);
  dialog.append(closeButton, media, content);
  overlay.append(dialog);
  document.body.append(overlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeProductModal();
  });
  closeButton.addEventListener('click', closeProductModal);
  addButton.addEventListener('click', () => {
    const productId = Number(addButton.dataset.id);
    if (addToCart(productId)) closeProductModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) closeProductModal();
  });

  return {
    overlay,
    dialog,
    closeButton,
    image,
    category,
    title,
    rating,
    availability,
    priceRow,
    price,
    oldPrice,
    description,
    addButton,
    detailsLink
  };
}

function getModalElements() {
  if (!modalElements) modalElements = createProductModal();
  return modalElements;
}

function openProductModal(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  const modal = getModalElements();

  modal.image.src = product.image;
  modal.image.alt = product.title;
  modal.category.textContent = product.category;
  modal.title.textContent = product.title;
  modal.rating.textContent = '★ ' + product.rating.toFixed(1);
  modal.availability.textContent = product.isAvailable ? 'В наличии' : 'Ожидается';
  modal.availability.classList.toggle('is-off', !product.isAvailable);
  modal.price.textContent = formatPrice(product.price);
  modal.oldPrice.textContent = product.oldPrice ? formatPrice(product.oldPrice) : '';
  modal.oldPrice.classList.toggle('is-hidden', !product.oldPrice);
  modal.description.textContent = product.description;

  modal.addButton.dataset.id = String(product.id);
  modal.addButton.disabled = !product.isAvailable;
  modal.addButton.textContent = product.isAvailable ? 'В корзину' : 'Нет в наличии';
  modal.detailsLink.href = 'product.html?id=' + product.id;

  lastFocusedElement = document.activeElement;
  modal.overlay.hidden = false;
  document.body.classList.add('no-scroll');
  modal.closeButton.focus();
}

function closeProductModal() {
  if (!modalElements || modalElements.overlay.hidden) return;

  modalElements.overlay.hidden = true;
  document.body.classList.remove('no-scroll');

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}
