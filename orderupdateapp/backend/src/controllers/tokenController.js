/**
 * controllers/tokenController.js
 * Handles device push token registration and retrieval.
 * Tokens are stored in the SQLite `tokens` table.
 */

const db = require('../db/database');
const { Expo } = require('../services/pushService');

/**
 * POST /tokens
 * Register or update a device's Expo push token.
 * Called automatically by the app on startup.
 */
function registerToken(req, res) {
  const { deviceId, token, userId } = req.body;

  if (!deviceId || !token) {
    return res.status(400).json({ error: 'deviceId and token are required' });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Invalid Expo push token format' });
  }

  // Upsert: insert or replace if deviceId already exists
  const stmt = db.prepare(`
    INSERT INTO tokens (device_id, token, user_id, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(device_id) DO UPDATE SET
      token      = excluded.token,
      user_id    = excluded.user_id,
      created_at = datetime('now')
  `);

  stmt.run(deviceId, token, userId || deviceId);

  console.log(`[Token] Registered device: ${deviceId}`);
  res.json({ success: true, deviceId });
}

/**
 * GET /tokens  (admin only)
 * Returns all registered device tokens.
 */
function listTokens(req, res) {
  const rows = db.prepare('SELECT * FROM tokens ORDER BY created_at DESC').all();
  res.json({ count: rows.length, tokens: rows });
}

module.exports = { registerToken, listTokens };
