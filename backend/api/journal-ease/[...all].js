const app = require('../../app');

// Export as Vercel serverless function handler
module.exports = async (req, res) => {
  // Log for debugging
  console.log('=== Serverless Function Invoked ===');
  console.log('Method:', req.method);
  console.log('Original req.url:', req.url);
  console.log('Original req.path:', req.path);
  
  // Vercel's behavior with [...all] catch-all:
  // - Request to: /api/journal-ease/auth/login
  // - Vercel may pass: req.url = '/api/journal-ease/auth/login' (full path) OR '/auth/login' (stripped)
  // - We need to ensure it's '/api/journal-ease/auth/login' for Express
  
  const originalUrl = req.url || req.path || '/';
  
  // Only add prefix if it's not already there
  if (!originalUrl.startsWith('/api/journal-ease')) {
    // Path was stripped, add prefix back
    const pathAfterPrefix = originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl;
    req.url = '/api/journal-ease' + pathAfterPrefix;
    console.log('Path was stripped, added prefix. New req.url:', req.url);
  } else {
    // Path already includes prefix, use as-is
    req.url = originalUrl;
    console.log('Path already correct, using as-is:', req.url);
  }
  
  // Pass to Express app
  return app(req, res);
};
