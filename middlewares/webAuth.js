function webAuth(req, res, next) {
  const authenticated = req.query.auth === '1';
  const role = req.query.role;

  const validRole = role === 'admin' || role === 'user';

  if (authenticated && !validRole) {
    return res.redirect(302, '/login');
  }

  req.webUser = authenticated
    ? {
        name: role === 'admin' ? 'Администратор' : 'Пользователь',
        role
      }
    : null;

  res.locals.currentUser = req.webUser;
  res.locals.webQuery = authenticated
    ? `?auth=1&role=${role}`
    : '';

  res.set('Cache-Control', 'no-store');

  next();
}

function requireUser(req, res, next) {
  if (!req.webUser) {
    return res.redirect(302, '/login');
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.webUser || req.webUser.role !== 'admin') {
    return res.status(403).render('403', {
      title: 'Доступ запрещён',
      message: 'Это действие доступно только администратору.'
    });
  }

  next();
}

module.exports = webAuth;
module.exports.requireUser = requireUser;
module.exports.requireAdmin = requireAdmin;