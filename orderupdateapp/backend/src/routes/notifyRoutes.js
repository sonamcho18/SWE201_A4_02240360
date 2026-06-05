/**
 * routes/notifyRoutes.js
 * Admin-only routes for triggering push notifications manually.
 */

const express = require('express');
const { broadcast, notifyDevice } = require('../controllers/notifyController');
const { requireApiKey } = require('../middleware/auth');

const router = express.Router();

// Both routes are admin-only
router.post('/broadcast', requireApiKey, broadcast);
router.post('/device',    requireApiKey, notifyDevice);

module.exports = router;
