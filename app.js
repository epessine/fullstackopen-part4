const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const blogsRouter = require('./controllers/blogs');

logger.info('Connecting to MongoDB...');

mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => logger.info('DB connected!'))
  .catch(e => logger.error(e));

app.use(express.json());
app.use('/api/blogs', blogsRouter);

module.exports = app;