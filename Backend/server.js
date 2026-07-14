// ==========================================
// 1. นำเข้าไลบรารีที่จำเป็น
// ==========================================
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken'); // เพิ่ม JWT
require('dotenv').config(); // สำหรับดึงค่าจากไฟล์ .env

const app = express();

// ==========================================
// 2. ตั้งค่า Middleware พื้นฐาน
// ==========================================
app.use(cors());
app.use(express.json()); // ให้ Express อ่านข้อมูลแบบ JSON ได้

// ==========================================
// 3. ตั้งค่าการเชื่อมต่อฐานข้อมูล Neon (PostgreSQL)
// ==========================================
const pool = new Pool({
    // ดึงค่า DATABASE_URL จากไฟล์ .env (อย่าลืมสร้างไฟล์ .env และใส่ URL ของ Neon)
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// คีย์ลับสำหรับสร้าง JWT (ในงานจริงควรเอาไปซ่อนในไฟล์ .env)
const JWT_SECRET = 'KICKZONE_SECRET_KEY';

// ==========================================
// 4. Middleware: ยามเฝ้าประตูสำหรับตรวจ Token
// ==========================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // หาค่า Token ที่ส่งมาในรูปแบบ "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'ไม่พบ Token กรุณาเข้าสู่ระบบ' });
    }

    // ตรวจสอบ Token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token ไม่ถูกต้อง หรือหมดอายุแล้ว' });
        }
        
        // แนบข้อมูลผู้ใช้ (เช่น id, role) ไปกับ Request เพื่อให้ API ถัดไปใช้งาน
        req.user = user; 
        next();
    });
};

// ==========================================
// 5. API Routes (เส้นทางของระบบ)
// ==========================================

// 🟢 API: ล็อกอิน (Login) - สร้างและแจก Token
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // ค้นหาผู้ใช้จากฐานข้อมูล
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        const user = result.rows[0];

        // ตรวจสอบรหัสผ่าน (ถ้ามีการใช้ bcrypt เข้ารหัสผ่าน ต้องใช้ bcrypt.compare ที่นี่)
        if (password !== user.password) {
            return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // เมื่อรหัสผ่านถูกต้อง -> สร้าง Payload ข้อมูล
        const payload = {
            id: user.id,
            role: user.role, // 'admin' หรือ 'customer'
            email: user.email
        };

        // สร้าง Token (กำหนดหมดอายุใน 1 วัน)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        // ส่ง Token กลับไปให้ Frontend
        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token: token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
});

// 🟢 API: ดึงข้อมูลสินค้าทั้งหมด (ทุกคนดูได้ ไม่ต้องใช้ Token)
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
    }
});

// 🔴 API: เพิ่มสินค้าใหม่ (ต้องล็อกอิน และต้องเป็น Admin เท่านั้น)
// สังเกตว่าเราใส่ authenticateToken คั่นกลางไว้
app.post('/api/products', authenticateToken, async (req, res) => {
    // เช็คสิทธิ์ว่าเป็น Admin หรือไม่ จากข้อมูลที่ยาม (Middleware) ถอดรหัสมาให้
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'ปฏิเสธการเข้าถึง! เฉพาะผู้ดูแลระบบเท่านั้น' });
    }

    const { name, brand, price, image } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO products (name, brand, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, brand, price, image]
        );
        res.status(201).json({ message: 'เพิ่มสินค้าเรียบร้อย', product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
    }
});

// ==========================================
// 6. เปิดการทำงาน Server
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});