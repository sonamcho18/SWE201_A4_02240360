const router = require('express').Router();
const auth = require('../middleware/auth');
const { sendNotification } = require('../controllers/notificationController');
router.post('/send-notification', auth, sendNotification);
module.exports = router;
