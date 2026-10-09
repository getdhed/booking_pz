const validationSettings = require('../config/validationSettings');

function validateWebRoom(body) {
  const errors = [];
  const room = {};
  const settings = validationSettings.room;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Отправьте заполненную форму с данными комнаты.'] };
  }

  function text(field, label) {
    const rules = settings[field];
    const value = body[field];

    if (value === undefined || value === null) {
      if (rules.required) {
        errors.push(`${label}: поле обязательно для заполнения.`);
      } else {
        room[field] = '';
      }
      return;
    }

    if (typeof value !== 'string') {
      errors.push(`${label}: требуется текст.`);
      return;
    }

    // Браузер отправляет переносы textarea как CRLF; нормализуем их перед подсчётом длины.
    const trimmed = value.replace(/\r\n?/g, '\n').trim();

    if (rules.required && trimmed.length === 0) {
      errors.push(`${label}: поле обязательно для заполнения.`);
      return;
    }

    if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
      if (rules.minLength > 0) {
        errors.push(`${label}: допустимая длина от ${rules.minLength} до ${rules.maxLength} символов.`);
      } else {
        errors.push(`${label}: не более ${rules.maxLength} символов.`);
      }
      return;
    }

    room[field] = trimmed;
  }

  function integer(field, label) {
    const rules = settings[field];
    const value = body[field];

    if ((value === undefined || value === null || value === '') && !rules.required) {
      room[field] = null;
      return;
    }

    const normalized = typeof value === 'string' ? value.trim() : value;

    if ((typeof normalized !== 'string' && typeof normalized !== 'number') ||
        (typeof normalized === 'string' && !/^-?\d+$/.test(normalized))) {
      errors.push(`${label}: требуется целое число от ${rules.min} до ${rules.max}.`);
      return;
    }

    const number = Number(normalized);

    if (!Number.isSafeInteger(number) || number < rules.min || number > rules.max) {
      errors.push(`${label}: требуется целое число от ${rules.min} до ${rules.max}.`);
      return;
    }

    room[field] = number;
  }

  text('name', 'Название');
  text('roomNumber', 'Номер комнаты');
  text('location', 'Расположение');
  integer('floor', 'Этаж');
  integer('capacity', 'Вместимость');
  text('description', 'Описание');

  return { errors, room };
}

module.exports = validateWebRoom;
