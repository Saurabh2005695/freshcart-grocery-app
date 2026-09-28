import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Customer Register
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, phone, password, address, role)
      VALUES (?, ?, ?, ?, ?, 'customer')
    `).run(name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : '', hashedPassword, address ? address.trim() : '');

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      role: 'customer'
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ user, token, message: 'Account created successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Customer Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ? AND role = 'customer'").get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: userPayload, token, message: 'Logged in successfully' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Admin Login (Separate Endpoint)
router.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const admin = db.prepare("SELECT * FROM users WHERE email = ? AND role = 'admin'").get(email.toLowerCase().trim());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isValid = bcrypt.compareSync(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const adminPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    };

    const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ admin: adminPayload, token, message: 'Admin authenticated successfully' });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error during admin authentication' });
  }
});

// Get Current User Profile / Update Address
router.get('/me', authenticateUser, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
});

router.put('/me', authenticateUser, (req, res) => {
  try {
    const { name, phone, address } = req.body;
    db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?')
      .run(name, phone, address, req.user.id);

    const updated = db.prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?').get(req.user.id);
    return res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

export default router;
