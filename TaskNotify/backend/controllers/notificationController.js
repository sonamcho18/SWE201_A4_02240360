const axios = require('axios');
const PushToken = require('../models/PushToken');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

exports.sendNotification = async (req, res) => {
  const { title, body, data, expoPushToken, broadcast } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

  try {
    let tokens = [];
    if (broadcast) {
      const records = await PushToken.find();
      tokens = records.map((r) => r.expoPushToken);
    } else if (expoPushToken) {
      tokens = [expoPushToken];
    } else {
      return res.status(400).json({ error: 'Provide expoPushToken or broadcast: true' });
    }

    if (!tokens.length) return res.status(404).json({ error: 'No registered tokens' });

    const messages = tokens.map((to) => ({
      to, title, body,
      data: data || {},
      sound: 'default',
      priority: 'high',
      channelId: 'task-reminders',
    }));

    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    return res.json({ message: `Sent to ${tokens.length} device(s)`, results: response.data.data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send', detail: err.message });
  }
};
