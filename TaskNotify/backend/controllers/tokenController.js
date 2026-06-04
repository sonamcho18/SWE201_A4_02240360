const PushToken = require('../models/PushToken');

exports.registerToken = async (req, res) => {
  const { deviceId, expoPushToken } = req.body;
  if (!deviceId || !expoPushToken)
    return res.status(400).json({ error: 'deviceId and expoPushToken are required' });
  try {
    const token = await PushToken.findOneAndUpdate(
      { expoPushToken },
      { deviceId, expoPushToken, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ message: 'Token registered', token });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.listTokens = async (req, res) => {
  try {
    const tokens = await PushToken.find().sort({ createdAt: -1 });
    return res.json({ count: tokens.length, tokens });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
