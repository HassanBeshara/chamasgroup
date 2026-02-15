const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - allow Netlify (and other) frontends to call this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));
app.use(express.json({ limit: '50mb' })); // For base64 product images

// Database
const db = new Database(path.join(__dirname, 'data.db'));

// Init schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    name TEXT PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '📦',
    imageUrl TEXT,
    FOREIGN KEY (category) REFERENCES categories(name)
  );
`);

// Seed default categories if empty
const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get();
if (catCount.n === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  ['electronics', 'clothing', 'accessories', 'home'].forEach(c => insertCat.run(c));
}

// Seed default products if empty
const prodCount = db.prepare('SELECT COUNT(*) as n FROM products').get();
if (prodCount.n === 0) {
  const defaults = [
    [1, 'Wireless Headphones', 'electronics', 99.99, 'Premium wireless headphones with noise cancellation and 30-hour battery life.', '🎧', null],
    [2, 'Smart Watch', 'electronics', 249.99, 'Feature-rich smartwatch with fitness tracking and heart rate monitor.', '⌚', null],
    [3, 'Cotton T-Shirt', 'clothing', 29.99, 'Comfortable 100% cotton t-shirt available in multiple colors.', '👕', null],
    [4, 'Denim Jacket', 'clothing', 79.99, 'Classic denim jacket with modern fit and premium quality.', '🧥', null],
    [5, 'Leather Wallet', 'accessories', 49.99, 'Genuine leather wallet with RFID blocking technology.', '👛', null],
    [6, 'Sunglasses', 'accessories', 89.99, 'UV protection sunglasses with polarized lenses.', '🕶️', null],
    [7, 'Coffee Maker', 'home', 129.99, 'Programmable coffee maker with thermal carafe.', '☕', null],
    [8, 'Throw Pillow Set', 'home', 39.99, 'Set of 4 decorative throw pillows for your living room.', '🛋️', null],
    [9, 'Laptop Stand', 'electronics', 59.99, 'Ergonomic aluminum laptop stand for better posture.', '💻', null],
    [10, 'Running Shoes', 'clothing', 119.99, 'Lightweight running shoes with cushioned sole.', '👟', null],
    [11, 'Backpack', 'accessories', 69.99, 'Durable backpack with laptop compartment and USB charging port.', '🎒', null],
    [12, 'Desk Lamp', 'home', 44.99, 'LED desk lamp with adjustable brightness and color temperature.', '💡', null],
  ];
  const insertProd = db.prepare('INSERT INTO products (id, name, category, price, description, emoji, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)');
  defaults.forEach(row => insertProd.run(...row));
}

// --- API Routes ---

// Categories
app.get('/api/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT name FROM categories ORDER BY name').all();
    res.json(rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Category name required' });
    }
    const n = name.trim().toLowerCase();
    if (!n) return res.status(400).json({ error: 'Category name required' });
    db.prepare('INSERT INTO categories (name) VALUES (?)').run(n);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:name', (req, res) => {
  try {
    const { name } = req.params;
    const used = db.prepare('SELECT 1 FROM products WHERE category = ? LIMIT 1').get(name);
    if (used) {
      return res.status(400).json({ error: 'Remove or reassign products in this category first' });
    }
    const r = db.prepare('DELETE FROM categories WHERE name = ?').run(name);
    if (r.changes === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, category, price, description, emoji, imageUrl FROM products ORDER BY id').all();
    const products = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: r.price,
      description: r.description || '',
      emoji: r.emoji || '📦',
      imageUrl: r.imageUrl || null,
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, category, price, description, emoji, imageUrl } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category required' });
    }
    const stmt = db.prepare(`
      INSERT INTO products (name, category, price, description, emoji, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      String(name).trim(),
      String(category).trim().toLowerCase(),
      Number(price) || 0,
      String(description || '').trim(),
      String(emoji || '📦').trim(),
      imageUrl || null
    );
    res.json({ id: r.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const { name, category, price, description, emoji, imageUrl } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category required' });
    }
    const r = db.prepare(`
      UPDATE products SET name = ?, category = ?, price = ?, description = ?, emoji = ?, imageUrl = COALESCE(?, imageUrl)
      WHERE id = ?
    `).run(
      String(name).trim(),
      String(category).trim().toLowerCase(),
      Number(price) || 0,
      String(description || '').trim(),
      String(emoji || '📦').trim(),
      imageUrl || null,
      id
    );
    if (r.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const r = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (r.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (simple check - in production use proper auth)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Start
app.listen(PORT, () => {
  console.log(`Mhmd Chamas server running at http://localhost:${PORT}`);
});
