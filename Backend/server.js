require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true },
});

// ==========================================
// 🌟 สร้างโครงสร้าง Database
// ==========================================
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, brand VARCHAR(100),
        price NUMERIC(10, 2) NOT NULL, image TEXT, stock INT DEFAULT 10,
        sku VARCHAR(100) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // [เพิ่มใหม่] ตารางคำสั่งซื้อ
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_email VARCHAR(255),
        items JSONB NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'รอชำระเงิน',
        order_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const adminCheck = await pool.query("SELECT * FROM users WHERE email = 'admin@kickzone.com'");
    if (adminCheck.rows.length === 0) {
      await pool.query("INSERT INTO users (name, email, password, role) VALUES ('System Admin', 'admin@kickzone.com', 'admin123', 'admin')");
    }
    console.log("💾 โครงสร้างตารางข้อมูลบน Neon Database พร้อมใช้งานแล้ว!");
  } catch (err) { console.error(err); }
};
initDatabase();

app.get('/api/test', async (req, res) => {
  const result = await pool.query('SELECT now()');
  res.json({ message: "Backend เชื่อมต่อสมบูรณ์!", time: result.rows[0].now });
});

// ==========================================
// 🌟 API: Products (สินค้า)
// ==========================================
app.get('/api/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  res.json(result.rows);
});
app.post('/api/products', async (req, res) => {
  const { name, brand, price, image } = req.body;
  const result = await pool.query('INSERT INTO products (name, brand, price, image) VALUES ($1, $2, $3, $4) RETURNING *', [name, brand, price, image]);
  res.json(result.rows[0]);
});
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params; const { name, brand, price, image } = req.body;
  const result = await pool.query('UPDATE products SET name = $1, brand = $2, price = $3, image = $4 WHERE id = $5 RETURNING *', [name, brand, price, image, id]);
  res.json(result.rows[0]);
});
app.delete('/api/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ message: "ลบสำเร็จ" });
});

// ==========================================
// 🌟 API: Users (บัญชีผู้ใช้)
// ==========================================
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (check.rows.length > 0) return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว!" });
  const result = await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING *", [name, email, password]);
  res.json(result.rows[0]);
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2', [email, password]);
  if (result.rows.length === 0) return res.status(401).json({ error: "อีเมล หรือ รหัสผ่านไม่ถูกต้อง!" });
  res.json(result.rows[0]);
});

// ==========================================
// 🌟 API: Orders (คำสั่งซื้อ) - [เพิ่มใหม่ล่าสุด]
// ==========================================
app.get('/api/orders', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(result.rows);
});
app.post('/api/orders', async (req, res) => {
  const { id, customer_email, items, total, status, order_date } = req.body;
  const result = await pool.query(
    'INSERT INTO orders (id, customer_email, items, total, status, order_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, customer_email, JSON.stringify(items), total, status, order_date]
  );
  res.json(result.rows[0]);
});
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend รันที่ http://localhost:${PORT}`));