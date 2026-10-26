const test = require('node:test');
const assert = require('node:assert/strict');
const validateWebRoom = require('../validation/webRoom');

function validRoom(changes = {}) {
  return {
    name: 'Комната для встреч',
    roomNumber: 'T-301',
    location: 'Главный корпус',
    floor: '3',
    capacity: '12',
    description: 'Для переговоров',
    ...changes
  };
}

function check(changes = {}) {
  return validateWebRoom(validRoom(changes));
}

function assertInvalid(field, value, expectedMessage) {
  const result = check({ [field]: value });
  assert.ok(result.errors.length > 0, 'Ожидалась ошибка валидации');
  assert.ok(
    result.errors.some(message => message.includes(expectedMessage)),
    `Не найдено сообщение «${expectedMessage}»: ${result.errors.join(' | ')}`
  );
}

test('UT-01: корректные данные проходят валидацию', () => {
  const result = check();
  assert.deepEqual(result.errors, []);
  assert.equal(result.room.floor, 3);
  assert.equal(result.room.capacity, 12);
  assert.equal(result.room.name, 'Комната для встреч');
});

test('UT-02: пробелы по краям текстовых полей удаляются', () => {
  const result = check({ name: '  Тест  ', roomNumber: '  A-1  ', location: '  Корпус  ' });
  assert.deepEqual(result.errors, []);
  assert.equal(result.room.name, 'Тест');
  assert.equal(result.room.roomNumber, 'A-1');
  assert.equal(result.room.location, 'Корпус');
});

test('UT-03: отсутствие названия отклоняется', () => {
  assertInvalid('name', undefined, 'Название: поле обязательно');
});

test('UT-04: пустое название отклоняется', () => {
  assertInvalid('name', '', 'Название: поле обязательно');
});

test('UT-05: название только из пробелов отклоняется', () => {
  assertInvalid('name', '   ', 'Название: поле обязательно');
});

test('UT-06: название длиной 1 символ допускается', () => {
  assert.deepEqual(check({ name: 'А' }).errors, []);
});

test('UT-07: название длиной 100 символов допускается', () => {
  assert.deepEqual(check({ name: 'А'.repeat(100) }).errors, []);
});

test('UT-08: название длиной 101 символ отклоняется', () => {
  assertInvalid('name', 'А'.repeat(101), 'Название: допустимая длина');
});

test('UT-09: номер комнаты обязателен', () => {
  assertInvalid('roomNumber', '', 'Номер комнаты: поле обязательно');
});

test('UT-10: номер комнаты длиной 20 символов допускается', () => {
  assert.deepEqual(check({ roomNumber: '1'.repeat(20) }).errors, []);
});

test('UT-11: номер комнаты длиной 21 символ отклоняется', () => {
  assertInvalid('roomNumber', '1'.repeat(21), 'Номер комнаты: допустимая длина');
});

test('UT-12: расположение обязательно', () => {
  assertInvalid('location', '', 'Расположение: поле обязательно');
});

test('UT-13: расположение длиной 150 символов допускается', () => {
  assert.deepEqual(check({ location: 'К'.repeat(150) }).errors, []);
});

test('UT-14: расположение длиной 151 символ отклоняется', () => {
  assertInvalid('location', 'К'.repeat(151), 'Расположение: допустимая длина');
});

test('UT-15: минимальный этаж 1 допускается', () => {
  assert.deepEqual(check({ floor: '1' }).errors, []);
});

test('UT-16: этаж 0 отклоняется', () => {
  assertInvalid('floor', '0', 'Этаж: требуется целое число');
});

test('UT-17: максимальный этаж 100 допускается', () => {
  assert.deepEqual(check({ floor: '100' }).errors, []);
});

test('UT-18: этаж 101 отклоняется', () => {
  assertInvalid('floor', '101', 'Этаж: требуется целое число');
});

test('UT-19: дробный этаж отклоняется', () => {
  assertInvalid('floor', '2.5', 'Этаж: требуется целое число');
});

test('UT-20: нечисловой этаж отклоняется', () => {
  assertInvalid('floor', 'второй', 'Этаж: требуется целое число');
});

test('UT-21: минимальная вместимость 1 допускается', () => {
  assert.deepEqual(check({ capacity: '1' }).errors, []);
});

test('UT-22: вместимость 0 отклоняется', () => {
  assertInvalid('capacity', '0', 'Вместимость: требуется целое число');
});

test('UT-23: максимальная вместимость 1000 допускается', () => {
  assert.deepEqual(check({ capacity: '1000' }).errors, []);
});

test('UT-24: вместимость 1001 отклоняется', () => {
  assertInvalid('capacity', '1001', 'Вместимость: требуется целое число');
});

test('UT-25: отрицательная вместимость отклоняется', () => {
  assertInvalid('capacity', '-1', 'Вместимость: требуется целое число');
});

test('UT-26: описание необязательно', () => {
  const result = check({ description: undefined });
  assert.deepEqual(result.errors, []);
  assert.equal(result.room.description, '');
});

test('UT-27: описание длиной 2000 символов допускается', () => {
  assert.deepEqual(check({ description: 'О'.repeat(2000) }).errors, []);
});

test('UT-28: описание длиной 2001 символ отклоняется', () => {
  assertInvalid('description', 'О'.repeat(2001), 'Описание: не более 2000 символов');
});

test('UT-29: CRLF в описании нормализуется к LF', () => {
  const result = check({ description: 'Строка 1\r\nСтрока 2' });
  assert.deepEqual(result.errors, []);
  assert.equal(result.room.description, 'Строка 1\nСтрока 2');
});

test('UT-30: отсутствующая форма отклоняется', () => {
  const result = validateWebRoom(null);
  assert.ok(result.errors.length > 0);
});

test('UT-31: массив вместо формы отклоняется', () => {
  const result = validateWebRoom([]);
  assert.ok(result.errors.length > 0);
});

test('UT-32: число вместо текстового названия отклоняется', () => {
  assertInvalid('name', 123, 'Название: требуется текст');
});
