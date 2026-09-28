import express from 'express';
import db from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// ADMIN Analytics Overview
router.get('/overview', authenticateAdmin, (req, res) => {
  try {
    // 1. Today's stats
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(CASE WHEN order_status != 'Cancelled' THEN total_amount ELSE 0 END), 0) as today_revenue
      FROM orders
      WHERE date(created_at) = date('now', 'localtime')
    `).get();

    // 2. All-time stats
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN order_status != 'Cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN order_status != 'Cancelled' THEN total_amount ELSE NULL END), 0) as avg_order_value
      FROM orders
    `).get();

    // 3. Low stock count and products (< 5 items)
    const lowStockProducts = db.prepare(`
      SELECT id, name, category_id, stock, price, image, unit
      FROM products
      WHERE is_active = 1 AND stock <= 5
      ORDER BY stock ASC
    `).all();

    // 4. Order status distribution
    const statusCounts = db.prepare(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `).all();

    const statusMap = {
      Placed: 0,
      Packed: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0
    };
    statusCounts.forEach(s => {
      statusMap[s.order_status] = s.count;
    });

    // 5. Best-selling products (top 5)
    const topProducts = db.prepare(`
      SELECT 
        product_id, 
        product_name, 
        product_image, 
        unit, 
        SUM(quantity) as total_sold, 
        SUM(total) as total_revenue
      FROM order_items
      GROUP BY product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    // 6. Last 7 days revenue and order trend
    const sevenDayTrend = db.prepare(`
      WITH RECURSIVE dates(date_val) AS (
        SELECT date('now', '-6 days', 'localtime')
        UNION ALL
        SELECT date(date_val, '+1 day')
        FROM dates
        WHERE date_val < date('now', 'localtime')
      )
      SELECT 
        dates.date_val as date,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.order_status != 'Cancelled' THEN o.total_amount ELSE 0 END), 0) as revenue
      FROM dates
      LEFT JOIN orders o ON date(o.created_at) = dates.date_val
      GROUP BY dates.date_val
      ORDER BY dates.date_val ASC
    `).all();

    return res.json({
      today_orders: todayStats.today_orders || 0,
      today_revenue: Math.round(todayStats.today_revenue || 0),
      total_orders: overallStats.total_orders || 0,
      total_revenue: Math.round(overallStats.total_revenue || 0),
      avg_order_value: Math.round(overallStats.avg_order_value || 0),
      low_stock_count: lowStockProducts.length,
      low_stock_products: lowStockProducts,
      status_breakdown: statusMap,
      top_products: topProducts,
      seven_day_trend: sevenDayTrend
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;
