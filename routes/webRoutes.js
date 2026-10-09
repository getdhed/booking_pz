const express = require('express');
const { UniqueConstraintError } = require('sequelize');
const Room = require('../models/Room');

const validateWebRoom = require('../validation/webRoom');
const webAuth = require('../middlewares/webAuth');
const validationSettings = require('../config/validationSettings');

function createWebRoutes() {
  const router = express.Router();
  router.use(webAuth);

  router.get('/login', (req, res) => res.render('login', { title: 'Учебный вход' }));
  router.get('/login/admin', (req, res) => res.redirect('/?auth=1&role=admin'));
  router.get('/login/user', (req, res) => res.redirect('/?auth=1&role=user'));
  router.get('/logout', (req, res) => res.redirect('/login'));

  router.get('/', webAuth.requireUser, async (req, res, next) => {
    try {
      const rooms = await Room.findAll({ order: [['id', 'ASC']] });
      return res.render('index', { title: 'Переговорные комнаты', rooms });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/item/:id', webAuth.requireUser, async (req, res, next) => {
    try {
      const rawId = req.params.id;
      const id = Number(rawId);

      if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
        return res.status(404).render('404', { title: 'Комната не найдена' });
      }

      const room = await Room.findByPk(id);
      if (!room) {
        return res.status(404).render('404', { title: 'Комната не найдена' });
      }

      return res.render('item', { title: room.name, room });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/add', webAuth.requireUser, webAuth.requireAdmin, (req, res) => {
    res.render('add', {
      title: 'Добавить комнату',
      validation: validationSettings.room
    });
  });

  router.post(
    '/add',
    webAuth.requireUser,
    webAuth.requireAdmin,
    express.urlencoded({ extended: false, limit: '16kb', parameterLimit: 20 }),
    async (req, res, next) => {
      try {
        const { errors, room } = validateWebRoom(req.body);

        if (errors.length) {
          return res.status(400).render('400', {
            title: 'Проверьте данные',
            errors
          });
        }

        await Room.create(room);
        return res.redirect(303, '/?auth=1&role=admin');
      } catch (err) {
        if (err instanceof UniqueConstraintError) {
          return res.status(400).render('400', {
            title: 'Проверьте данные',
            errors: ['Комната с таким номером уже существует.']
          });
        }

        return next(err);
      }
    }
  );

  router.get('/error', webAuth.requireUser, webAuth.requireAdmin, (req, res, next) => {
    next(new Error('Учебная проверка страницы 500'));
  });

 router.post(
  '/item/:id/delete',
  webAuth.requireUser,
  webAuth.requireAdmin,
  async (req, res, next) => {
    try {
      const rawId = req.params.id;
      const id = Number(rawId);

      if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
        return res.status(404).render('404', {
          title: 'Комната не найдена'
        });
      }

      const room = await Room.findByPk(id);

      if (!room) {
        return res.status(404).render('404', {
          title: 'Комната не найдена'
        });
      }

      await room.destroy();

      return res.redirect('/?auth=1&role=admin');
    } catch (err) {return next(err)}});
  return router;
}

module.exports = createWebRoutes;
