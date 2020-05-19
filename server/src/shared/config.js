var dotenv = require('dotenv');
// dotenvParseVariables = require('dotenv-parse-variables');

var env = dotenv.config({ path: '.env' });
//   parsedEnv = dotenvParseVariables(env.parsed);

var database = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME,
};

module.exports = {
  database: database,
  SIURL: 'https://us.shein.com/',
  API_SHOPIFY_SERVER: 'https://fashionplum.myshopify.com',
  API_PRODUCT_COUNT: '/admin/api/2019-07/products/count.json',
  API_GET_PRODUCTS: '/admin/api/2019-07/products.json',
  API_GET_VARIANT: '/admin/api/2019-07/products/',
  CORS_ANYWHERE: 'https://cors-owner.herokuapp.com/',
  SHOPIFY_ADMIN_API_KEY: process.env.SHOPIFY_ADMIN_API_KEY,
  SHPIFY_ADMIN_SECRET_KEY: process.env.SHPIFY_ADMIN_SECRET_KEY,
};
