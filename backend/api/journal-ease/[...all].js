const app = require('../../app');

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  return app(req, res);
};
