import express from 'express';
import db from '../db.js';
import { authenticateUser, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate readable Order ID
function generateOrderId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

// 1. Place New Order (Customer)
router.post('/', authenticateUser, (req, res) => {
  const {
    items,
    delivery_address,
    delivery_slot,
    payment_method,
    coupon_code,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  if (!delivery_address || !delivery_address.trim()) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  // Transaction for order placement and stock decrement
  const createOrderTx = db.transaction(() => {
    // 1. Fetch user info
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) throw new Error('User not found');

    // 2. Validate items and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) {
        throw new Error(`Product #${item.product_id} no longer exists`);
      }
      if (product.is_active === 0) {
        throw new Error(`Product "${product.name}" is currently unavailable`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Only ${product.stock} units left for "${product.name}"`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        image: product.image,
        unit: product.unit,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // 3. Calculate coupon discount if provided
    let discount = 0;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code.toUpperCase().trim());
      if (coupon && subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'fixed') {
          discount = Math.min(coupon.discount_value, subtotal);
        } else if (coupon.discount_type === 'percent') {
          discount = Math.min(100, Math.round((subtotal * coupon.discount_value) / 100));
        }
      }
    }

    // Delivery fee logic: Free if subtotal >= 299, else 29
    const delivery_fee = subtotal >= 299 ? 0 : 29;
    const total_amount = Math.max(0, subtotal - discount + delivery_fee);

    const orderId = generateOrderId();
    const payment_status = payment_method === 'COD' ? 'Pending' : 'Paid';

    // 4. Insert Order
    db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone,
        delivery_address, delivery_slot, payment_method, payment_status,
        subtotal, discount, delivery_fee, total_amount, coupon_code,
        order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?)
    `).run(
      orderId,
      user.id,
      user.name,
      user.email,
      user.phone || req.body.customer_phone || '',
      delivery_address.trim(),
      delivery_slot || 'Express (30-45 mins)',
      payment_method || 'COD',
      payment_status,
      subtotal,
      discount,
      delivery_fee,
      total_amount,
      coupon_code || null,
      notes || null
    );

    // 5. Insert Order Items & decrement product stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_image, unit, price, quantity, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');

    for (const vItem of validatedItems) {
      insertItem.run(
        orderId,
        vItem.product_id,
        vItem.name,
        vItem.image,
        vItem.unit,
        vItem.price,
        vItem.quantity,
        vItem.total
      );
      updateStock.run(vItem.quantity, vItem.product_id);
    }

    return {
      orderId,
      subtotal,
      discount,
      delivery_fee,
      total_amount,
      payment_method: payment_method || 'COD',
      order_status: 'Placed',
      items: validatedItems
    };
  });

  try {
    const orderResult = createOrderTx();
    return res.status(201).json({
      order: orderResult,
      message: 'Order placed successfully!'
    });
  } catch (err) {
    console.error('Order creation failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to place order' });
  }
});

// 2. Get Customer's Orders
router.get('/my-orders', authenticateUser, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getItems.all(order.id)
    }));

    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    return res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// 3. Get Single Order Details (Customer or Admin)
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return res.json({ order: { ...order, items } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// 4. ADMIN: Get All Orders (With Filters, Search, Pagination)
router.get('/admin/all', authenticateAdmin, (req, res) => {
  try {
    const { status, date, search, page = 1, limit = 50 } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND order_status = ?';
      params.push(status);
    }

    if (date && date.trim() !== '') {
      query += ' AND date(created_at) = date(?)';
      params.push(date.trim());
    }

    if (search && search.trim() !== '') {
      query += ' AND (id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), Number(offset));

    const orders = db.prepare(query).all(...params);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getItems.all(order.id)
    }));

    return res.json({ orders: ordersWithItems, total: ordersWithItems.length });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 5. ADMIN: Update Order Status
router.patch('/admin/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `).run(status || null, payment_status || null, id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    return res.json({
      order: { ...updated, items },
      message: `Order status updated to "${updated.order_status}"`
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 6. ADMIN: Export Orders as CSV
router.get('/admin/export/csv', authenticateAdmin, (req, res) => {
  try {
    const { status, date } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND order_status = ?';
      params.push(status);
    }
    if (date && date.trim() !== '') {
      query += ' AND date(created_at) = date(?)';
      params.push(date.trim());
    }
    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    // Generate CSV Header
    const headers = [
      'Order ID',
      'Date & Time',
      'Customer Name',
      'Phone',
      'Email',
      'Delivery Address',
      'Delivery Slot',
      'Payment Mode',
      'Payment Status',
      'Subtotal (₹)',
      'Discount (₹)',
      'Delivery Fee (₹)',
      'Grand Total (₹)',
      'Order Status',
      'Items Ordered'
    ];

    const rows = orders.map(order => {
      const items = getItems.all(order.id);
      const itemsSummary = items.map(i => `${i.product_name} (${i.unit}) x${i.quantity}`).join('; ');

      return [
        `"${order.id}"`,
        `"${order.created_at}"`,
        `"${(order.customer_name || '').replace(/"/g, '""')}"`,
        `"${order.customer_phone}"`,
        `"${order.customer_email}"`,
        `"${(order.delivery_address || '').replace(/"/g, '""')}"`,
        `"${order.delivery_slot || ''}"`,
        `"${order.payment_method}"`,
        `"${order.payment_status}"`,
        order.subtotal,
        order.discount,
        order.delivery_fee,
        order.total_amount,
        `"${order.order_status}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=grocery-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
