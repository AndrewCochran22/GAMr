const express = require('express');
const db = require('../models');
const router = express.Router();
const checkAuth = require('../checkAuth');

/* GET games page. */
router.get('/', checkAuth, function(req, res, next) {
  db.Game.findAll()
    .then(games => {
      res.render('games', {
        locals: {
          games,
        }
      });
    })
  });

  module.exports = router;