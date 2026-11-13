/* js/validation.js — валидация форм.
   Ошибки выводятся текстом рядом с полями через textContent,
   без alert() и без innerHTML. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/;
const PHONE_ALLOWED_PATTERN = /^[+\d\s()\-]+$/;

function onlyDigits(value) {
  return String(value).replace(/\D/g, '');
}

/* ---------- Общие помощники для полей ---------- */

function getField(form, name) {
  return form.elements.namedItem(name);
}

function getFieldWrapper(form, name) {
  const field = getField(form, name);
  return field ? field.closest('.field') : null;
}

function setFieldError(form, name, message) {
  const wrapper = getFieldWrapper(form, name);
  const field = getField(form, name);
  const errorNode = form.querySelector('[data-error-for="' + name + '"]');

  if (wrapper) wrapper.classList.toggle('field--invalid', Boolean(message));
  if (field && field.type !== 'checkbox') field.setAttribute('aria-invalid', String(Boolean(message)));
  if (errorNode) errorNode.textContent = message;
}

function clearFieldError(form, name) {
  setFieldError(form, name, '');
}

function setFormStatus(form, message, type) {
  const status = form.querySelector('[data-form-status]');
  if (!status) return;

  status.textContent = message;
  status.classList.remove('form-status--error', 'form-status--success');
  if (type) status.classList.add('form-status--' + type);
}

function focusFirstInvalid(form) {
  const invalidField = form.querySelector('.field--invalid .field__control');
  if (invalidField) invalidField.focus();
}

/* ---------- Правила для формы заявки ---------- */

const orderRules = {
  name(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Укажите имя и фамилию.';
    if (trimmed.length < 2) return 'Имя должно содержать минимум 2 символа.';
    if (trimmed.length > 40) return 'Имя не должно быть длиннее 40 символов.';
    return '';
  },

  email(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Укажите e-mail для связи.';
    if (!EMAIL_PATTERN.test(trimmed)) return 'Похоже, в адресе опечатка. Пример: name@mail.ru.';
    return '';
  },

  phone(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Укажите номер телефона.';
    if (!PHONE_ALLOWED_PATTERN.test(trimmed)) {
      return 'В номере допустимы только цифры, пробелы, скобки, «+» и «-».';
    }
    const digits = onlyDigits(trimmed);
    if (digits.length < 10 || digits.length > 15) {
      return 'В номере должно быть от 10 до 15 цифр.';
    }
    return '';
  },

  city(value) {
    if (value.trim().length > 60) return 'Название города слишком длинное.';
    return '';
  },

  comment(value) {
    if (value.trim().length > 300) return 'Комментарий не должен быть длиннее 300 символов.';
    return '';
  },

  agreement(checked) {
    return checked ? '' : 'Без согласия на обработку данных заявку нельзя отправить.';
  }
};

const ORDER_FIELDS = ['name', 'email', 'phone', 'city', 'comment', 'agreement'];

function validateOrderField(form, name) {
  const field = getField(form, name);
  if (!field) return true;

  const value = field.type === 'checkbox' ? field.checked : field.value;
  const error = orderRules[name](value);
  setFieldError(form, name, error);
  return !error;
}

function validateOrderForm(form) {
  const results = ORDER_FIELDS.map((name) => validateOrderField(form, name));
  return results.every(Boolean);
}

/* ---------- Форма заявки на order.html ---------- */

function initOrderForm() {
  const form = document.querySelector('#order-form');
  if (!form) return;

  const submitButton = form.querySelector('[type="submit"]');
  const submitLabel = submitButton ? submitButton.textContent : 'Отправить заявку';
  const successPanel = document.querySelector('#order-success');
  const orderNumberNode = document.querySelector('#order-number');

  /* Живая проверка: поле перепроверяется после первой попытки отправки. */
  let hasSubmitted = false;

  ORDER_FIELDS.forEach((name) => {
    const field = getField(form, name);
    if (!field) return;

    const eventName = field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      if (hasSubmitted) validateOrderField(form, name);
    });

    field.addEventListener('blur', () => {
      if (field.type !== 'checkbox') validateOrderField(form, name);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hasSubmitted = true;

    const isValid = validateOrderForm(form);

    if (!isValid) {
      setFormStatus(form, 'Проверьте выделенные поля — в них есть ошибки.', 'error');
      focusFirstInvalid(form);
      return;
    }

    setFormStatus(form, 'Отправляем заявку…', 'success');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем…';
    }

    /* Имитация отправки: в КР №4 достаточно клиентской части. */
    window.setTimeout(() => {
      const orderNumber = 'KR4-' + String(Date.now()).slice(-6);

      if (orderNumberNode) orderNumberNode.textContent = orderNumber;
      if (successPanel) {
        successPanel.classList.remove('is-hidden');
        successPanel.focus();
      }

      setFormStatus(form, 'Заявка № ' + orderNumber + ' подготовлена. Мы позвоним в рабочее время.', 'success');

      form.reset();
      ORDER_FIELDS.forEach((name) => clearFieldError(form, name));
      hasSubmitted = false;

      clearCart();
      refreshOrderSummary();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
    }, 700);
  });
}

/* ---------- Форма обратной связи на contacts.html ---------- */

const CONTACT_FIELDS = ['name', 'email', 'message'];

const contactRules = {
  name: orderRules.name,
  email: orderRules.email,
  message(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Напишите сообщение.';
    if (trimmed.length < 10) return 'Сообщение должно содержать минимум 10 символов.';
    if (trimmed.length > 500) return 'Сообщение не должно быть длиннее 500 символов.';
    return '';
  }
};

function validateContactField(form, name) {
  const field = getField(form, name);
  if (!field) return true;

  const error = contactRules[name](field.value);
  setFieldError(form, name, error);
  return !error;
}

function initContactsForm() {
  const form = document.querySelector('#contacts-form');
  if (!form) return;

  const submitButton = form.querySelector('[type="submit"]');
  const successMessage = document.querySelector('#contacts-success');
  let hasSubmitted = false;

  CONTACT_FIELDS.forEach((name) => {
    const field = getField(form, name);
    if (!field) return;

    field.addEventListener('input', () => {
      if (hasSubmitted) validateContactField(form, name);
    });
    field.addEventListener('blur', () => validateContactField(form, name));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hasSubmitted = true;

    const isValid = CONTACT_FIELDS.map((name) => validateContactField(form, name)).every(Boolean);

    if (!isValid) {
      setFormStatus(form, 'Проверьте имя, e-mail и текст сообщения.', 'error');
      focusFirstInvalid(form);
      return;
    }

    if (submitButton) submitButton.disabled = true;

    window.setTimeout(() => {
      setFormStatus(form, 'Сообщение отправлено. Ответим на указанный e-mail.', 'success');
      if (successMessage) successMessage.classList.remove('is-hidden');
      form.reset();
      CONTACT_FIELDS.forEach((name) => clearFieldError(form, name));
      hasSubmitted = false;
      if (submitButton) submitButton.disabled = false;
    }, 600);
  });
}

/* ---------- Запуск ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initOrderForm();
  initContactsForm();
});
