// Load env FIRST
require('dotenv').config({ path: './.env' });

const app = require('./app');

const port = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
}
