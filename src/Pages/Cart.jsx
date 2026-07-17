import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PromptPay'); 
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'upload_slip', 'success'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // สถานะตำแหน่งโฟกัสข้อมูล (Focus Status) สำหรับแอนิเมชันของฟิลด์ข้อมูล
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      
      // ตรวจสอบและดึงข้อมูลไซส์รองเท้าจากทุกคีย์ที่เป็นไปได้ แล้วแปลงให้เป็นสเกลมาตรฐานไม่มีคำว่า EU นำหน้า
      const sanitizedCart = parsedCart.map(item => {
        let rawSize = item.size || item.selectedSize || item.shoeSize || item.euSize;
        
        if (rawSize && typeof rawSize === 'string') {
          rawSize = rawSize.replace(/EU\s*/i, '').trim();
        }
        
        return {
          ...item,
          size: rawSize || '42' // หากไม่มีข้อมูลระบบจะจัดสรรไซส์ 42 เป็นค่าพื้นฐานเพื่อความปลอดภัยของโมเดล
        };
      });
      
      setCartItems(sanitizedCart);
      localStorage.setItem('cart', JSON.stringify(sanitizedCart));
    } else {
      setCartItems([]);
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setShippingInfo(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, []);

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const shippingFee = subTotal > 0 ? 100 : 0;
  const totalAmount = subTotal + shippingFee;

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('ระบบหลังบ้านรองรับเฉพาะไฟล์รูปภาพหลักฐานสลิป (.png, .jpg, .jpeg) เท่านั้นครับ');
        setSlipFile(null);
        setSlipPreview(null);
        e.target.value = ''; 
        return;
      }
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      setError('ไม่มีรายการสินค้าในตะกร้าช็อปปิ้งของคุณ');
      return;
    }
    if (!shippingInfo.name.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim()) {
      setError('กรุณากรอกข้อมูลและรายละเอียดสำหรับการจัดส่งพัสดุให้ครบถ้วนก่อนส่งข้อมูลครับ');
      return;
    }

    setLoading(true);
    setError(null);

    // ทำการรวมข้อมูลรุ่นและไซส์รองเท้าที่เลือกส่งไปยังฐานข้อมูล NeonDB
    const shoeModel = cartItems.map(item => `${item.name} (ไซส์ ${item.size || '42'})`).join(', ');

    const orderPayload = {
      customerName: shippingInfo.name,
      customerEmail: currentUser?.email || 'guest@kickzone.com',
      shoeModel: shoeModel,
      size: cartItems[0]?.size || '42',
      totalAmount: totalAmount,
      paymentMethod: paymentMethod
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'ไม่สามารถส่งบันทึกรายการสั่งซื้อเข้าสู่ระบบได้');

      setCreatedOrder(data.order);

      if (paymentMethod === 'PromptPay') {
        setCheckoutStep('upload_slip');
      } else {
        setCheckoutStep('success');
        localStorage.removeItem('cart'); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSlip = async (e) => {
    e.preventDefault();
    
    if (!slipFile) {
      setError('กรุณาเลือกหรืออัปโหลดรูปภาพใบสลิปสำหรับการโอนเงินจริงก่อนกดยืนยันครับ');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('slip', slipFile);

    try {
      const response = await fetch(`${API_URL}/orders/${createdOrder.id}/upload-slip`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'กระบวนการส่งและตรวจสอบไฟล์สลิปไม่สำเร็จ');
      }

      setCheckoutStep('success');
      localStorage.removeItem('cart'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '16px',
    border: focusedField === fieldName ? '1px solid #000000' : '1px solid #e5e5e5',
    borderRadius: '0px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease-in-out',
    fontFamily: 'inherit'
  });

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh', padding: '40px 16px', color: '#000000' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        
        {/* Luxury Progress Navigation Tab */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '48px', borderBottom: '1px solid #e5e5e5', paddingBottom: '24px', gap: '0px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: checkoutStep === 'cart' ? '#000000' : '#a3a3a3', fontSize: '13px', display: 'block' }}>
              01 / ตะกร้า & ข้อมูลจัดส่ง
            </span>
            {checkoutStep === 'cart' && <div style={{ height: '2px', backgroundColor: '#000000', width: '60px', margin: '8px auto 0 auto' }} />}
          </div>
          <span style={{ color: '#d4d4d4', fontSize: '14px', fontWeight: '300' }}>➔</span>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: checkoutStep === 'upload_slip' ? '#000000' : '#a3a3a3', fontSize: '13px', display: 'block' }}>
              02 / แนบหลักฐานการโอน
            </span>
            {checkoutStep === 'upload_slip' && <div style={{ height: '2px', backgroundColor: '#000000', width: '60px', margin: '8px auto 0 auto' }} />}
          </div>
          <span style={{ color: '#d4d4d4', fontSize: '14px', fontWeight: '300' }}>➔</span>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: checkoutStep === 'success' ? '#000000' : '#a3a3a3', fontSize: '13px', display: 'block' }}>
              03 / ยืนยันการสั่งซื้อสำเร็จ
            </span>
            {checkoutStep === 'success' && <div style={{ height: '2px', backgroundColor: '#000000', width: '60px', margin: '8px auto 0 auto' }} />}
          </div>
        </div>

        {/* STEP 1: CART LIST & DELIVERY FORM */}
        {checkoutStep === 'cart' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }} className="grid lg:grid-cols-3">
            
            {/* Left Column: Items list & Delivery forms */}
            <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Product items container */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '0px', border: '1px solid #e5e5e5', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 24px 0', color: '#000000', borderBottom: '2px solid #000000', paddingBottom: '10px' }}>
                  ตะกร้าของคุณ ({cartItems.length} รายการ)
                </h2>

                {error && (
                  <div style={{ padding: '16px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '0px', marginBottom: '24px', fontWeight: '600', fontSize: '14px', letterSpacing: '0.5px' }}>
                    ⚠️ {error}
                  </div>
                )}
                
                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#737373' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⬛</div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#000000' }}>ไม่มีสินค้าในตะกร้าช็อปปิ้ง</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#a3a3a3' }}>กรุณาเลือกโมเดลรองเท้าที่คุณชอบจากหน้าแคตตาล็อกเพื่อเริ่มสั่งซื้อครับ</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cartItems.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #f5f5f5', paddingBottom: '20px', alignItems: 'center' }}>
                        <div style={{ width: '90px', height: '90px', backgroundColor: '#f9f9f9', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5', flexShrink: 0 }}>
                          <span style={{ fontSize: '32px', filter: 'grayscale(100%)' }}>👟</span>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', color: '#000000', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.name}</div>
                          
                          {/* กล่องแสดงไซส์แบบล็อกค่าสไตล์หรูหราจากดีไซน์ image_8ccb01.png */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '11px', color: '#737373', fontWeight: '800', letterSpacing: '1px' }}>ไซส์:</span>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '950', 
                              color: '#000000', 
                              border: '1px solid #000000', 
                              padding: '4px 14px', 
                              backgroundColor: '#ffffff',
                              letterSpacing: '0.5px',
                              display: 'inline-block'
                            }}>
                              {item.size || '42'}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontWeight: '900', color: '#000000', fontSize: '15px' }}>฿{item.price.toLocaleString()}</div>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ padding: '8px 16px', border: '1px solid #e5e5e5', backgroundColor: '#ffffff', color: '#000000', borderRadius: '0px', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = '#000000'; e.target.style.color = '#ffffff'; }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = '#ffffff'; e.target.style.color = '#000000'; }}
                        >
                          ลบออก
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery destination details */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '0px', border: '1px solid #e5e5e5' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#000000', margin: '0 0 24px 0', borderBottom: '1px solid #f5f5f5', paddingBottom: '12px' }}>
                  📦 ข้อมูลที่อยู่จัดส่งพัสดุ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid md:grid-cols-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#404040', marginBottom: '8px' }}>ชื่อ-นามสกุลผู้รับ</label>
                      <input 
                        type="text" 
                        placeholder="ระบุชื่อผู้รับพัสดุจริง" 
                        value={shippingInfo.name} 
                        onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('name')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#404040', marginBottom: '8px' }}>เบอร์โทรศัพท์ติดต่อ</label>
                      <input 
                        type="text" 
                        placeholder="เช่น 089XXXXXXX" 
                        value={shippingInfo.phone} 
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('phone')}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#404040', marginBottom: '8px' }}>ที่อยู่จัดส่งโดยละเอียด</label>
                    <textarea 
                      rows="3"
                      placeholder="บ้านเลขที่, ถนน, ตำบล/แขวง, อำเภอ, จังหวัด, รหัสไปรษณีย์" 
                      value={shippingInfo.address} 
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...inputStyle('address'), resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Secure Payment methods */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '0px', border: '1px solid #e5e5e5' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#000000', margin: '0 0 24px 0', borderBottom: '1px solid #f5f5f5', paddingBottom: '12px' }}>
                  💳 ช่องทางการชำระเงินที่ปลอดภัย
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: paymentMethod === 'PromptPay' ? '2px solid #000000' : '1px solid #e5e5e5', backgroundColor: paymentMethod === 'PromptPay' ? '#fafafa' : '#ffffff', borderRadius: '0px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <input type="radio" checked={paymentMethod === 'PromptPay'} onChange={() => setPaymentMethod('PromptPay')} style={{ accentColor: '#000000', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#000000' }}>
                      📱 สแกน QR CODE (พร้อมเพย์)
                    </span>
                  </label>

                </div>
              </div>

            </div>

            {/* Right Column: Order Pricing Summary */}
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '0px', border: '1px solid #e5e5e5', height: 'fit-content', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#000000', margin: '0 0 24px 0', borderBottom: '1px solid #f5f5f5', paddingBottom: '12px' }}>
                สรุปรายการสั่งซื้อ
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373', fontSize: '14px', letterSpacing: '0.5px' }}>
                  <span>ยอดรวมสินค้า</span>
                  <span style={{ fontWeight: '700', color: '#000000' }}>฿{subTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373', fontSize: '14px', letterSpacing: '0.5px' }}>
                  <span>ค่าจัดส่งพัสดุ</span>
                  <span style={{ fontWeight: '700', color: '#000000' }}>฿{shippingFee.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: '#000000' }}>ยอดชำระสุทธิ</span>
                  <span style={{ fontSize: '24px', fontWeight: '950', color: '#000000', letterSpacing: '-0.5px' }}>฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleConfirmOrder}
                disabled={loading || cartItems.length === 0}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  backgroundColor: (loading || cartItems.length === 0) ? '#a3a3a3' : '#000000', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0px', 
                  fontSize: '13px', 
                  fontWeight: '800', 
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: (loading || cartItems.length === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => { if (!loading && cartItems.length > 0) e.target.style.backgroundColor = '#1a1a1a'; }}
                onMouseLeave={(e) => { if (!loading && cartItems.length > 0) e.target.style.backgroundColor = '#000000'; }}
              >
                {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสั่งซื้อ'}
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: VERIFY TRANSACTION AND UPLOAD SLIP */}
        {checkoutStep === 'upload_slip' && createdOrder && (
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '0px', border: '1px solid #e5e5e5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '40px', filter: 'grayscale(100%)' }}>🏦</span>
              <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000000', marginTop: '12px', marginBottom: '4px' }}>
                แนบสลิปเพื่อตรวจสอบข้อมูล
              </h2>
              <p style={{ color: '#737373', fontSize: '13px', margin: 0 }}>รหัสคำสั่งซื้ออ้างอิง: <strong style={{ color: '#000000' }}>{createdOrder.id}</strong></p>
            </div>

            {/* ส่วนแสดงยอดชำระและรูปภาพ QR.png จากโฟลเดอร์ public */}
            <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5', padding: '30px 20px', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>ยอดเงินสุทธิที่ต้องโอน</span>
              <span style={{ fontSize: '32px', fontWeight: '950', color: '#000000', display: 'block', marginBottom: '20px' }}>฿{createdOrder.totalAmount.toLocaleString()}</span>
              
              <div style={{ width: '220px', height: '220px', backgroundColor: 'white', border: '1px solid #e5e5e5', padding: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                  src="/QR.png" 
                  alt="PromptPay QR Code" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'QR.png';
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '16px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '0px', marginBottom: '24px', fontWeight: '600', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleUploadSlip} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#404040', marginBottom: '8px' }}>แนบหลักฐานภาพสลิปโอนเงินจริง (PNG, JPG, JPEG)</label>
                <div style={{ position: 'relative', border: '1px dashed #cbd5e1', borderRadius: '0px', padding: '24px', textAlign: 'center', backgroundColor: '#fafafa', cursor: 'pointer' }}>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  {slipPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img src={slipPreview} alt="Slip Preview" style={{ maxHeight: '200px', objectFit: 'contain', border: '1px solid #cbd5e1' }} />
                      <span style={{ fontSize: '12px', color: '#000000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>🔄 กดเพื่อเปลี่ยนภาพสลิปใบใหม่</span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📸</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#000000', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>เลือกไฟล์รูปภาพใบสลิป</span>
                      <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginTop: '4px' }}>ขนาดไฟล์รองรับไม่เกิน 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  style={{ flex: 1, padding: '16px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#000000', borderRadius: '0px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  ย้อนกลับ
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ 
                    flex: 2, 
                    padding: '16px', 
                    backgroundColor: loading ? '#cbd5e1' : '#000000', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0px', 
                    fontSize: '13px', 
                    fontWeight: '800', 
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {loading ? 'กำลังตรวจสอบสลิป...' : 'ส่งสลิปเพื่อตรวจสอบ'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER PLACED SUCCESSFULLY */}
        {checkoutStep === 'success' && createdOrder && (
          <div style={{ maxWidth: '550px', margin: '40px auto 0 auto', backgroundColor: 'white', padding: '48px 32px', borderRadius: '0px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <span style={{ fontSize: '36px' }}>✓</span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#000000', margin: '0 0 12px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>สั่งซื้อพัสดุสำเร็จ</h2>
            <p style={{ color: '#737373', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
              รายการชำระเงินและออเดอร์ได้รับการบันทึกแล้ว ทางทีมงาน KickZone กำลังทำการแพ็คพัสดุเตรียมจัดส่งให้คุณอย่างเร็วที่สุดครับ
            </p>

            <div style={{ backgroundColor: '#fafafa', border: '1px solid #000000', padding: '24px', borderRadius: '0px', marginBottom: '32px' }}>
              <span style={{ fontSize: '11px', color: '#737373', display: 'block', marginBottom: '6px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>รหัสตรวจสอบสถานะจัดส่งพัสดุ</span>
              <span style={{ fontSize: '28px', fontWeight: '950', color: '#000000', letterSpacing: '3px', display: 'block' }}>{createdOrder.id}</span>
              <span style={{ fontSize: '11px', color: '#a3a3a3', display: 'block', marginTop: '8px' }}>* โปรดบันทึกรหัสนี้ไว้เพื่อเช็คสถานะพัสดุของคุณที่หน้าหลัก</span>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              style={{ padding: '16px 32px', backgroundColor: '#000000', color: 'white', border: 'none', borderRadius: '0px', fontSize: '13px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              กลับไปช้อปต่อหน้าร้านค้า
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
