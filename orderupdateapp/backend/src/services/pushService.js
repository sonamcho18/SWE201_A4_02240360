/**
 * services/pushService.js
 * Handles all outgoing push notifications via the Expo Push API.
 * Isolated here so controllers stay clean and push logic is reusable.
 */

const { Expo } = require('expo-server-sdk');

const expo = new Expo();

/**
 * Send a push notification to one or more Expo push tokens.
 *
 * @param {Array<{ to: string, title: string, body: string, data?: object }>} messages
 * @returns {Promise<Array>} Array of push tickets from Expo
 */
async function sendPushNotifications(messages) {
  // Filter out any invalid tokens before sending
  const validMessages = messages.filter((m) => Expo.isExpoPushToken(m.to));

  if (validMessages.length === 0) {
    console.warn('[Push] No valid Expo push tokens in message list');
    return [];
  }

  // Expo requires messages to be chunked (max 100 per request)
  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      console.log(`[Push] Sent chunk of ${chunk.length} notification(s)`);
    } catch (err) {
      console.error('[Push] Error sending chunk:', err.message);
    }
  }

  return tickets;
}

/**
 * Build a standardised notification message object.
 *
 * @param {string} token     - Expo push token
 * @param {string} title     - Notification title
 * @param {string} body      - Notification body text
 * @param {object} data      - Extra data payload (used for deep-link navigation)
 * @returns {object}
 */
function buildMessage(token, title, body, data = {}) {
  return {
    to:        token,
    sound:     'default',
    title,
    body,
    data,
    channelId: 'order-updates',   // must match the Android channel set in the app
    priority:  'high',
  };
}

module.exports = { sendPushNotifications, buildMessage, Expo };
