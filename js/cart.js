/* js/cart.js — корзина, промокод и расчёт итоговой суммы.
   Корзина хранится в localStorage как массив пар { id, quantity },
   поэтому после перезагрузки страницы товары остаются на месте. */

const PROMO_CODES = {
  SALE10: { rate: 0.1, label: '−10%' },
  TECH15: { rate: 0.15, label: '−15%' }
};

/* ---------- Состояние корзины ---------- */

function getCart() {
  const stored = readStorage(STORAGE_KEYS.cart, []);
  if (!Array.isArray(stored)) return [];

  return stored
    .map((item) => ({
      id: Number(item && item.id),
      quantity: Math.min(99, Math.max(1, Math.round(Number(item && item.quantity))))
    }))
    .filter(
      (item) =>
        Number.isFinite(item.id) &&
        item.quantity > 0 &&
        products.some((product) => product.id === item.id)
    );
}

function saveCart(items) {
  writeStorage(STORAGE_KEYS.cart, items);
  updateHeaderCounters();
}

function getCartQuantity() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function addToCart(productId, quantity = 1) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return false;

  if (!product.isAvailable) {
    showToast('Товара нет в наличии — добавление недоступно.', 'error');
    return false;
  }

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);
  const amount = Math.min(99, Math.max(1, Math.round(Number(quantity) || 1)));

  if (existingItem) {
    existingItem.quantity = Math.min(99, existingItem.quantity + amount);
  } else {
    cart.push({ id: product.id, quantity: amount });
  }

  saveCart(cart);
  showToast('«' + product.title + '» добавлен в корзину');
  renderCart();
  return true;
}

function removeFromCart(productId) {
  const id = Number(productId);
  saveCart(getCart().filter((item) => item.id !== id));
  renderCart();
}

function setCartQuantity(productId, quantity) {
  const id = Number(productId);
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  item.quantity = Math.min(99, Math.max(1, Math.round(Number(quantity) || 1)));
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

/* ---------- Промокод ---------- */

function getPromoCode() {
  const stored = readStorage(STORAGE_KEYS.promo, '');
  return typeof stored === 'string' && PROMO_CODES[stored] ? stored : '';
}

function getDiscountRate() {
  const code = getPromoCode();
  return code ? PROMO_CODES[code].rate : 0;
}

/* ---------- Итоги ---------- */

function getCartDetails() {
  const items = getCart().map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return {
      product,
      quantity: item.quantity,
      sum: product.price * item.quantity
    };
  });

  const subtotal = items.reduce((total, item) => total + item.sum, 0);
  const discount = Math.round(subtotal * getDiscountRate());

  return {
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    quantity: items.reduce((total, item) => total + item.quantity, 0)
  };
}

/* ---------- Разметка страницы cart.html ---------- */

function createCartRow(item) {
  const product = item.product;
  const row = createNode('li', 'cart-item');
  row.dataset.id = String(product.id);

  const image = document.createElement('img');
  image.className = 'cart-item__image';
  image.src = product.image;
  image.alt = product.title;
  image.width = 96;
  image.height = 72;
  image.loading = 'lazy';

  const info = createNode('div', 'cart-item__info');
  const titleLink = createNode('a', 'cart-item__title', product.title);
  titleLink.href = 'product.html?id=' + product.id;
  info.append(titleLink, createNode('p', 'cart-item__category', product.category));

  const controls = createNode('div', 'cart-item__controls');
  const decreaseButton = createButton(
    '−',
    'cart-item__counter-button',
    'decrease',
    product.id
  );
  decreaseButton.setAttribute('aria-label', 'Уменьшить количество: ' + product.title);
  decreaseButton.disabled = item.quantity <= 1;

  const increaseButton = createButton(
    '+',
    'cart-item__counter-button',
    'increase',
    product.id
  );
  increaseButton.setAttribute('aria-label', 'Увеличить количество: ' + product.title);

  controls.append(
    decreaseButton,
    createNode('span', 'cart-item__quantity', String(item.quantity)),
    increaseButton
  );

  const priceNode = createNode('div', 'cart-item__price');
  priceNode.append(
    createNode('span', 'cart-item__price-main', formatPrice(item.sum)),
    createNode(
      'span',
      'cart-item__price-unit',
      formatPrice(product.price) + ' за штуку'
    )
  );

  const removeButton = createButton('Удалить', 'cart-item__remove', 'remove', product.id);
  removeButton.setAttribute('aria-label', 'Удалить из корзины: ' + product.title);

  row.append(image, info, controls, priceNode, removeButton);
  return row;
}

function renderCart() {
  const list = document.querySelector('#cart-items');
  if (!list) return;

  const details = getCartDetails();
  list.replaceChildren();
  details.items.forEach((item) => list.append(createCartRow(item)));

  const isEmpty = details.items.length === 0;
  const emptyState = document.querySelector('#cart-empty');
  const cartContent = document.querySelector('#cart-content');

  if (emptyState) emptyState.classList.toggle('is-hidden', !isEmpty);
  if (cartContent) cartContent.classList.toggle('is-hidden', isEmpty);

  const subtotalNode = document.querySelector('#cart-subtotal');
  if (subtotalNode) subtotalNode.textContent = formatPrice(details.subtotal);

  const discountRow = document.querySelector('#cart-discount-row');
  if (discountRow) discountRow.classList.toggle('is-hidden', details.discount === 0);

  const discountNode = document.querySelector('#cart-discount');
  if (discountNode) discountNode.textContent = '−' + formatPrice(details.discount);

  const totalNode = document.querySelector('#cart-total');
  if (totalNode) totalNode.textContent = formatPrice(details.total);

  const countNode = document.querySelector('#cart-count');
  if (countNode) {
    countNode.textContent =
      details.quantity === 0
        ? 'Корзина пуста'
        : 'Товаров: ' + details.quantity + ' · ' + formatPrice(details.total);
  }

  const promoInput = document.querySelector('#promo-input');
  if (promoInput && document.activeElement !== promoInput) {
    promoInput.value = getPromoCode();
  }

  const promoMessage = document.querySelector('#promo-message');
  if (promoMessage) {
    const promoCode = getPromoCode();
    if (promoCode) {
      promoMessage.textContent =
        'Промокод ' + promoCode + ' применён: скидка ' + PROMO_CODES[promoCode].label + '.';
      promoMessage.classList.remove('promo-form__message--error');
    } else if (!promoMessage.dataset.keepMessage) {
      promoMessage.textContent = '';
    }
  }
}

function handleCartClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const productId = Number(target.dataset.id);
  const action = target.dataset.action;
  const item = getCart().find((entry) => entry.id === productId);

  if (action === 'increase' && item) {
    setCartQuantity(productId, item.quantity + 1);
  }

  if (action === 'decrease' && item) {
    setCartQuantity(productId, item.quantity - 1);
  }

  if (action === 'remove') {
    const product = products.find((entry) => entry.id === productId);
    removeFromCart(productId);
    showToast(product ? '«' + product.title + '» удалён из корзины' : 'Товар удалён из корзины');
  }
}

function handlePromoSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const input = form.querySelector('#promo-input');
  const message = document.querySelector('#promo-message');
  const code = input ? input.value.trim().toUpperCase() : '';

  if (!message) return;

  if (!code) {
    writeStorage(STORAGE_KEYS.promo, '');
    message.textContent = 'Промокод сброшен.';
    message.classList.remove('promo-form__message--error');
  } else if (PROMO_CODES[code]) {
    writeStorage(STORAGE_KEYS.promo, code);
    message.textContent =
      'Промокод ' + code + ' применён: скидка ' + PROMO_CODES[code].label + '.';
    message.classList.remove('promo-form__message--error');
  } else {
    message.textContent = 'Такого промокода нет. Попробуйте SALE10 или TECH15.';
    message.classList.add('promo-form__message--error');
    message.dataset.keepMessage = 'true';
  }

  renderCart();
}

function initCartPage() {
  const list = document.querySelector('#cart-items');
  if (!list) return;

  list.addEventListener('click', handleCartClick);

  const clearButton = document.querySelector('#clear-cart');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (getCart().length === 0) return;
      clearCart();
      showToast('Корзина очищена');
    });
  }

  const promoForm = document.querySelector('#promo-form');
  if (promoForm) promoForm.addEventListener('submit', handlePromoSubmit);

  renderCart();
}

/* ---------- Сводка заказа на странице order.html ---------- */

function refreshOrderSummary() {
  const container = document.querySelector('#order-summary');
  if (!container) return;

  const details = getCartDetails();
  container.replaceChildren();

  container.append(
    createNode('h2', 'summary__title', 'Ваш заказ')
  );

  if (details.items.length === 0) {
    container.append(
      createNode(
        'p',
        'summary__empty',
        'Корзина пуста. Заявку можно отправить и без товаров — мы подберём комплект по телефону.'
      )
    );
    const catalogLink = createNode('a', 'button button--ghost button--small', 'Перейти в каталог');
    catalogLink.href = 'catalog.html';
    container.append(catalogLink);
    return;
  }

  const list = createNode('ul', 'summary__list');
  details.items.forEach((item) => {
    const row = createNode('li', 'summary__row');
    const title = createNode(
      'span',
      'summary__row-title',
      item.product.title + ' × ' + item.quantity
    );
    row.append(title, createNode('span', 'summary__row-sum', formatPrice(item.sum)));
    list.append(row);
  });
  container.append(list);

  const totals = createNode('dl', 'summary__totals');
  totals.append(
    createNode('dt', null, 'Товары'),
    createNode('dd', null, formatPrice(details.subtotal))
  );

  if (details.discount > 0) {
    totals.append(
      createNode('dt', 'summary__discount', 'Скидка по промокоду'),
      createNode('dd', 'summary__discount', '−' + formatPrice(details.discount))
    );
  }

  totals.append(
    createNode('dt', 'summary__total-label', 'Итого'),
    createNode('dd', 'summary__total', formatPrice(details.total))
  );
  container.append(totals);
}

function initOrderSummary() {
  if (!document.querySelector('#order-summary')) return;
  refreshOrderSummary();
}

/* ---------- Запуск ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initCartPage();
  initOrderSummary();
});
