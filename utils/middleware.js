const logger = require('./logger');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (e, req, res, next) => {
  logger.error(e.message);

  if (e.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (e.name === 'ValidationError') {
    return res.status(400).json({ error: e.message });
  } else if (e.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token'
    });
  } else if (e.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired'
    });
  }

  next(e);
};

const userExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (token && decodedToken.id) {
      req.user = await User.findById(decodedToken.id);
      next();
    }
  } else next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  userExtractor
};