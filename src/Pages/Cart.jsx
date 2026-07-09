import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function Cart({ cart, setCart, currentUser, handleCheckout }) {
  const [paymentMethod, setPaymentMethod] = useState('promptpay');

  if (currentUser !== 'customer') return <Navigate to="/login" />;

  const subTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shippingFee = subTotal >= 3000 ? 0 : 100; // ค่าจัดส่ง 100 บาท ส่งฟรีเมื่อเกิน 3000
  const totalPrice = subTotal + shippingFee;

  const handleRemoveItem = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const onCheckoutClick = () => {
    handleCheckout(totalPrice, paymentMethod); // ส่งราคารวมและวิธีจ่ายเงินไปให้ App.jsx
  };

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">🛒 ตะกร้าสินค้าและชำระเงิน</h3>
      
      {cart.length === 0 ? (
        <div className="text-center py-5 bg-white shadow-sm rounded-4">
          <h5 className="text-muted mb-3">ตะกร้าของคุณยังว่างเปล่า</h5>
          <Link to="/" className="btn btn-dark rounded-1 px-4">ไปช้อปปิ้งกันเลย</Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            {/* รายการสินค้า */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3">รายการสินค้า ({cart.length} ชิ้น)</h5>
              {cart.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} className="bg-light rounded p-2 me-3" />
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="text-muted small mb-0">ไซส์: {item.selectedSize || '-'}</p>
                  </div>
                  <div className="text-end me-4">
                    <h6 className="fw-bold mb-0">฿{item.price.toLocaleString()}</h6>
                  </div>
                  <button className="btn btn-outline-danger btn-sm rounded-1" onClick={() => handleRemoveItem(index)}>ลบ</button>
                </div>
              ))}
            </div>

            {/* ช่องทางการชำระเงิน */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3">ช่องทางการชำระเงิน</h5>
              <div className="form-check p-3 border rounded-3 mb-2 bg-light">
                <input className="form-check-input ms-1 me-3" type="radio" name="payment" id="promptpay" checked={paymentMethod === 'promptpay'} onChange={() => setPaymentMethod('promptpay')} />
                <label className="form-check-label fw-bold d-block w-100" htmlFor="promptpay" style={{cursor:'pointer'}}>📱 สแกน QR Code (PromptPay)</label>
              </div>
              <div className="form-check p-3 border rounded-3 mb-2 bg-light">
                <input className="form-check-input ms-1 me-3" type="radio" name="payment" id="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} />
                <label className="form-check-label fw-bold d-block w-100" htmlFor="credit" style={{cursor:'pointer'}}>💳 บัตรเครดิต / เดบิต</label>
              </div>
              <div className="form-check p-3 border rounded-3 bg-light">
                <input className="form-check-input ms-1 me-3" type="radio" name="payment" id="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <label className="form-check-label fw-bold d-block w-100" htmlFor="cod" style={{cursor:'pointer'}}>📦 ชำระเงินปลายทาง (COD)</label>
              </div>
            </div>
          </div>
          
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-4">สรุปคำสั่งซื้อ</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">ยอดรวมสินค้า</span>
                <span className="fw-bold">฿{subTotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 pb-3 border-bottom">
                <span className="text-muted">ค่าจัดส่ง</span>
                {shippingFee === 0 ? <span className="text-success fw-bold">ฟรี</span> : <span className="fw-bold">฿{shippingFee}</span>}
              </div>
              <div className="d-flex justify-content-between mb-4">
                <h4 className="fw-bold">ยอดสุทธิ</h4>
                <h4 className="fw-bold text-danger">฿{totalPrice.toLocaleString()}</h4>
              </div>
              <button className="btn btn-dark btn-lg w-100 rounded-2 fw-bold" onClick={onCheckoutClick}>
                ยืนยันการสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}