import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

// วิเคราะห์สถานะเพื่อขยับ Stepper 
const getDeliveryStep = (paymentStatus, orderStatus) => {
  const payNorm = (paymentStatus || '').trim().toUpperCase();
  const orderNorm = (orderStatus || '').trim().toUpperCase();

  if (payNorm === 'PENDING UPLOAD' || payNorm === 'รอชำระเงิน' || payNorm === 'PENDING VERIFICATION' || payNorm === 'รอตรวจสอบสลิป') return 0; 
  if (orderNorm === 'PROCESSING' || orderNorm === 'เตรียมจัดส่ง') return 1;
  if (orderNorm === 'SHIPPED' || orderNorm === 'จัดส่งแล้ว') return 2;
  if (orderNorm === 'DELIVERED' || orderNorm === 'สำเร็จ') return 3;
  return 0;
};

// ข้อความอธิบายสถานะย่อย
const getStatusDescriptionText = (paymentStatus, orderStatus) => {
  const payNorm = (paymentStatus || '').trim().toUpperCase();
  const orderNorm = (orderStatus || '').trim().toUpperCase();

  if (payNorm === 'PENDING UPLOAD' || payNorm === 'รอชำระเงิน') return '⏳ รอการชำระเงินจากคุณ';
  if (payNorm === 'PENDING VERIFICATION' || payNorm === 'รอตรวจสอบสลิป') return '🕒 อยู่ระหว่างการตรวจสอบสลิปโอนเงิน';
  if (payNorm === 'PAID' || payNorm === 'ชำระเงินสำเร็จ') {
    if (orderNorm === 'SHIPPED' || orderNorm === 'จัดส่งแล้ว') return '🚚 พัสดุถูกจัดส่งออกเรียบร้อยแล้ว';
    if (orderNorm === 'DELIVERED' || orderNorm === 'สำเร็จ') return '🏠 รายการสั่งซื้อเสร็จสมบูรณ์เรียบร้อย';
    return '📦 ชำระเงินสำเร็จแล้ว • อยู่ระหว่างเตรียมจัดส่ง';
  }
  return '📝 ได้รับรายการสั่งซื้อเข้าสู่ระบบ';
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); 

  // 🎨 อัปเดตธีมสีให้ตรงกับ Navbar โทน Warm Minimal
  const theme = {
    bg: '#ffffff',
    contentBg: '#F9F8F6', // พื้นหลังกล่องเนื้อหาด้านขวา (เบจอ่อนมาก)
    primary: '#8C7A6B',   // น้ำตาลตุ่น (ปุ่ม, Stepper, Icon Active)
    textDark: '#4A3F35',  // น้ำตาลเข้มสำหรับตัวหนังสือหลัก
    textMuted: '#9E9185', // สีเทาอมน้ำตาลสำหรับข้อความรอง
    border: '#E8E1D9',    // สีเส้นขอบ
    activeBg: '#F8F6F3'   // สีพื้นหลังตอน Hover หรือ Active เมนูซ้าย
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const mockUser = {
        name: 'Mr. THANAWISIT INTASAN',
        email: 'thanawisit.int@spumail.net'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    }

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    } else {
      const mockWishlist = [];
      setWishlist(mockWishlist);
    }
  }, []);

  const fetchOrdersFromDatabase = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("การดึงข้อมูลออเดอร์มีข้อผิดพลาด:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchOrdersFromDatabase();
      const interval = setInterval(fetchOrdersFromDatabase, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: "'Kanit', 'Prompt', sans-serif", color: theme.textMuted }}>
        กำลังดึงข้อมูลบัญชีผู้ใช้...
      </div>
    );
  }

  const myOrders = orders.filter(o => 
    (o.customer_email || o.customerEmail || '').trim().toLowerCase() === user.email.trim().toLowerCase()
  );

  const SidebarItem = ({ id, icon, title, subtitle }) => {
    const isActive = activeTab === id;
    return (
      <div 
        onClick={() => setActiveTab(id)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 16px', 
          borderRadius: '12px',
          backgroundColor: isActive ? theme.activeBg : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: '8px'
        }}
        onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = theme.activeBg)}
        onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '24px', 
          marginRight: '16px', 
          color: isActive ? theme.primary : '#B8B0A8',
          transition: 'color 0.2s'
        }}>
          {icon}
        </span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500', color: isActive ? theme.textDark : '#6C5E53' }}>{title}</div>
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>{subtitle}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Kanit', 'Prompt', sans-serif", backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 0', color: theme.textDark }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '48px', padding: '0 24px' }}>
        
        {/* คอลัมน์ซ้าย: Sidebar Navigation */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          
          <SidebarItem 
            id="profile" 
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            } 
            title="โปรไฟล์" 
            subtitle="การตั้งค่าและระดับสมาชิก" 
          />
          
          <SidebarItem 
            id="orders" 
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            } 
            title="การซื้อ" 
            subtitle="รายการสั่งซื้อและติดตามสถานะ" 
          />
          
          <SidebarItem 
            id="wishlist" 
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            } 
            title="สินค้าที่สนใจ" 
            subtitle="สินค้าที่คุณบันทึกไว้" 
          />

        </div>

        {/* คอลัมน์ขวา: พื้นที่แสดงเนื้อหาหลัก */}
        <div style={{ flex: 1, backgroundColor: theme.contentBg, borderRadius: '16px', padding: '40px', minHeight: '600px', border: `1px solid ${theme.border}` }}>
          
          {/* TAB: โปรไฟล์ */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px', color: theme.textDark }}>ข้อมูลส่วนตัว</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: theme.primary, color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: theme.textDark }}>{user.name}</h4>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 16px 0' }}>{user.email}</p>
                  <Link 
                    to="/" 
                    style={{ padding: '8px 24px', backgroundColor: theme.primary, color: '#fff', borderRadius: '20px', fontSize: '13px', textDecoration: 'none', display: 'inline-block', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    ไปช้อปปิ้งต่อ
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ประวัติการสั่งซื้อ */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px', color: theme.textDark }}>ประวัติการสั่งซื้อ</h3>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textMuted }}>กำลังโหลด...</div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textMuted }}>
                  <p style={{ margin: 0, fontSize: '15px' }}>ยังไม่มีประวัติการสั่งซื้อ</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myOrders.map(order => {
                    const currentStep = getDeliveryStep(order.paymentStatus || order.status, order.orderStatus);
                    const statusText = getStatusDescriptionText(order.paymentStatus || order.status, order.orderStatus);

                    return (
                      <div key={order.id} style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(140, 122, 107, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${theme.border}`, paddingBottom: '16px', marginBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>รหัสคำสั่งซื้อ</span>
                            <strong style={{ fontSize: '14px', display: 'block', marginTop: '4px', color: theme.textDark }}>{order.id}</strong>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>ยอดสุทธิ</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', display: 'block', marginTop: '4px', color: theme.primary }}>฿{Number(order.totalAmount || order.total || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textDark }}>{order.shoeModel || 'สินค้าจาก KickZone'} (ไซส์: {order.size || 'N/A'})</div>
                          <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '6px' }}>{statusText}</div>
                          {order.trackingNumber && order.trackingNumber !== 'N/A' && (
                            <div style={{ marginTop: '8px', fontSize: '11px', display: 'inline-block', padding: '4px 8px', backgroundColor: theme.primary, color: '#fff', borderRadius: '4px' }}>TRACK: {order.trackingNumber}</div>
                          )}
                        </div>

                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '20px' }}>
                          <div style={{ position: 'absolute', top: '12px', left: '20px', right: '20px', height: '2px', backgroundColor: theme.border, zIndex: 1 }} />
                          <div style={{ position: 'absolute', top: '12px', left: '20px', width: `calc(${(currentStep / 3) * 100}% - 40px)`, height: '2px', backgroundColor: theme.primary, zIndex: 2, transition: 'width 0.4s ease' }} />
                          <StepNode isActive={currentStep >= 0} label="ได้รับออเดอร์" icon="📝" theme={theme} />
                          <StepNode isActive={currentStep >= 1} label="กำลังจัดเตรียม" icon="📦" theme={theme} />
                          <StepNode isActive={currentStep >= 2} label="จัดส่งพัสดุ" icon="🚚" theme={theme} />
                          <StepNode isActive={currentStep >= 3} label="สำเร็จเรียบร้อย" icon="🏠" theme={theme} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: สินค้าที่สนใจ */}
          {activeTab === 'wishlist' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px', color: theme.textDark }}>สินค้าที่สนใจ</h3>
              
              {wishlist.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', minHeight: '300px' }}>
                  <div style={{ color: theme.border, marginBottom: '16px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '15px', color: theme.textMuted, marginBottom: '24px' }}>มาเพิ่มหน้านี้ด้วยสินค้าที่คุณสนใจ!</p>
                  <Link 
                    to="/" 
                    style={{ padding: '12px 32px', backgroundColor: theme.primary, color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    คุณอาจจะชอบสิ่งนี้
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {wishlist.map((item, index) => (
                    <div key={index} style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff', position: 'relative', textAlign: 'center', boxShadow: '0 2px 8px rgba(140, 122, 107, 0.04)' }}>
                      <button 
                        onClick={() => {
                          const newWishlist = wishlist.filter(w => w.id !== item.id);
                          setWishlist(newWishlist);
                          localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                        }}
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="เอาออกจากรายการโปรด"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>

                      <img src={item.image || 'https://via.placeholder.com/200'} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '12px' }} />
                      <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>{item.brand || 'KICKZONE'}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textDark, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: theme.primary }}>฿{Number(item.price || 0).toLocaleString()}</div>
                      
                      <Link 
                        to={`/product/${item.id}`} 
                        style={{ display: 'block', marginTop: '16px', padding: '8px 0', backgroundColor: theme.activeBg, color: theme.textDark, borderRadius: '6px', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}
                      >
                        ดูสินค้า
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StepNode({ isActive, label, icon, theme }) {
  return (
    <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' }}>
      <div style={{ 
        width: '26px', 
        height: '26px', 
        borderRadius: '50%', 
        backgroundColor: isActive ? theme.primary : '#ffffff', 
        border: isActive ? `2px solid ${theme.primary}` : `2px solid ${theme.border}`,
        color: isActive ? '#ffffff' : theme.textMuted,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '12px',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '11px', fontWeight: isActive ? '500' : '400', color: isActive ? theme.primary : theme.textMuted, marginTop: '8px', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}