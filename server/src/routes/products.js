import express from 'express';
import db from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC').all();
    return res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get products (with filters, search, sorting, and pagination)
router.get('/', (req, res) => {
  try {
    const { category, search, sort, includeInactive } = req.query;

    let query = 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (!includeInactive) {
      query += ' AND p.is_active = 1';
    }

    if (category && category !== 'all') {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'discount') {
      query += ' ORDER BY ((p.mrp - p.price) / p.mrp) DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY p.rating DESC, p.rating_count DESC';
    } else {
      query += ' ORDER BY p.id ASC';
    }

    const products = db.prepare(query).all(...params);
    return res.json({ products, total: products.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ADMIN: Add new product
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, category_id, unit, price, mrp, image, stock, description } = req.body;

    if (!name || !category_id || !unit || price == null || mrp == null) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const defaultImg = image && image.trim() !== '' 
      ? image 
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

    const result = db.prepare(`
      INSERT INTO products (name, category_id, unit, price, mrp, image, stock, is_active, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      name.trim(),
      category_id,
      unit.trim(),
      Number(price),
      Number(mrp),
      defaultImg,
      Number(stock || 20),
      description ? description.trim() : ''
    );

    const newProduct = db.prepare('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ product: newProduct, message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// ADMIN: Update product
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { name, category_id, unit, price, mrp, image, stock, is_active, description } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        mrp = COALESCE(?, mrp),
        image = COALESCE(?, image),
        stock = COALESCE(?, stock),
        is_active = COALESCE(?, is_active),
        description = COALESCE(?, description)
      WHERE id = ?
    `).run(
      name != null ? name.trim() : null,
      category_id != null ? category_id : null,
      unit != null ? unit.trim() : null,
      price != null ? Number(price) : null,
      mrp != null ? Number(mrp) : null,
      image != null ? image : null,
      stock != null ? Number(stock) : null,
      is_active != null ? Number(is_active) : null,
      description != null ? description.trim() : null,
      id
    );

    const updated = db.prepare('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id);
    return res.json({ product: updated, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// ADMIN: Toggle Stock / Active Status
router.patch('/:id/toggle-status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT is_active FROM products WHERE id = ?').get(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newStatus = product.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE products SET is_active = ? WHERE id = ?').run(newStatus, id);

    return res.json({ id: Number(id), is_active: newStatus, message: `Product ${newStatus === 1 ? 'activated' : 'marked out of stock'}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update product status' });
  }
});

// ADMIN: Delete product
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.json({ message: 'Product deleted successfully', id: Number(id) });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
