import React, { useState, useEffect } from 'react';
import ManageReviews from './ManageReviews';
import ManagePromotions from './ManagePromotions';

const API_URL = 'http://localhost:5000/api';

/* STREAMING_CHUNK: Setting up premium monochromatic style mappings... */
// ฟังก์ชันกำหนดสีของป้ายสถานะในแผงแอดมินให้เด่นชัดและดูสวยงาม
const getStatusSelectStyle = (status) => {
  switch (status) {
    case 'ได้รับออเดอร์':
      return { 
        backgroundColor: '#171717', 
        color: '#ffffff', 
        border: 'none', 
        borderRadius: '6px', 
        padding: '10px 16px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        cursor: 'pointer',
        outline: 'none'
      };
    case 'กำลังจัดเตรียม':
      return { 
        backgroundColor: '#ffffff', 
        color: '#000000', 
        border: '2px solid #000000', 
        borderRadius: '6px', 
        padding: '8px 14px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        cursor: 'pointer',
        outline: 'none'
      };
    case 'ส่งพัสดุแล้ว':
      return { 
        backgroundColor: '#1e293b', 
        color: '#ffffff', 
        border: 'none', 
        borderRadius: '6px', 
        padding: '10px 16px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        cursor: 'pointer',
        outline: 'none'
      };
    case 'สำเร็จเรียบร้อย':
      return { 
        backgroundColor: '#10b981', 
        color: '#ffffff', 
        border: 'none', 
        borderRadius: '6px', 
        padding: '10px 16px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        cursor: 'pointer',
        outline: 'none'
      };
    default:
      return { 
        backgroundColor: '#171717', 
        color: '#ffffff', 
        border: 'none', 
        borderRadius: '6px', 
        padding: '10px 16px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        cursor: 'pointer',
        outline: 'none'
      };
  }
};

/* STREAMING_CHUNK: Mapping database statuses to exactly 4 Thai UI labels... */
// แปลงค่าสถานะจาก PostgreSQL ให้รวมกลุ่มเหลือเพียง 4 สถานะหลักของระบบอย่างแท้จริง
const getThaiStatus = (paymentStatus, orderStatus) => {
  const pay = (paymentStatus || '').trim().toUpperCase();
  const order = (orderStatus || '').trim().toUpperCase();
  
  // 1. ตรวจสอบเมื่อออเดอร์เพิ่งเข้า หรือยังไม่จ่ายเงิน หรือรอสแกนตรวจสอบ
  if (pay === 'PENDING UPLOAD' || pay === 'รอชำระเงิน' || pay === 'PENDING VERIFICATION' || pay === 'รอตรวจสอบสลิป' || pay === 'ได้รับออเดอร์') {
    return 'ได้รับออเดอร์';
  }
  
  // 2. เมื่ออนุมัติรับเงินเรียบร้อยแล้ว
  if (pay === 'PAID' || pay === 'ชำระเงินสำเร็จ') {
    if (order === 'SHIPPED' || order === 'จัดส่งแล้ว') return 'ส่งพัสดุแล้ว';
    if (order === 'DELIVERED' || order === 'สำเร็จ' || order === 'สำเร็จเรียบร้อย') return 'สำเร็จเรียบร้อย';
    return 'กำลังจัดเตรียม';
  }
  return 'ได้รับออเดอร์';
};

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'dashboard', 'products', 'orders'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  /* STREAMING_CHUNK: Initializing product editor configurations... */
  const [productModal, setProductModal] = useState({
    isOpen: false, mode: 'add', id: null, name: '', brand: 'adidas', price: '', sku: '', color: '', stock: 10, image: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false, targetId: null, targetName: ''
  });

  /* STREAMING_CHUNK: Fetching actual database records from NeonDB... */
  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersResponse = await fetch(`${API_URL}/orders`);
      if (!ordersResponse.ok) throw new Error('ไม่สามารถเข้าถึงข้อมูลคำสั่งซื้อในเซิร์ฟเวอร์ได้');
      const ordersData = await ordersResponse.json();
      setOrders(ordersData);

      const productsResponse = await fetch(`${API_URL}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSafeTotal = (order) => {
    const val = order.totalAmount ?? order.total_amount ?? order.total ?? 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getSafeEmail = (order) => {
    return order.customerEmail || order.customer_email || order.email || '';
  };

  /* STREAMING_CHUNK: Synchronizing statuses of the selected row... */
  // บันทึกและปรับปรุง 4 สถานะหลักเข้าสู่ฐานข้อมูล เพื่อให้ขยับ Stepper หน้าของลูกค้าทันที
  const handleStatusUpdate = async (orderId, selectValue) => {
    setUpdatingId(orderId);
    setError(null);
    
    let paymentStatus = 'Pending Verification';
    let orderStatus = 'Processing';

    if (selectValue === 'ได้รับออเดอร์') {
      paymentStatus = 'Pending Verification';
      orderStatus = 'Processing';
    } else if (selectValue === 'กำลังจัดเตรียม') {
      paymentStatus = 'Paid';
      orderStatus = 'Processing';
    } else if (selectValue === 'ส่งพัสดุแล้ว') {
      paymentStatus = 'Paid';
      orderStatus = 'Shipped';
    } else if (selectValue === 'สำเร็จเรียบร้อย') {
      paymentStatus = 'Paid';
      orderStatus = 'Delivered';
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus,
          orderStatus,
          trackingNumber: orderStatus === 'Shipped' ? 'TH-' + Math.floor(100000 + Math.random() * 900000) : 'N/A'
        })
      });

      if (!response.ok) throw new Error('การส่งข้อมูลเพื่อเซฟสถานะพัสดุล้มเหลว');
      
      // รีเฟรชตารางบนจอทันที
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, paymentStatus, orderStatus } : o)
      );
      setSuccess('บันทึกสถานะเรียบร้อยแล้ว • ข้อมูลถูกซิงค์ไปยังหน้า Profile ของลูกค้าทันที');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  /* STREAMING_CHUNK: Setting up product catalog methods... */
  const openAddProductModal = () => {
    setProductModal({
      isOpen: true, mode: 'add', id: null, name: '', brand: 'adidas', price: '', sku: 'KZ-' + Math.floor(1000 + Math.random() * 9000), color: '', stock: 15, image: 'https://placehold.co/300x300/f5f5f5/000000?text=SNEAKER'
    });
  };

  const openEditProductModal = (product) => {
    let parsedStock = 10;
    try {
      if (product.stock) {
        const parsed = typeof product.stock === 'string' ? JSON.parse(product.stock) : product.stock;
        parsedStock = typeof parsed === 'object' ? Object.values(parsed)[0] || 10 : Number(parsed) || 10;
      }
    } catch (e) {
      parsedStock = 10;
    }

    setProductModal({
      isOpen: true, mode: 'edit', id: product.id, name: product.name || '', brand: product.brand || 'adidas', price: product.price || '', sku: product.sku || '', color: product.color || '', stock: parsedStock, image: product.image || 'https://placehold.co/300x300/f5f5f5/000000?text=SNEAKER'
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError(null);
    
    const token = localStorage.getItem('token');
    const stockObj = { "40": 5, "41": 5, "42": Number(productModal.stock) || 5 };

    const payload = {
      name: productModal.name,
      brand: productModal.brand,
      price: Number(productModal.price) || 0,
      image: productModal.image,
      sku: productModal.sku,
      color: productModal.color,
      releaseDate: new Date().toISOString().split('T')[0],
      stock: stockObj
    };

    const url = productModal.mode === 'add' 
      ? `${API_URL}/products` 
      : `${API_URL}/products/${productModal.id}`;
    
    const method = productModal.mode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'จัดการข้อมูลสินค้าไม่สำเร็จ');

      setSuccess(productModal.mode === 'add' ? 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว' : 'แก้ไขข้อมูลสินค้าสำเร็จ');
      setProductModal({ ...productModal, isOpen: false });
      
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const triggerDeleteProduct = (id, name) => {
    setDeleteConfirm({
      isOpen: true, targetId: id, targetName: name
    });
  };

  const executeDeleteProduct = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/products/${deleteConfirm.targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('ไม่สามารถลบสินค้าออกจากคลังได้');

      setSuccess('ลบสินค้าเรียบร้อยแล้ว');
      setDeleteConfirm({ isOpen: false, targetId: null, targetName: '' });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setDeleteConfirm({ isOpen: false, targetId: null, targetName: '' });
    }
  };

  /* STREAMING_CHUNK: Processing data filters... */
  const filteredOrders = orders.filter(order => {
    const email = getSafeEmail(order).toLowerCase();
    const id = (order.id || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return email.includes(query) || id.includes(query);
  });

  const filteredProducts = products.filter(prod => {
    const name = (prod.name || '').toLowerCase();
    const brand = (prod.brand || '').toLowerCase();
    const sku = (prod.sku || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || brand.includes(query) || sku.includes(query);
  });

  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'ชำระเงินสำเร็จ');
  const totalSales = paidOrders.reduce((sum, o) => sum + getSafeTotal(o), 0);
  const pendingSlipCount = orders.filter(o => getThaiStatus(o.paymentStatus, o.orderStatus) === 'ได้รับออเดอร์').length;

  return (
    <divv style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', color: '#000000' }}>
      
      <div style={{ padding: '32px 40px', maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* หัวข้อแอดมิน */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '24px' }}>⚙️</span>
          <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '0.5px' }}>
            Admin Panel
          </h1>
        </div>

        {/* เมนูแท็บสลับหน้าจอ */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              backgroundColor: activeTab === 'dashboard' ? '#1e293b' : '#f1f5f9', 
              color: activeTab === 'dashboard' ? '#ffffff' : '#475569', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              backgroundColor: activeTab === 'products' ? '#1e293b' : '#f1f5f9', 
              color: activeTab === 'products' ? '#ffffff' : '#475569', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Products
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              backgroundColor: activeTab === 'orders' ? '#1e293b' : '#f1f5f9', 
              color: activeTab === 'orders' ? '#ffffff' : '#475569', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Orders
          </button>
          <button 
            onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              backgroundColor: activeTab === 'reviews' ? '#1e293b' : '#f1f5f9', 
              color: activeTab === 'reviews' ? '#ffffff' : '#475569', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Reviews
          </button>
          <button 
            onClick={() => { setActiveTab('promotions'); setSearchTerm(''); }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              backgroundColor: activeTab === 'promotions' ? '#1e293b' : '#f1f5f9', 
              color: activeTab === 'promotions' ? '#ffffff' : '#475569', 
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Promotions
          </button>
        </div>

        {/* แสดงผลการตอบกลับจากระบบ */}
        {success && (
          <div style={{ padding: '16px', backgroundColor: '#10b981', color: '#ffffff', marginBottom: '24px', fontWeight: 'bold', fontSize: '14px', borderRadius: '8px' }}>
            ✓ {success}
          </div>
        )}
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#ef4444', color: '#ffffff', marginBottom: '24px', fontWeight: 'bold', fontSize: '14px', borderRadius: '8px' }}>
            ⚠️ ข้อผิดพลาด: {error}
          </div>
        )}

        {/* ฟิลด์การสืบค้นหาข้อมูล */}
        {activeTab !== 'dashboard' && (
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder={activeTab === 'products' ? "ค้นหาชื่อรุ่นสินค้า แบรนด์ หรือรหัส SKU..." : "ค้นหาตามเลขออเดอร์ หรืออีเมลลูกค้า..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
          </div>
        )}

        {/* ==========================================
            แท็บ Dashboard
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>ยอดขายสุทธิทั้งหมด</span>
                <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#10b981', margin: '8px 0 0 0' }}>
                  ฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                </h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>จำนวนคำสั่งซื้อรวม</span>
                <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#0f172a', margin: '8px 0 0 0' }}>
                  {orders.length} ออเดอร์
                </h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>ได้รับออเดอร์แล้ว</span>
                <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#ffb703', margin: '8px 0 0 0' }}>
                  {pendingSlipCount} รายการ
                </h3>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>รองเท้าในระบบคลัง</span>
                <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: '8px 0 0 0' }}>
                  {products.length} รายการ
                </h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#0f172a' }}>📊 สัดส่วนประเภทรุ่นสินค้าที่ขายดีที่สุด</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '160px', fontSize: '13px', fontWeight: 'bold' }}>Samba OG Shoes</span>
                  <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#1e293b', width: '70%', height: '100%' }}></div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>70%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '160px', fontSize: '13px', fontWeight: 'bold' }}>New Balance 530</span>
                  <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#475569', width: '45%', height: '100%' }}></div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>45%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '160px', fontSize: '13px', fontWeight: 'bold' }}>Puma Speedcat OG</span>
                  <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#94a3b8', width: '20%', height: '100%' }}></div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>20%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            แท็บ Products
            ========================================== */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button 
                onClick={openAddProductModal}
                style={{ padding: '12px 24px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                ＋ เพิ่มสินค้าใหม่ในคลัง
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#737373' }}>
                กำลังซิงค์และเชื่อมข้อมูลรองเท้า...
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e5e5' }}>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '15%' }}>SKU</th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '40%' }}>ชื่อสินค้า</th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '15%' }}>แบรนด์</th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '15%' }}>ราคา</th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '15%' }}>ตัวเลือก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '48px 24px', textAlign: 'center', color: '#737373' }}>
                          📭 ไม่พบประวัติรองเท้าในคลังระบบ
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(prod => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                          <td style={{ padding: '20px 24px', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{prod.sku}</td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={prod.image} alt={prod.name} style={{ width: '44px', height: '44px', objectFit: 'contain', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{prod.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>สี: {prod.color || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>{prod.brand}</td>
                          <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: '900' }}>฿{prod.price.toLocaleString()}</td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => openEditProductModal(prod)}
                                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                แก้ไข
                              </button>
                              <button 
                                onClick={() => triggerDeleteProduct(prod.id, prod.name)}
                                style={{ padding: '8px 12px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            แท็บ Orders - จำกัดเฉพาะ 4 สถานะพรีเมียมตัวจริง (ได้รับออเดอร์, กำลังจัดเตรียม, ส่งพัสดุแล้ว, สำเร็จเรียบร้อย)
            ========================================== */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#737373', fontSize: '14px', fontWeight: 'bold' }}>
                กำลังดาวน์โหลดคำสั่งซื้อและซิงค์ข้อมูล...
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e5e5' }}>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '25%' }}>
                        เลขที่ออเดอร์
                      </th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '35%' }}>
                        อีเมลลูกค้า
                      </th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '20%' }}>
                        ยอดรวม
                      </th>
                      <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: '900', color: '#000000', width: '20%' }}>
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '48px 24px', textAlign: 'center', color: '#737373', fontSize: '14px' }}>
                          📭 ไม่พบรายการข้อมูลออเดอร์ในระบบ
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => {
                        const customerEmail = getSafeEmail(order);
                        const displayTotal = getSafeTotal(order);
                        
                        // ถอดรหัสค่าจากฐานข้อมูลให้สวมเข้ากับ 4 สเต็ปของ UI โดยไม่มีสถานะส่วนเกินแอบแฝง
                        const currentStatus = getThaiStatus(order.paymentStatus, order.orderStatus);

                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                            <td style={{ padding: '20px 24px' }}>
                              <span style={{ color: '#0062ff', fontWeight: 'bold', fontSize: '14px' }}>
                                {order.id}
                              </span>
                            </td>

                            <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                              {customerEmail || <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>ไม่มีข้อมูลอีเมล</span>}
                            </td>

                            <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: '900', color: '#000000' }}>
                              ฿{displayTotal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                            </td>

                            <td style={{ padding: '20px 24px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <select 
                                  value={currentStatus}
                                  disabled={updatingId === order.id}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  style={{
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 14px center',
                                    paddingRight: '36px',
                                    transition: 'all 0.1s ease-in-out',
                                    ...getStatusSelectStyle(currentStatus)
                                  }}
                                >
                                  {/* บังคับและจำกัดให้มีเฉพาะ 4 สถานะสากลหลักอย่างแท้จริง ไร้ปุ่มส่วนเกินซ้ำซ้อน */}
                                  <option value="ได้รับออเดอร์">ได้รับออเดอร์</option>
                                  <option value="กำลังจัดเตรียม">กำลังจัดเตรียม</option>
                                  <option value="ส่งพัสดุแล้ว">ส่งพัสดุแล้ว</option>
                                  <option value="สำเร็จเรียบร้อย">สำเร็จเรียบร้อย</option>
                                </select>

                                {updatingId === order.id && (
                                  <span style={{ fontSize: '11px', color: '#737373' }}>⏳ บันทึก...</span>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <ManageReviews />
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <ManagePromotions />
        )}

      </div>

      {/* พรีเมียม Modal: สำหรับจัดการ เพิ่ม/แก้ไข สินค้าคลัง */}
      {productModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 24px 0' }}>
              {productModal.mode === 'add' ? '＋ เพิ่มสินค้าตัวใหม่ในคลัง' : '📝 แก้ไขข้อมูลสินค้าคลัง'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ชื่อรุ่นรองเท้า</label>
                <input required type="text" value={productModal.name} onChange={e => setProductModal({...productModal, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="เช่น Samba OG Shoes White Black" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>แบรนด์สินค้า</label>
                  <select value={productModal.brand} onChange={e => setProductModal({...productModal, brand: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', backgroundColor: '#ffffff' }}>
                    <option value="adidas">adidas</option>
                    <option value="New Balance">New Balance</option>
                    <option value="Puma">Puma</option>
                    <option value="Nike">Nike</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ราคา (บาท)</label>
                  <input required type="number" value={productModal.price} onChange={e => setProductModal({...productModal, price: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="3500" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>รหัส SKU</label>
                  <input required type="text" value={productModal.sku} onChange={e => setProductModal({...productModal, sku: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>โทนสีสินค้า</label>
                  <input type="text" value={productModal.color} onChange={e => setProductModal({...productModal, color: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} placeholder="White/Black/Gum" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ภาพลิงก์พรีวิว URL</label>
                  <input type="text" value={productModal.image} onChange={e => setProductModal({...productModal, image: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>สต็อกไซส์พื้นฐาน (จำนวน)</label>
                  <input required type="number" value={productModal.stock} onChange={e => setProductModal({...productModal, stock: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setProductModal({...productModal, isOpen: false})}
                  style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: '#000000', color: '#ffffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  บันทึกลงระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* พรีเมียม Modal: สั่งยืนยันลบข้อมูลรองเท้าจากระบบ */}
      {deleteConfirm.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '32px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>⚠️</span>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' }}>ยืนยันลบข้อมูลสินค้าออกจากคลัง</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              คุณแน่ใจใช่หรือไม่ที่จะทำการลบ <strong style={{ color: '#0f172a' }}>{deleteConfirm.targetName}</strong> ออกจากคลังขายระบบและฐานข้อมูล NeonDB?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, targetId: null, targetName: '' })}
                style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={executeDeleteProduct}
                style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ยืนยันลบถาวร
              </button>
            </div>
          </div>
        </div>
      )}

    </divv>
  );
}