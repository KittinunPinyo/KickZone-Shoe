## Analysis & Design (การวิเคราะห์และออกแบบระบบ)

### Database Design (การออกแบบฐานข้อมูล)
ระบบ KICKZONE ใช้ฐานข้อมูลเชิงสัมพันธ์ (Relational Database) ผ่าน PostgreSQL (Neon Database) โดยมีโครงสร้างตารางหลักดังนี้:

**Table: `users` (ตารางข้อมูลผู้ใช้งาน)**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | รหัสประจำตัวผู้ใช้งาน |
| `name` | VARCHAR(255) | NOT NULL | ชื่อ-นามสกุล |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | อีเมล (ใช้สำหรับเข้าสู่ระบบ) |
| `password` | VARCHAR(255) | NOT NULL | รหัสผ่าน |
| `role` | VARCHAR(50) | DEFAULT 'customer' | สิทธิ์การใช้งาน (customer / admin) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่สมัครสมาชิก |

**Table: `products` (ตารางข้อมูลสินค้า)**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | รหัสสินค้า |
| `name` | VARCHAR(255) | NOT NULL | ชื่อสินค้า |
| `brand` | VARCHAR(100) | - | ชื่อแบรนด์ |
| `price` | NUMERIC(10, 2) | NOT NULL | ราคาสินค้า |
| `image` | TEXT | - | ลิงก์รูปภาพสินค้า |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | วันที่เพิ่มสินค้า |

**Table: `orders` (ตารางคำสั่งซื้อ)**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | เลขที่ออเดอร์ (เช่น KZ-123456) |
| `customer_email` | VARCHAR(255) | - | อีเมลลูกค้าที่สั่งซื้อ |
| `items` | JSONB | NOT NULL | รายละเอียดสินค้าในตะกร้า |
| `total` | NUMERIC(10, 2) | NOT NULL | ยอดรวมสุทธิ |
| `status` | VARCHAR(50) | DEFAULT 'รอชำระเงิน' | สถานะการจัดส่ง |

