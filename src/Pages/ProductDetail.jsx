import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ProductDetail({ products, currentUser, handleAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  
  const sizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"];
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false); // State สำหรับเปิด/ปิดตารางไซส์

  if (!product) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <h3 className="fw-bold mt-5">ไม่พบสินค้านี้</h3>
        <Link to="/" className="btn btn-dark mt-3">กลับไปหน้าแรก</Link>
      </div>
    );
  }

  const onAddToCart = () => {
    if (!selectedSize) return alert("กรุณาเลือกไซส์ก่อนเพิ่มลงตะกร้าครับ!");
    handleAddToCart({ ...product, selectedSize, cartItemId: Date.now().toString() });
  };

  return (
    <div className="container py-5">
      <button onClick={() => navigate(-1)} className="btn btn-link text-dark text-decoration-none p-0 mb-4 fw-bold">← ย้อนกลับ</button>

      <div className="row g-5">
        {/* รูปภาพ */}
        <div className="col-md-6">
          <div className="img-bg-light d-flex align-items-center justify-content-center rounded-4 p-5 position-relative" style={{ minHeight: '500px' }}>
            <span className="badge bg-danger position-absolute top-0 start-0 m-4 px-3 py-2 fs-6 rounded-pill">🔥 Best Seller</span>
            <img src={product.image || "https://via.placeholder.com/500"} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="col-md-6">
          <p className="text-muted mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>{product.brand}</p>
          <h2 className="fw-bold mb-3">{product.name}</h2>
          
          <div className="d-flex align-items-center mb-4">
            <span className="text-warning me-2">★★★★★</span>
            <span className="text-muted small">(4.8/5 จาก 124 รีวิว)</span>
          </div>

          <h3 className="fw-bold mb-4 text-danger">฿ {product.price.toLocaleString()}</h3>
          <hr className="text-muted" />

          {/* เลือกไซส์ & ตารางไซส์ */}
          <div className="mb-4 mt-4">
            <div className="d-flex justify-content-between align-items-end mb-3">
              <h6 className="fw-bold mb-0">เลือกไซส์ (US)</h6>
              <span className="text-muted small text-decoration-underline" style={{cursor: 'pointer'}} onClick={() => setShowSizeChart(!showSizeChart)}>
                {showSizeChart ? "ปิดตารางเทียบไซส์" : "📏 ตารางเทียบไซส์"}
              </span>
            </div>
            
            {/* ตารางเทียบไซส์จำลอง */}
            {showSizeChart && (
              <div className="bg-light p-3 rounded-3 mb-3 small">
                <table className="table table-sm table-borderless text-center mb-0">
                  <thead><tr className="border-bottom"><th>US</th><th>UK</th><th>EU</th><th>CM</th></tr></thead>
                  <tbody>
                    <tr><td>7</td><td>6</td><td>40</td><td>25</td></tr>
                    <tr><td>8</td><td>7</td><td>41</td><td>26</td></tr>
                    <tr><td>9</td><td>8</td><td>42.5</td><td>27</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="row g-2">
              {sizes.map(size => (
                <div className="col-3" key={size}>
                  <button className={`btn w-100 rounded-2 fw-bold ${selectedSize === size ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {currentUser === 'customer' ? (
              <button className="btn btn-dark btn-lg w-100 rounded-2 fw-bold py-3 mb-3 shadow-sm" onClick={onAddToCart}>🛒 เพิ่มลงตะกร้า</button>
            ) : (
              <Link to="/login" className="btn btn-outline-dark btn-lg w-100 rounded-2 fw-bold py-3 mb-3">เข้าสู่ระบบเพื่อสั่งซื้อ</Link>
            )}
            <div className="bg-light p-3 rounded-2 text-center text-muted small"><i className="fa-solid fa-shield-halved me-2"></i> สินค้าของแท้ 100% | จัดส่งฟรีเมื่อยอดเกิน 3,000 บาท</div>
          </div>
        </div>
      </div>

      {/* ระบบรีวิวจำลอง */}
      <div className="mt-5 pt-5 border-top">
        <h4 className="fw-bold mb-4">รีวิวจากผู้ซื้อจริง</h4>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-light p-4 rounded-4">
              <span className="text-warning">★★★★★</span>
              <p className="fw-bold mt-2 mb-1">ใส่สบายมาก คุ้มราคา</p>
              <p className="text-muted small mb-0">โดย K. Somchai - แนะนำให้เผื่อไซส์ 0.5 ครับ หน้าเท้ากว้างใส่สบาย</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-light p-4 rounded-4">
              <span className="text-warning">★★★★★</span>
              <p className="fw-bold mt-2 mb-1">ส่งไว ของแท้แน่นอน</p>
              <p className="text-muted small mb-0">โดย K. Natthapong - แพ็คเกจมาดีมากครับ กล่องไม่บุบเลย</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}