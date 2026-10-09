const fileLogger = require('../utils/fileLogger');

const formatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Minsk',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});

function logger(req, res, next) {
  const timestamp = formatter.format(new Date()).replace(', ', ' ');

  // Экранируем управляющие символы, чтобы один запрос всегда занимал одну строку лога.
  const url = req.originalUrl.replace(/[\u0000-\u001f\u007f]/g, char =>
    `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);

  fileLogger.log(`[${timestamp}] ${req.method} ${url}`);
  next();
}

module.exports = logger;
