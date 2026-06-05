/**
 * controllers/orderController.js
 * Handles order creation, retrieval, and status updates.
 * Status updates trigger a push notification to the device that placed the order.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { sendPushNotifications, buildMessage } = require('../services/pushService');

// Human-readable notification text for each order status
const STATUS_MESSAGES = {
  placed:           (item) => ({ title: 'Order Placed',      body: `We received your order for "${item}".` }),
  confirmed:        (item) => ({ title: 'Order Confirmed',   body: `Your order for "${item}" has been confirmed!` }),
  preparing:        (item) => ({ title: 'Being Prepared',    body: `"${item}" is being prepared by the restaurant.` }),
  out_for_delivery: (item) => ({ title: 'Out for Delivery',  body: 'Your order is on the way! ETA ~20 minutes.' }),
  delivered:        (item) => ({ title: 'Delivered!',        body: `Your order "${item}" has been delivered. Enjoy!` }),
};

const VALID_STATUSES = Object.keys(STATUS_MESSAGES);

/**
 * POST /orders
 * Create a new order with status 'placed'.
 */
function createOrder(req, res) {
  const { customerName, item, deviceId } = req.body;

  if (!customerName || !item || !deviceId) {
    return res.status(400).json({ error: 'customerName, item, and deviceId are required' });
  }

  const id    = uuidv4();
  const order = { id, customerName, item, status: 'placed', deviceId };

  db.prepare(`
    INSERT INTO orders (id, customer_name, item, status, device_id, created_at)
    VALUES (?, ?, ?, 'placed', ?, datetime('now'))
  `).run(id, customerName, item, deviceId);

  console.log(`[Order] Created: ${id} for device ${deviceId}`);
  res.status(201).json({ success: true, order: toPublic(fetchRow(id)) });
}

/**
 * GET /orders
 * Return all orders, newest first.
 */
function listOrders(req, res) {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json({ count: rows.length, orders: rows.map(toPublic) });
}

/**
 * GET /orders/:orderId
 * Return a single order by ID.
 */
function getOrder(req, res) {
  const row = fetchRow(req.params.orderId);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: toPublic(row) });
}

/**
 * PATCH /orders/:orderId/status  (admin only)
 * Update the order status and send a push notification to the device.
 */
async function updateOrderStatus(req, res) {
  const { orderId } = req.params;
  const { status }  = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const row = fetchRow(orderId);
  if (!row) return res.status(404).json({ error: 'Order not found' });

  // Update status in database
  db.prepare(`
    UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, orderId);

  // Fetch the device's push token
  const tokenRow = db.prepare('SELECT token FROM tokens WHERE device_id = ?').get(row.device_id);

  let pushResult = { warning: 'No push token registered for this device' };

  if (tokenRow) {
    const { title, body } = STATUS_MESSAGES[status](row.item);
    const message = buildMessage(tokenRow.token, title, body, {
      orderId,
      status,
      screen: 'OrderDetail',  // tells the app where to navigate on tap
    });

    const tickets = await sendPushNotifications([message]);
    pushResult = tickets;
    console.log(`[Order] Status → ${status}, push sent to device ${row.device_id}`);
  }

  res.json({ success: true, order: toPublic(fetchRow(orderId)), pushResult });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch a single order row from SQLite */
function fetchRow(id) {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
}

/** Convert snake_case DB row to camelCase for the API response */
function toPublic(row) {
  if (!row) return null;
  return {
    id:           row.id,
    customerName: row.customer_name,
    item:         row.item,
    status:       row.status,
    deviceId:     row.device_id,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at || null,
  };
}

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };
