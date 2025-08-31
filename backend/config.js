module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  SCRAPING_TIMEOUT: 30000,
  SCRAPING_DELAY: 2000
};
