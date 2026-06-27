import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './db/connection.js';

// Import route handlers
import dashboardRouter from './routes/dashboard.js';
import customersRouter from './routes/customers.js';
import wheatEntriesRouter from './routes/wheatEntries.js';
import attaIssuesRouter from './routes/attaIssues.js';
import expensesRouter from './routes/expenses.js';
import reportsRouter from './routes/reports.js';

// Resolve __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Setup API routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customersRouter);
app.use('/api/wheat-entries', wheatEntriesRouter);
app.use('/api/atta-issues', attaIssuesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/reports', reportsRouter);

// Serve compiled static assets from React client in production
const frontendBuildPath = path.join(__dirname, '../dist');
app.use(express.static(frontendBuildPath));

// Fallback non-API GET requests to the React app (Single Page App routing).
// Express 5 no longer accepts a bare '*' route, so use a middleware instead.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message || err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize the cloud database, then start the listener
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Chaki Munshi Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err.message || err);
    process.exit(1);
  });
