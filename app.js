const express = require('express');
require('express-async-errors');
const app = express();
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? config.TEST_DB_URI
  : config.DB_URI;

logger.info('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => logger.info('DB connected!'))
  .catch(e => logger.error(e));

app.use(express.json());

app.use('/api/login', loginRouter);

app.use(middleware.userExtractor);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;