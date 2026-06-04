const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  expoPushToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PushToken', pushTokenSchema);
