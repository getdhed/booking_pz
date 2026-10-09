const express = require('express');
const path = require('node:path');

const sequelize = require('./config/database');
const Room = require('./models/Room');
const logger = require('./middlewares/logger');
const createWebRoutes = require('./routes/webRoutes');
const notFound = require('./middlewares/notFound');
const webErrorHandler = require('./middlewares/webErrorHandler');
const fileLogger = require('./utils/fileLogger');

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.locals.currentUser = null;
app.locals.webQuery = '';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Логирование подключается первым, чтобы фиксировать каждый входящий HTTP-запрос.
app.use(logger);

app.use('/public', express.static(path.join(__dirname, 'public'), { index: false }));

// EJS-маршруты работают с таблицей Rooms через Sequelize.
app.use(createWebRoutes());

// Обработчики должны находиться после всех существующих маршрутов.
app.use(notFound);
app.use(webErrorHandler);

async function prepareDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();

  const roomCount = await Room.count();
  if (roomCount === 0) {
    await Room.bulkCreate([
      {
        name: 'Переговорная «Альфа»',
        roomNumber: '101',
        location: 'Главный корпус',
        floor: 1,
        capacity: 12,
        description: 'Просторная комната для встреч команды и презентаций.'
      },
      {
        name: 'Переговорная «Бета»',
        roomNumber: '204',
        location: 'Главный корпус',
        floor: 2,
        capacity: 6,
        description: 'Небольшая переговорная для рабочих обсуждений.'
      },
      {
        name: 'Комната «Гамма»',
        roomNumber: '305',
        location: 'Учебный корпус',
        floor: 3,
        capacity: 20,
        description: 'Комната для семинаров, совместной работы и больших встреч.'
      }
    ]);
  }
}

async function startServer() {
  try {
    await prepareDatabase();
    fileLogger.log('Подключение к PostgreSQL установлено. Таблица Rooms готова.');

    app.listen(port, () => {
      fileLogger.log(`Сервер запущен на http://localhost:${port}`);
    });
  } catch (err) {
    fileLogger.error('Не удалось запустить сервер из-за ошибки PostgreSQL:', err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.prepareDatabase = prepareDatabase;
