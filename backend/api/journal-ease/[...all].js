const app = require('../../app');

// Helper function to set CORS headers
function setCorsHeaders(res, origin) {
  const allowedOrigins = [
    'https://ai-journaling-app-main.vercel.app',
    'http://localhost:5173',
  ];
  
  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return true;
  }
  return false;
}

// Export as Vercel serverless function handler
module.exports = async (req, res) => {
  // Handle OPTIONS preflight requests immediately
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || req.headers.referer;
    if (setCorsHeaders(res, origin)) {
      return res.status(204).end();
    } else {
      return res.status(403).end();
    }
  }
  
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
