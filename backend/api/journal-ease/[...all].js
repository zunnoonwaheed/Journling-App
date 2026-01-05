const app = require('../../app');

// Export as Vercel serverless function handler
module.exports = async (req, res) => {
  // Log for debugging
  console.log('=== Serverless Function Invoked ===');
  console.log('Method:', req.method);
  console.log('Original req.url:', req.url);
  console.log('Original req.path:', req.path);
  
  // In Vercel, [...all] catch-all routes:
  // - The file path: /api/journal-ease/[...all].js
  // - Request to: /api/journal-ease/auth/login
  // - Vercel passes: req.url = '/auth/login' (prefix stripped)
  // - We need: '/api/journal-ease/auth/login' for Express
  
  // Get the path after /api/journal-ease
  const pathAfterPrefix = req.url || req.path || '/';
  
  // Reconstruct the full path
  const fullPath = '/api/journal-ease' + (pathAfterPrefix.startsWith('/') ? pathAfterPrefix : '/' + pathAfterPrefix);
  
  // Update req.url for Express
  req.url = fullPath;
  
  console.log('Adjusted req.url for Express:', req.url);
  
  // Pass to Express app
  return app(req, res);
};
