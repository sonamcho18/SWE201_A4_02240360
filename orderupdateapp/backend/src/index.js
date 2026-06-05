/**
 * src/index.js
 * Entry point for the OrderUpdateApp backend.
 * Sets up Express, mounts all routes, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// Initialise the database (creates file + tables if they don't exist)
require('./db/database');

// Route modules
const tokenRoutes  = require('./routes/tokenRoutes');
const orderRoutes  = require('./routes/orderRoutes');
const notifyRoutes = require('./routes/notifyRoutes');

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'OrderUpdateApp', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/tokens', tokenRoutes);
app.use('/orders', orderRoutes);
app.use('/notify', notifyRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[Server] OrderUpdateApp backend running on http://localhost:${PORT}`);
  console.log(`[Server] Admin routes require x-api-key header`);
});
