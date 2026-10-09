function notFound(req, res) {
  res.status(404).render('404', { title: 'Страница не найдена' });
}

module.exports = notFound;
