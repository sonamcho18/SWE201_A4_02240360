const router = require('express').Router();
const { registerToken, listTokens } = require('../controllers/tokenController');
router.post('/register-token', registerToken);
router.get('/tokens', listTokens);
module.exports = router;
