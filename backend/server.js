const dotenv = require('dotenv');
const app = require('./app');
// Initialize SQLite database (creates tables on first require)
require('./db');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});