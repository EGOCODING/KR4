/* js/main.js — общая инициализация проекта.
   Здесь живут вещи, которые нужны на каждой странице:
   работа с localStorage, форматирование цены, тёмная тема,
   мобильное меню, счётчики в шапке, избранное и всплывающие уведомления. */

const STORAGE_KEYS = {
  cart: 'kr4-shop:cart',
  favorites: 'kr4-shop:favorites',
  theme: 'kr4-shop:theme',
  promo: 'kr4-shop:promo'
};

/* ---------- localStorage ---------- */

function readStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) return fallback;
    const parsed = JSON.parse(rawValue);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    console.warn('Не удалось прочитать localStorage по ключу', key, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Не удалось сохранить значение в localStorage по ключу', key, error);
  }
}

/* ---------- Общие помощники ---------- */

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(Number(value)) + ' ₽';
}

/* Короткая обёртка над createElement: экономит повторение
   при сборке карточек, строк корзины и модального окна. */
function createNode(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function createButton(label, className, action, productId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  if (action) button.dataset.action = action;
  if (productId !== undefined) button.dataset.id = String(productId);
  return button;
}

/* ---------- Всплывающие уведомления (вместо alert) ---------- */

function showToast(message, type = 'success') {
  const container = document.querySelector('.toasts');
  if (!container) return;

  const toast = createNode('div', 'toast toast--' + type, message);
  toast.setAttribute('role', 'status');
  container.append(toast);

  window.setTimeout(() => {
    toast.classList.add('toast--leaving');
    window.setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ---------- Избранное ---------- */

function getFavorites() {
  const stored = readStorage(STORAGE_KEYS.favorites, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(Number).filter((id) => Number.isFinite(id));
}

function saveFavorites(ids) {
  writeStorage(STORAGE_KEYS.favorites, ids);
  updateHeaderCounters();
}

function isFavorite(productId) {
  return getFavorites().includes(Number(productId));
}

/* Возвращает true, если товар попал в избранное. */
function toggleFavorite(productId) {
  const id = Number(productId);
  const favorites = getFavorites();
  const wasFavorite = favorites.includes(id);
  const nextFavorites = wasFavorite
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];

  saveFavorites(nextFavorites);
  syncFavoriteButtons(id, !wasFavorite);

  const product = products.find((item) => item.id === id);
  const title = product ? '«' + product.title + '»' : 'Товар';
  showToast(wasFavorite ? title + ' убран из избранного' : title + ' добавлен в избранное');

  return !wasFavorite;
}

/* Обновляет все кнопки-сердечки этого товара на странице. */
function syncFavoriteButtons(productId, isActive) {
  const buttons = document.querySelectorAll(
    '[data-action="favorite"][data-id="' + productId + '"]'
  );
  buttons.forEach((button) => {
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.setAttribute(
      'aria-label',
      isActive ? 'Убрать из избранного' : 'Добавить в избранное'
    );
  });
}

/* ---------- Счётчики в шапке ---------- */

function setCounter(selector, value, label) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = String(value);
    node.classList.toggle('badge--empty', value === 0);
    node.setAttribute('aria-label', label + ': ' + value);
  });
}

function updateHeaderCounters() {
  const cartQuantity = typeof getCartQuantity === 'function' ? getCartQuantity() : 0;
  setCounter('.js-cart-count', cartQuantity, 'Товаров в корзине');
  setCounter('.js-favorites-count', getFavorites().length, 'Товаров в избранном');
}

/* ---------- Тёмная тема ---------- */

function getPreferredTheme() {
  const stored = readStorage(STORAGE_KEYS.theme, null);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;

  const isDark = theme === 'dark';
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute(
    'aria-label',
    isDark ? 'Включить светлую тему' : 'Включить тёмную тему'
  );

  const icon = toggle.querySelector('.icon-button__icon');
  if (icon) icon.textContent = isDark ? '☀' : '☾';
}

function initTheme() {
  applyTheme(getPreferredTheme());

  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    writeStorage(STORAGE_KEYS.theme, nextTheme);
  });
}

/* ---------- Мобильное меню ---------- */

function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('#nav-toggle');
  const nav = document.querySelector('#site-nav');
  if (!header || !toggle || !nav) return;

  const closeNav = () => {
    header.classList.remove('site-header--nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('site-header--nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav();
  });
}

/* ---------- Активный пункт меню ---------- */

function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isCurrent =
      href === currentPage || (currentPage === 'product.html' && href === 'catalog.html');

    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/* ---------- Запуск ---------- */

function initApp() {
  initTheme();
  initNavigation();
  initActiveNav();
  updateHeaderCounters();

  const yearNode = document.querySelector('#current-year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', initApp);
