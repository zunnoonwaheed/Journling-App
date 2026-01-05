const app = require('../../app');

// Export as Vercel serverless function handler
// For Vercel, we need to handle the request and ensure the path is correct
module.exports = async (req, res) => {
  // Log for debugging (remove in production if needed)
  console.log('Request received:', req.method, req.url);
  
  // Ensure the path includes the full route prefix
  // Vercel's [...all] catch-all should preserve the full path, but let's be safe
  if (req.url && !req.url.startsWith('/api/journal-ease')) {
    // If path was stripped, restore it
    const path = req.url.startsWith('/') ? req.url : '/' + req.url;
    req.url = '/api/journal-ease' + path;
  }
  
  // Pass to Express app
  return app(req, res);
};
