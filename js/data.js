/* js/data.js — данные каталога.
   Массив products — единственный источник товаров для всех страниц.
   У каждого товара одинаковая структура:
   id, title, category, price (число), oldPrice, isAvailable,
   rating, badge, image, shortDescription, description. */

const products = [
  {
    id: 1,
    title: 'Наушники Aura Studio',
    category: 'Аудио',
    price: 12990,
    oldPrice: 15990,
    isAvailable: true,
    rating: 4.8,
    badge: 'Хит',
    image: 'images/headphones.svg',
    shortDescription: 'Полноразмерные наушники с активным шумоподавлением.',
    description:
      'Мягкие амбушюры, до 32 часов автономности и прозрачный режим для разговоров. Складываются в компактный кейс, подключаются по Bluetooth 5.3 и USB-C.'
  },
  {
    id: 2,
    title: 'Колонка Pulse Mini',
    category: 'Аудио',
    price: 6490,
    oldPrice: null,
    isAvailable: true,
    rating: 4.5,
    badge: null,
    image: 'images/speaker.svg',
    shortDescription: 'Портативная колонка с чистым басом и защитой от воды.',
    description:
      'Вес 480 граммов, 12 часов работы от одного заряда и защита IPX7. Можно объединить две колонки в стереопару через приложение.'
  },
  {
    id: 3,
    title: 'Микрофон Vox Cast',
    category: 'Аудио',
    price: 8990,
    oldPrice: 10490,
    isAvailable: true,
    rating: 4.7,
    badge: 'Новинка',
    image: 'images/microphone.svg',
    shortDescription: 'USB-микрофон для стримов, звонков и подкастов.',
    description:
      'Кардиоидная диаграмма направленности, встроенный pop-фильтр и регулятор усиления на корпусе. Подключается без драйверов.'
  },
  {
    id: 4,
    title: 'Клавиатура Keyline 75',
    category: 'Периферия',
    price: 10990,
    oldPrice: null,
    isAvailable: true,
    rating: 4.9,
    badge: 'Хит',
    image: 'images/keyboard.svg',
    shortDescription: 'Механическая клавиатура 75% с горячей заменой свитчей.',
    description:
      'Алюминиевый корпус, смазанные линейные свитчи, подсветка и три режима подключения: USB-C, Bluetooth и радиоканал 2.4 ГГц.'
  },
  {
    id: 5,
    title: 'Мышь Glide Pro',
    category: 'Периферия',
    price: 4290,
    oldPrice: 4990,
    isAvailable: true,
    rating: 4.6,
    badge: null,
    image: 'images/mouse.svg',
    shortDescription: 'Лёгкая беспроводная мышь с сенсором 26 000 DPI.',
    description:
      'Вес 61 грамм, тихие переключатели и до 90 часов работы. Подходит и для работы, и для игр: есть переключатель частоты опроса.'
  },
  {
    id: 6,
    title: 'Монитор Vision 27',
    category: 'Периферия',
    price: 27990,
    oldPrice: 32990,
    isAvailable: true,
    rating: 4.4,
    badge: null,
    image: 'images/monitor.svg',
    shortDescription: '27-дюймовый монитор 2K с матрицей IPS и высотой 100 мм.',
    description:
      'Разрешение 2560×1440, 75 Гц, честная цветопередача и регулируемая подставка. Два входа HDMI и один DisplayPort, встроенные динамики.'
  },
  {
    id: 7,
    title: 'Веб-камера ClearView HD',
    category: 'Периферия',
    price: 5490,
    oldPrice: null,
    isAvailable: false,
    rating: 4.2,
    badge: null,
    image: 'images/camera.svg',
    shortDescription: 'Веб-камера 1080p с автофокусом и шторкой.',
    description:
      'Снимает 1080p при 30 кадрах в секунду, автоматически выравнивает яркость и крепится на любой монитор. Микрофон с шумоподавлением.'
  },
  {
    id: 8,
    title: 'Пауэрбанк Volt 20K',
    category: 'Аксессуары',
    price: 3990,
    oldPrice: 4590,
    isAvailable: true,
    rating: 4.7,
    badge: null,
    image: 'images/powerbank.svg',
    shortDescription: 'Внешний аккумулятор на 20 000 мА·ч с быстрой зарядкой.',
    description:
      'Заряжает ноутбук по USB-C Power Delivery 65 Вт и два телефона одновременно. Корпус из переработанного алюминия, дисплей с процентом заряда.'
  },
  {
    id: 9,
    title: 'Хаб USB-C Port Five',
    category: 'Аксессуары',
    price: 2490,
    oldPrice: null,
    isAvailable: true,
    rating: 4.3,
    badge: null,
    image: 'images/hub.svg',
    shortDescription: 'Пять портов из одного разъёма USB-C.',
    description:
      'HDMI 4K, два USB-A 3.0, кардридер SD и порт USB-C с зарядкой 100 Вт. Компактный корпус помещается в карман ноутбука.'
  },
  {
    id: 10,
    title: 'Лампа Lumen Smart',
    category: 'Умный дом',
    price: 3290,
    oldPrice: null,
    isAvailable: true,
    rating: 4.6,
    badge: 'Новинка',
    image: 'images/lamp.svg',
    shortDescription: 'Настольная лампа с регулировкой теплоты света.',
    description:
      'Меняет температуру света от тёплой к холодной, запоминает сценарии и управляется приложением или кнопкой на основании.'
  },
  {
    id: 11,
    title: 'Роутер Mesh Node',
    category: 'Умный дом',
    price: 7990,
    oldPrice: null,
    isAvailable: false,
    rating: 4.1,
    badge: null,
    image: 'images/router.svg',
    shortDescription: 'Wi-Fi 6 роутер для бесшовной сети во всей квартире.',
    description:
      'Скорость до 1800 Мбит/с, гостевая сеть и родительский контроль. Несколько модулей объединяются в единую mesh-сеть.'
  }
];
