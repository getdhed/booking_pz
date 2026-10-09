const fileLogger = require('../utils/fileLogger');

function webErrorHandler(err, req, res, next) {
  fileLogger.error(err instanceof Error ? err.stack : 'Неизвестная ошибка сервера');

  if (res.headersSent) {
    return next(err);
  }

  // Ошибки разбора формы и другие клиентские ошибки показываем как контролируемый 400.
  if (err && err.status >= 400 && err.status < 500) {
    return res.status(400).render('400', {
      title: 'Некорректный запрос',
      errors: ['Не удалось обработать запрос. Проверьте формат и размер отправленных данных.']
    });
  }

  // Callback не позволяет ошибке самого шаблона раскрыть stack trace пользователю.
  return res.status(500).render('500', { title: 'Ошибка сервера' }, (renderError, html) => {
    if (renderError) {
      fileLogger.error(renderError.stack || renderError);
      return res.status(500).type('text').send('Ошибка сервера. Попробуйте позже.');
    }

    return res.send(html);
  });
}

module.exports = webErrorHandler;
