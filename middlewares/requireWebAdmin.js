function requireWebAdmin(req, res, next) {
  const user = req.user || res.locals.currentUser;

  if (!user) {
    return res.redirect('/login');
  }

  if (user.role !== 'admin') {
    return res.status(403).render('403', {
      title: 'Доступ запрещён'
    });
  }

  next();
}

module.exports = requireWebAdmin;