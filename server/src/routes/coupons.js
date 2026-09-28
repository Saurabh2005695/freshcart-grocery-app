import express from 'express';
import db from '../db.js';

const router = express.Router();

// Validate Coupon
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase().trim());
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }

    const amount = Number(subtotal || 0);
    if (amount < coupon.min_order_amount) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.min_order_amount} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'fixed') {
      discount = Math.min(coupon.discount_value, amount);
    } else if (coupon.discount_type === 'percent') {
      discount = Math.round((amount * coupon.discount_value) / 100);
      if (discount > 100) discount = 100; // max cap
    }

    return res.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discount,
      description: coupon.description,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discount}`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Get available active coupons
router.get('/', (req, res) => {
  try {
    const coupons = db.prepare('SELECT code, discount_type, discount_value, min_order_amount, description FROM coupons WHERE is_active = 1').all();
    return res.json({ coupons });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

export default router;
