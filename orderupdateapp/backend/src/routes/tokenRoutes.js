/**
 * routes/tokenRoutes.js
 * Routes for device push token registration.
 */

const express = require('express');
const { registerToken, listTokens } = require('../controllers/tokenController');
const { requireApiKey } = require('../middleware/auth');

const router = express.Router();

// Public: app registers its push token on startup
router.post('/', registerToken);

// Admin: view all registered tokens
router.get('/', requireApiKey, listTokens);

module.exports = router;
