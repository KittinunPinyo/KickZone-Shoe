import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ใช้ useNavigate สำหรับเปลี่ยนหน้าหลังล็อกอินสำเร็จ
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. ส่งข้อมูลไปที่ Backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. ล็อกอินสำเร็จ: เก็บ Token และข้อมูล User ลง localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('เข้าสู่ระบบสำเร็จ!');
        
        // 3. เปลี่ยนหน้าไปที่หน้าแรก (Home)
        navigate('/');
        // รีเฟรชหน้าต่าง 1 ครั้งเพื่อให้ Navbar อัปเดตสถานะ (ถ้าจำเป็น)
        window.location.reload(); 
      } else {
        // ล็อกอินไม่ผ่าน (รหัสผิด / ไม่มีอีเมล)
        alert(`เข้าสู่ระบบไม่สำเร็จ: ${data.error}`);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '90vh' }}>
      <div className="container py-4">
        <div className="row align-items-center justify-content-center g-5">
          
          {/* Section ฝั่งซ้าย: โฆษณาและจุดเด่น (ซ่อนในมือถือ โชว์เฉพาะจอคอม) */}
          <div className="col-lg-6 d-none d-lg-block pe-5">
            <h1 className="fw-bold mb-3" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>KICKZONE</h1>
            <div className="d-inline-block px-3 py-2 rounded-3 mb-3 fw-bold" style={{ backgroundColor: '#e2ff66', color: '#000' }}>
              ช้อปกับ KICKZONE ง่ายๆ ใน 5 ขั้นตอน
            </div>
            <p className="text-muted mb-5 fs-5">
              ซื้อสินค้าพรีเมียมของแท้ได้อย่างมั่นใจ<br/>เพราะเราตรวจสอบของทุกชิ้นก่อนส่งถึงคุณ
            </p>
            
            {/* จำลองกราฟิก 5 ขั้นตอนแบบในรูป */}
            <div className="d-flex gap-2 text-center mt-4">
              {[
                { icon: "🏷️", text: "เลือกสินค้า" },
                { icon: "⏳", text: "ผู้ขายยืนยัน" },
                { icon: "🔎", text: "ตรวจสอบ" },
                { icon: "✅", text: "ผ่านการตรวจ" },
                { icon: "📦", text: "รับของเลย!" }
              ].map((step, idx) => (
                <div key={idx} className="bg-white p-3 rounded-3 shadow-sm border flex-fill" style={{ fontSize: '12px' }}>
                  <div className="fs-3 mb-2">{step.icon}</div>
                  <div className="fw-bold text-dark">{step.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section ฝั่งขวา: ฟอร์มเข้าสู่ระบบ */}
          <div className="col-lg-5 col-md-8">
            <div className="card border-0 shadow-sm rounded-4 p-5">
              
              <div className="text-center mb-4">
                <div className="bg-dark text-white d-inline-block p-2 rounded-2 fw-bold fs-4 mb-3" style={{ width: '60px', height: '60px', lineHeight: '45px' }}>
                  KZ
                </div>
                <h4 className="fw-bold">เข้าสู่ระบบ KICKZONE</h4>
              </div>
              
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">อีเมล</label>
                  <input type="email" className="form-control form-control-lg rounded-2 bg-white" required value={email} onChange={e => setEmail(e.target.value)} placeholder="อีเมล" style={{ fontSize: '14px' }} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold mb-1">รหัสผ่าน</label>
                  <input type="password" className="form-control form-control-lg rounded-2 bg-white" required value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน" style={{ fontSize: '14px' }} />
                </div>
                <button type="submit" className="btn btn-dark btn-lg w-100 mb-3 rounded-2 fw-bold" style={{ fontSize: '15px' }}>
                  เข้าสู่ระบบด้วยอีเมล
                </button>
              </form>

              <div className="text-end mb-4">
                <a href="#" className="text-muted small text-decoration-none">ลืมรหัสผ่าน?</a>
              </div>

              {/* เส้นคั่น "หรือ" */}
              <div className="d-flex align-items-center mb-4">
                <hr className="flex-grow-1 text-muted" />
                <span className="mx-3 text-muted small">หรือ</span>
                <hr className="flex-grow-1 text-muted" />
              </div>

              {/* ปุ่ม Social Login (แบบหลอกๆ ตามรูป) */}
              <div className="d-flex gap-2 mb-4">
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold" style={{color: '#1877F2'}}>f</button>
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold" style={{color: '#DB4437'}}>G</button>
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold text-dark"></button>
              </div>

              <div className="text-center mt-2 small">
                <span className="text-muted">ยังไม่มีบัญชี? </span>
                <Link to="/register" className="text-dark fw-bold text-decoration-underline">สมัครสมาชิก</Link>
              </div>

            </div>

            {/* แจ้งเตือนไอดีทดสอบ */}
            <div className="text-center mt-3 text-muted" style={{ fontSize: '11px' }}>
              ทดสอบระบบ Admin: admin@kickzone.com / Pass: admin123
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}