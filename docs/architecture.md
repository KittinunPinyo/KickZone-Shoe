## 1. System Architecture (สถาปัตยกรรมระบบ)

โครงสร้างการทำงานของโปรเจกต์ KICKZONE พัฒนาในรูปแบบ Full-Stack Web Application โดยแยกส่วน Frontend และ Backend ออกจากกันอย่างชัดเจน ดังแผนภาพด้านล่าง:

```mermaid
graph TD
    subgraph Client-Side
        A[Frontend: React.js + Vite]
    end

    subgraph Server-Side
        B(Backend: Node.js + Express.js)
    end

    subgraph Cloud-Database
        C[(PostgreSQL on Neon)]
    end

    %% Connections
    A -- "HTTP Requests (GET, POST, PUT, DELETE)" --> B
    B -- "JSON Responses" --> A
    
    B -- "SQL Queries" --> C
    C -- "Data Results" --> B

    %% Styling
    style A fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    style B fill:#339933,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#336791,stroke:#333,stroke-width:2px,color:#fff

### 2. คำอธิบายแต่ละชั้น (Layer)

| ชั้น (Layer) | เทคโนโลยี (Technology) | หน้าที่ (Function) |
| :--- | :--- | :--- |
| **Client (Frontend)** | React + Vite, React Router, Bootstrap | หน้าเว็บ (UI) แบบ Responsive สำหรับแสดงผล เลือกซื้อรองเท้า และหน้าจัดการของ Admin |
| **Server / API (Backend)** | Node.js, Express.js | สร้าง RESTful API เป็นตัวกลางรับ-ส่งข้อมูล และประมวลผลตรรกะของระบบ (Business Logic) |
| **Database** | PostgreSQL (Neon Database) | จัดเก็บข้อมูลสำคัญทั้งหมด เช่น ข้อมูลผู้ใช้, รายการสินค้ารองเท้า, และประวัติคำสั่งซื้อแบบเรียลไทม์ |
| **Authentication** | Custom Auth (Node.js + DB) | ระบบจัดการการสมัครสมาชิก ตรวจสอบอีเมล/รหัสผ่าน และแยกสิทธิ์ผู้ใช้ (Customer / Admin) |
| **Storage / State** | LocalStorage, Image URLs | จัดเก็บข้อมูลตะกร้าสินค้าชั่วคราว (Cart) และใช้ URL สำหรับดึงรูปภาพรองเท้ามาแสดงผล |

### 3. เหตุผลในการเลือกใช้สถาปัตยกรรมนี้

| ปัจจัย | เหตุผล |
| :--- | :--- |
| **Separation of Concerns** | แยกส่วน Frontend (React) และ Backend (Node.js) ออกจากกันอย่างชัดเจน ทำให้สามารถพัฒนาและแก้ไขโค้ดควบคู่กันไปได้โดยไม่กระทบกัน |
| **Scalability** | โครงสร้างแบบ RESTful API รองรับการขยายตัวในอนาคต และการเลือกใช้ Cloud Database (Neon) ช่วยให้รองรับปริมาณข้อมูลที่เพิ่มขึ้นได้ง่าย |
| **Maintainability** | การแยกโครงสร้างชัดเจนและการเขียนคำสั่ง SQL ที่เข้าใจง่าย ช่วยให้สามารถตรวจสอบ แก้ไข หรือบำรุงรักษาระบบ (Maintain) ได้สะดวกและลดข้อผิดพลาด |
| **Team Collaboration** | การใช้ Git และ GitHub เป็น Version Control กลาง ทำให้สมาชิกในทีมสามารถติดตามการเปลี่ยนแปลง และร่วมมือกันพัฒนาโปรเจกต์ได้อย่างมีประสิทธิภาพ |