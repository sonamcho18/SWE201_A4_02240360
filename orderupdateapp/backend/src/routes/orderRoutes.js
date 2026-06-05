/**
 * routes/orderRoutes.js
 * Routes for order management.
 */

const express = require('express');
const {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { requireApiKey } = require('../middleware/auth');

const router = express.Router();

// Public: app creates and reads orders
router.post('/',                 createOrder);
router.get('/',                  listOrders);
router.get('/:orderId',          getOrder);

// Admin: update status + trigger push notification
router.patch('/:orderId/status', requireApiKey, updateOrderStatus);

module.exports = router;
