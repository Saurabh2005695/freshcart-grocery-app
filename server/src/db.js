import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'grocery.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      address TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      icon TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      mrp REAL NOT NULL,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 25,
      is_active INTEGER DEFAULT 1,
      description TEXT,
      rating REAL DEFAULT 4.6,
      rating_count INTEGER DEFAULT 84,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      discount_type TEXT NOT NULL, -- 'fixed' or 'percent'
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      description TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_slot TEXT DEFAULT 'Express (30-45 mins)',
      payment_method TEXT NOT NULL, -- 'COD', 'UPI', 'CARD'
      payment_status TEXT DEFAULT 'Pending',
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      delivery_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      coupon_code TEXT,
      order_status TEXT DEFAULT 'Placed', -- 'Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      unit TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );
  `);
}

export default db;
