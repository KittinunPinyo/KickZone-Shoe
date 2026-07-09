import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ searchQuery, setSearchQuery, currentUser, cart, handleLogout }) {
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
            {currentUser === 'customer' && (
              <>
                <Link to="/cart" className="btn btn-light rounded-circle p-2 px-3 text-decoration-none">
                  🛒 {cart.length > 0 && <span className="text-danger fw-bold">{cart.length}</span>}
                </Link>
                {/* เพิ่มปุ่มโปรไฟล์ตรงนี้ */}
                <Link to="/profile" className="btn btn-outline-dark rounded-1 px-3">
                  👤 โปรไฟล์
                </Link>
              </>
            )}
            
            {currentUser === 'admin' && (
              <Link to="/admin" className="btn btn-dark rounded-1 px-4">ระบบจัดการ</Link>
            )}

            {currentUser ? (
              <button className="btn btn-outline-dark rounded-1 px-4" onClick={handleLogout}>ออกจากระบบ</button>
            ) : (
              <Link to="/login" className="btn btn-dark rounded-1 px-4">เข้าสู่ระบบ</Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}