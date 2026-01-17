require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables validation
const requiredEnvVars = [
  'JWT_SECRET',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_HOST',
  'POSTGRES_PGDATA'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Database configuration from environment variables
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

// JWT configuration
const jwtSecret = process.env.JWT_SECRET;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// API routes would go here
// Example: app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Database config:', {
    host: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user,
  });
});
