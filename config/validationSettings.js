const rawSettings = require('./validationSettings.json');

function assertBoolean(value, path) {
  if (typeof value !== 'boolean') {
    throw new Error(`Ошибка validationSettings: ${path} должен быть true или false.`);
  }
}

function assertInteger(value, path, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) {
    throw new Error(`Ошибка validationSettings: ${path} должен быть целым числом не меньше ${min}.`);
  }
}

function validateTextRule(rule, path) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
    throw new Error(`Ошибка validationSettings: отсутствует объект ${path}.`);
  }

  assertBoolean(rule.required, `${path}.required`);
  assertInteger(rule.minLength, `${path}.minLength`, 0);
  assertInteger(rule.maxLength, `${path}.maxLength`, 1);

  if (rule.minLength > rule.maxLength) {
    throw new Error(`Ошибка validationSettings: ${path}.minLength не может быть больше maxLength.`);
  }

  if (rule.required && rule.minLength < 1) {
    throw new Error(`Ошибка validationSettings: для обязательного поля ${path} minLength должен быть не меньше 1.`);
  }
}

function validateIntegerRule(rule, path) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
    throw new Error(`Ошибка validationSettings: отсутствует объект ${path}.`);
  }

  assertBoolean(rule.required, `${path}.required`);
  assertInteger(rule.min, `${path}.min`, 0);
  assertInteger(rule.max, `${path}.max`, 1);

  if (rule.min > rule.max) {
    throw new Error(`Ошибка validationSettings: ${path}.min не может быть больше max.`);
  }
}

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object' || !settings.room) {
    throw new Error('Ошибка validationSettings: отсутствует раздел room.');
  }

  validateTextRule(settings.room.name, 'room.name');
  validateTextRule(settings.room.roomNumber, 'room.roomNumber');
  validateTextRule(settings.room.location, 'room.location');
  validateIntegerRule(settings.room.floor, 'room.floor');
  validateIntegerRule(settings.room.capacity, 'room.capacity');
  validateTextRule(settings.room.description, 'room.description');

  return settings;
}

module.exports = validateSettings(rawSettings);
