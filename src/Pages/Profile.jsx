import React from 'react';
import { Navigate, Link } from 'react-router-dom';

export default function Profile({ currentUser, orders }) {
  // ป้องกันคนไม่ได้ล็อกอินเข้าหน้านี้
  if (currentUser !== 'customer') return <Navigate to="/login" />;

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <h3 className="fw-bold mb-4">👤 บัญชีของฉัน</h3>
      
      <div className="row g-4">
        {/* ข้อมูลส่วนตัว */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px', fontSize: '30px' }}>
              C
            </div>
            <h5 className="fw-bold">ลูกค้าทั่วไป</h5>
            <p className="text-muted small">customer@kickzone.com</p>
            <hr className="my-3 text-muted" />
            <Link to="/" className="btn btn-outline-dark w-100 rounded-1">ไปช้อปปิ้งต่อ</Link>
          </div>
        </div>

        {/* ประวัติการสั่งซื้อ */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4">📦 ประวัติการสั่งซื้อล่าสุด</h5>
            
            {orders.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>คุณยังไม่มีประวัติการสั่งซื้อ</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-3 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <span className="fw-bold me-2">หมายเลขคำสั่งซื้อ: {order.id}</span>
                        <span className="badge bg-warning text-dark">{order.status}</span>
                      </div>
                      <span className="text-muted small">{order.date}</span>
                    </div>
                    
                    {order.items.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center mt-2">
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="me-2 rounded bg-white p-1 border" />
                        <div className="flex-grow-1">
                          <div className="small fw-bold">{item.name}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>ไซส์: {item.selectedSize || '-'}</div>
                        </div>
                        <div className="small fw-bold">฿{item.price.toLocaleString()}</div>
                      </div>
                    ))}
                    
                    <div className="text-end mt-3 pt-2 border-top">
                      <span className="text-muted small me-2">ยอดรวมสุทธิ:</span>
                      <span className="fw-bold text-danger">฿{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}