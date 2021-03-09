var express = require('express');
var router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.User.findAll()
    .then(users => {
      res.json(users)
    })
});

router.post('/', (req, res) => {
  db.User.create({
    name: req.body.name,
    email: req.body.email,
    gamerTag: req.body.gamerTag
  })
    .then(user => {
      res.json(user);
    })
    .catch(error => {
      res.json(error.errors.map(e => e.message))
    })
})

router.post('/register', async (req, res) => {
  // check if user exists
  const users = await db.User.findAll({
    where: {
      email: req.body.email
    }
  })
  // if user exists, send error
  if (users.length) {
    return res.status(422).json({ error: 'email already in use' });
  }
  // check name, email, gamerTag, password
  // if not all data included, send error
  if (!req.body.email || !req.body.name || !req.body.gamerTag || !req.body.password) {
    return res.status(422).json({ error: 'please include all required fields' });
  }
  // hash password
  const hash = await bcrypt.hash(req.body.password, 10)
  // create user
  const newUser = await db.User.create({
    email: req.body.email,
    name: req.body.name,
    gamerTag: req.body.gamerTag,
    password: hash
  })

  res.json(newUser);
})

router.post('/login', async (req,res) => {
  // check for email and password
  if (!req.body.email || !req.body.password) {
    return res.status(422).render( 'error', {
      locals: { error: 'please include all required fields' }
     }); 
  }
  // get user from db by email
  const user = await db.User.findOne({
    where: {
      email: req.body.email
    }
  })
    // error if no user 
    if (!user) {
      return res.status(404).render('error', { locals: { error: 'could not find user with that email' }})
    }
    console.log(req.body.password, user.password)
  // compare user input (password) to hash
  const match = await bcrypt.compare(req.body.password, user.password)
  // error if wrong
  if (!match) {
    return res.status(401).render('error', { locals: { error: 'incorrect password' }})
  }

  // set user data on session
  req.session.user = user;

  res.redirect('/games');

  // login
  res.json({ 
    success: 'logged in!', 
    user: user 
  })
})

router.get('/logout', (req, res) => {
  // clear user data on session to logout
  req.session.user = null;

  res.redirect('/');
})

module.exports = router;
