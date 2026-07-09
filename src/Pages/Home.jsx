import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ filteredProducts, currentUser, handleAddToCart, wishlist, toggleWishlist }) {
  // State สำหรับระบบคัดกรองขั้นสูง (Advanced Filter)
  const [filterBrand, setFilterBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(20000);

  // กรองข้อมูลสินค้าตามเงื่อนไขที่เลือก
  const displayProducts = filteredProducts.filter(p => {
    const matchBrand = filterBrand === 'All' || p.brand.toLowerCase() === filterBrand.toLowerCase();
    const matchPrice = p.price <= maxPrice;
    return matchBrand && matchPrice;
  });

  return (
    <div className="container py-5 px-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-3">ค้นพบสไตล์ของคุณ</h2>
        <p className="text-muted">สินค้าแบรนด์แท้ 100% พร้อมจัดส่ง</p>
      </div>
      
      {/* แถบเครื่องมือ: ระบบคัดกรองสินค้าขั้นสูง */}
      <div className="bg-light p-3 rounded-4 mb-4 d-flex flex-wrap gap-4 align-items-center">
        <div>
          <span className="fw-bold me-2 small">แบรนด์:</span>
          <select 
            className="form-select form-select-sm d-inline-block w-auto rounded-2" 
            value={filterBrand} 
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="All">ทั้งหมด</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="New Balance">New Balance</option>
            <option value="Puma">Puma</option>
            <option value="Asics">Asics</option>
          </select>
        </div>
        <div>
          <span className="fw-bold me-2 small">ราคาไม่เกิน: ฿{maxPrice.toLocaleString()}</span>
          <input 
            type="range" 
            className="form-range align-middle" 
            min="1000" max="20000" step="500" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Number(e.target.value))} 
            style={{ width: '150px' }} 
          />
        </div>
        <div className="ms-auto text-muted small fw-bold">
          พบสินค้า {displayProducts.length} รายการ
        </div>
      </div>

      {displayProducts.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h5>
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {displayProducts.map(product => {
            // เช็คว่าสินค้านี้อยู่ใน Wishlist หรือยัง
            const isLiked = wishlist?.find(w => w.id === product.id);
            
            return (
              <div className="col" key={product.id}>
                <div className="card h-100 border-0 shadow-sm p-2 rounded-4 position-relative">
                  
                  {/* ปุ่มกดหัวใจ (Wishlist) */}
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center border-0" 
                    style={{ width: '35px', height: '35px', zIndex: 10, transition: 'all 0.2s' }}
                  >
                    {isLiked ? <span className="text-danger fs-5">❤️</span> : <span className="text-muted fs-5">🤍</span>}
                  </button>

                  <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                    <div className="img-bg-light mb-3 d-flex align-items-center justify-content-center rounded-4" style={{ height: '200px' }}>
                      <img src={product.image || "https://via.placeholder.com/200"} alt={product.name} style={{ width: '90%', maxHeight: '90%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    </div>
                    <div className="card-body p-2 d-flex flex-column">
                      <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>{product.brand}</p>
                      <h6 className="card-title fw-bold mb-2 text-truncate" style={{ fontSize: '14px', lineHeight: '1.4' }}>{product.name}</h6>
                      <div className="mt-auto">
                        <h6 className="mb-0 fw-bold text-danger">฿ {product.price.toLocaleString()}</h6>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}