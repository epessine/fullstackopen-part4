const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/User');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
    .populate('blogs', { 
      title: 1, 
      name: 1,
      url: 1,
      likes: 1
    });
  res.status(200).json(users);
});

usersRouter.post('/', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json('error: username or password missing');
  }
  if (req.body.username.length < 3 || req.body.password.length < 3) {
    return res.status(400).json('error: username or password must be at least 3 characters long');
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    username: req.body.username,
    name: req.body.name,
    passwordHash,
  });
  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = usersRouter;