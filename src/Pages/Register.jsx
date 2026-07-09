import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        navigate('/login');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };
  return (
    <div className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '90vh' }}>
      <div className="container py-4">
        <div className="row align-items-center justify-content-center g-5">
          
          {/* Section ฝั่งซ้าย: โฆษณาและจุดเด่น */}
          <div className="col-lg-6 d-none d-lg-block pe-5">
            <h1 className="fw-bold mb-3" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>KICKZONE</h1>
            <div className="d-inline-block px-3 py-2 rounded-3 mb-3 fw-bold" style={{ backgroundColor: '#e2ff66', color: '#000' }}>
              เริ่มต้นช้อปปิ้งกับเรา
            </div>
            <p className="text-muted mb-5 fs-5">
              สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษ<br/>และติดตามสถานะการสั่งซื้อของคุณได้ตลอด 24 ชม.
            </p>
          </div>

          {/* Section ฝั่งขวา: ฟอร์มสมัครสมาชิก */}
          <div className="col-lg-5 col-md-8">
            <div className="card border-0 shadow-sm rounded-4 p-5">
              
              <div className="text-center mb-4">
                <div className="bg-dark text-white d-inline-block p-2 rounded-2 fw-bold fs-4 mb-3" style={{ width: '60px', height: '60px', lineHeight: '45px' }}>
                  KZ
                </div>
                <h4 className="fw-bold">สมัครสมาชิก KICKZONE</h4>
              </div>
              
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">ชื่อ - นามสกุล</label>
                  <input type="text" className="form-control form-control-lg rounded-2 bg-white" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ชื่อ-นามสกุล" style={{ fontSize: '14px' }} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">อีเมล</label>
                  <input type="email" className="form-control form-control-lg rounded-2 bg-white" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="อีเมล" style={{ fontSize: '14px' }} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold mb-1">รหัสผ่าน</label>
                  <input type="password" className="form-control form-control-lg rounded-2 bg-white" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)" style={{ fontSize: '14px' }} />
                </div>
                <button type="submit" className="btn btn-dark btn-lg w-100 mb-3 rounded-2 fw-bold" style={{ fontSize: '15px' }}>
                  สร้างบัญชีใหม่ด้วยอีเมล
                </button>
              </form>

              {/* เส้นคั่น "หรือ" */}
              <div className="d-flex align-items-center mb-4 mt-3">
                <hr className="flex-grow-1 text-muted" />
                <span className="mx-3 text-muted small">หรือ</span>
                <hr className="flex-grow-1 text-muted" />
              </div>

              {/* ปุ่ม Social Login */}
              <div className="d-flex gap-2 mb-4">
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold" style={{color: '#1877F2'}}>f</button>
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold" style={{color: '#DB4437'}}>G</button>
                <button className="btn btn-outline-secondary w-100 rounded-2 py-2 fw-bold text-dark"></button>
              </div>

              <div className="text-center mt-2 small">
                <span className="text-muted">มีบัญชีอยู่แล้ว? </span>
                <Link to="/login" className="text-dark fw-bold text-decoration-underline">เข้าสู่ระบบ</Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}