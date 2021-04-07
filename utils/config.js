require('dotenv').config();

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;
const TEST_DB_URI = process.env.TEST_DB_URI;

module.exports = {
  DB_URI,
  PORT,
  TEST_DB_URI
};