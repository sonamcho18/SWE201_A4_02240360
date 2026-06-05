/**
 * controllers/notifyController.js
 * Admin-triggered push notifications:
 *   - broadcast to all registered devices
 *   - targeted push to a single device
 */

const db = require('../db/database');
const { sendPushNotifications, buildMessage, Expo } = require('../services/pushService');

/**
 * POST /notify/broadcast  (admin only)
 * Send a push notification to every registered device.
 * Body: { title, body, data? }
 */
async function broadcast(req, res) {
  const { title, body, data } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  // Fetch all valid tokens from the database
  const rows      = db.prepare('SELECT token FROM tokens').all();
  const allTokens = rows.map((r) => r.token).filter(Expo.isExpoPushToken);

  if (allTokens.length === 0) {
    return res.json({ success: false, message: 'No registered devices to notify' });
  }

  const messages = allTokens.map((token) =>
    buildMessage(token, title, body, data || {}),
  );

  const tickets = await sendPushNotifications(messages);
  console.log(`[Notify] Broadcast sent to ${allTokens.length} device(s)`);
  res.json({ success: true, sent: allTokens.length, tickets });
}

/**
 * POST /notify/device  (admin only)
 * Send a push notification to a single device.
 * Body: { deviceId, title, body, data? }
 */
async function notifyDevice(req, res) {
  const { deviceId, title, body, data } = req.body;

  if (!deviceId || !title || !body) {
    return res.status(400).json({ error: 'deviceId, title, and body are required' });
  }

  const row = db.prepare('SELECT token FROM tokens WHERE device_id = ?').get(deviceId);

  if (!row || !Expo.isExpoPushToken(row.token)) {
    return res.status(404).json({ error: 'No valid token found for this deviceId' });
  }

  const message = buildMessage(row.token, title, body, data || {});
  const tickets = await sendPushNotifications([message]);

  console.log(`[Notify] Single push sent to device ${deviceId}`);
  res.json({ success: true, tickets });
}

module.exports = { broadcast, notifyDevice };
