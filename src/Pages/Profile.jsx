import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Profile({ orders }) {
  // 1. สร้าง State สำหรับเก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่
  const [user, setUser] = useState(null);

  // 2. ดึงข้อมูลผู้ใช้จาก localStorage เมื่อเปิดหน้านี้
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ระหว่างที่รอโหลดข้อมูล
  if (!user) {
    return <div className="text-center py-5 mt-5">กำลังโหลดข้อมูล...</div>;
  }

  // 3. กรองเอาเฉพาะ "ประวัติคำสั่งซื้อ" ที่ตรงกับอีเมลของลูกค้าคนนี้
  const myOrders = orders.filter(o => o.customer_email === user.email);

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <h3 className="fw-bold mb-4">👤 บัญชีของฉัน</h3>
      
      <div className="row g-4">
        {/* ======================================= */}
        {/* ฝั่งซ้าย: ข้อมูลส่วนตัว (Profile Card) */}
        {/* ======================================= */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4">
            
            {/* ดึงตัวอักษรตัวแรกของชื่อมาทำรูปโปรไฟล์ */}
            <div 
              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* ดึงชื่อและอีเมลมาแสดงผล */}
            <h5 className="fw-bold mb-1">{user.name}</h5>
            <p className="text-muted small mb-4">{user.email}</p>
            
            <Link to="/" className="btn btn-outline-dark w-100 rounded-2 py-2">
              ไปช้อปปิ้งต่อ
            </Link>
          </div>
        </div>

        {/* ======================================= */}
        {/* ฝั่งขวา: ประวัติการสั่งซื้อ (Order History) */}
        {/* ======================================= */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4">📦 ประวัติการสั่งซื้อล่าสุด</h5>
            
            {myOrders.length === 0 ? (
              <div className="text-center text-muted py-5 my-5">
                คุณยังไม่มีประวัติการสั่งซื้อ
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>รหัสคำสั่งซื้อ</th>
                      <th>วันที่</th>
                      <th>ยอดรวม</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id}>
                        <td className="fw-bold">{order.id}</td>
                        <td>{order.order_date}</td>
                        <td className="text-danger fw-bold">฿{order.total.toLocaleString()}</td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${
                            order.status === 'รอชำระเงิน' ? 'bg-warning text-dark' : 
                            order.status === 'จัดส่งแล้ว' ? 'bg-success' : 'bg-primary'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}