import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// สังเกตว่าเราเอา currentUser และ handleLogout ออกจาก Props เพราะเราจะให้ Navbar จัดการตัวเองครับ
export default function Navbar({ searchQuery, setSearchQuery, cart }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ดึงข้อมูล User จาก localStorage เมื่อโหลด Navbar
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  // ฟังก์ชันออกจากระบบ (ย้ายมาไว้ในนี้เลยเพื่อความสะดวก)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    window.location.reload(); // รีเฟรช 1 ครั้งเพื่อเคลียร์ state อื่นๆ
  };

  return (
    <div className="sticky-top bg-white shadow-sm">
      <nav className="navbar navbar-expand-lg py-3">
        <div className="container px-4">
          <Link to="/" className="navbar-brand fw-bold fs-3 text-dark text-decoration-none">
            KICKZONE
          </Link>
          
          <div className="mx-auto d-none d-lg-block" style={{ width: '40%' }}>
            <input 
              type="text" 
              className="form-control rounded-1 bg-light border-0" 
              placeholder="🔍 ค้นหาสินค้าตามแบรนด์, ชื่อรุ่น..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="d-flex gap-3 align-items-center">
            
            {/* 🟢 แสดงเมนูสำหรับ Customer (ลูกค้า) */}
            {user && user.role === 'customer' && (
              <>
                <Link to="/cart" className="btn btn-light rounded-circle p-2 px-3 text-decoration-none">
                  🛒 {cart && cart.length > 0 && <span className="text-danger fw-bold">{cart.length}</span>}
                </Link>
                <Link to="/profile" className="btn btn-outline-dark rounded-1 px-3">
                  👤 สวัสดี, {user.name}
                </Link>
              </>
            )}
            
            {/* 🔴 แสดงเมนูสำหรับ Admin (ผู้ดูแลระบบ) */}
            {user && user.role === 'admin' && (
              <>
                <span className="fw-bold text-dark d-none d-md-block">👑 แอดมิน {user.name}</span>
                <Link to="/admin" className="btn btn-dark rounded-1 px-4">ระบบจัดการ</Link>
              </>
            )}

            {/* ⚪ เงื่อนไขสลับปุ่ม เข้าสู่ระบบ / ออกจากระบบ */}
            {user ? (
              <button className="btn btn-outline-danger rounded-1 px-4" onClick={handleLogout}>ออกจากระบบ</button>
            ) : (
              <Link to="/login" className="btn btn-dark rounded-1 px-4">เข้าสู่ระบบ</Link>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
}