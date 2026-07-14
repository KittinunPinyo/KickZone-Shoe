import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';

export default function App() {
  const navigate = useNavigate();

  // ====================================================
  // 🌟 ดึงข้อมูล User จากระบบ Login ใหม่
  // ====================================================
  const [currentUser, setCurrentUser] = useState(() => {
    // ไปดึงกุญแจชื่อ 'user' ที่ Navbar กับ Login ใช้
    const savedUser = localStorage.getItem("user");
    // ถ้ามีข้อมูล ให้แกะเอาแค่ role (เช่น 'customer' หรือ 'admin') ไปใช้งาน
    return savedUser ? JSON.parse(savedUser).role : null; 
  });

  // ข้อมูลตะกร้าและสินค้าที่สนใจ
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist")) || []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", brand: "", price: "", image: "" });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); 

  // ====================================================
  // 🌟 ดึงข้อมูลเริ่มต้น (Products & Orders)
  // ====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch('http://localhost:5000/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData.map(p => ({ ...p, id: p.id.toString(), price: Number(p.price) })));

        const ordRes = await fetch('http://localhost:5000/api/orders');
        const ordData = await ordRes.json();
        setOrders(ordData);
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchData();
  }, []);

  // ====================================================
  // 🌟 ฟังก์ชันจัดการสินค้า (CRUD)
  // ====================================================
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct) });
      const added = await res.json();
      setProducts([{...added, id: added.id.toString(), price: Number(added.price)}, ...products]);
      setNewProduct({ name: "", brand: "", price: "", image: "" });
      alert("เพิ่มสินค้าสำเร็จ!");
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  const handleEditProduct = async (updatedProduct) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${updatedProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProduct) });
      const data = await res.json();
      setProducts(products.map(p => p.id === updatedProduct.id ? {...data, id: data.id.toString(), price: Number(data.price)} : p));
      alert("อัปเดตข้อมูลสำเร็จ!");
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== id));
        alert("ลบสินค้าสำเร็จ!");
      } catch (err) { alert("เกิดข้อผิดพลาด"); }
    }
  };

  // ====================================================
  // 🌟 ฟังก์ชันจัดการคำสั่งซื้อ (Orders)
  // ====================================================
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("ไม่มีสินค้าในตะกร้า!");
    
    // ดึงอีเมลจากระบบเก็บข้อมูลใหม่
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = savedUser.email || "customer@kickzone.com"; 
    
    const newOrder = {
      id: 'KZ-' + Date.now().toString().slice(-6),
      customer_email: userEmail,
      order_date: new Date().toLocaleDateString('th-TH'),
      items: cart,
      total: cart.reduce((sum, item) => sum + Number(item.price), 0),
      status: 'รอชำระเงิน'
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
      const savedOrder = await res.json();
      setOrders([savedOrder, ...orders]);
      setCart([]);
      alert("ชำระเงินสำเร็จ บันทึกบิลลง Database แล้ว!");
      navigate('/profile');
    } catch (err) { alert("เกิดข้อผิดพลาดในการสั่งซื้อ"); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert("อัปเดตสถานะการจัดส่งเรียบร้อย! 📦");
    } catch (err) { alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ"); }
  };

  // LocalStorage Sync
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const handleAddToCart = (product) => { setCart([...cart, product]); alert(`เพิ่ม ${product.name} ลงตะกร้าแล้ว!`); };
  const toggleWishlist = (product) => {
    if (currentUser !== 'customer') return alert("กรุณาเข้าสู่ระบบก่อนครับ");
    const isExist = wishlist.find(item => item.id === product.id);
    setWishlist(isExist ? wishlist.filter(item => item.id !== product.id) : [...wishlist, product]);
  };

  const filteredProducts = products.filter(p => (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="min-vh-100 bg-white">
      {/* เอา Props บางตัวที่ไม่ได้ใช้ออกจาก Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} cart={cart} />
      
      <Routes>
        <Route path="/" element={<Home filteredProducts={filteredProducts} currentUser={currentUser} handleAddToCart={handleAddToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/product/:id" element={<ProductDetail products={products} currentUser={currentUser} handleAddToCart={handleAddToCart} />} />
        
        {/* ไม่ต้องส่ง handleLogin ไปแล้ว เพราะในไฟล์ Login.jsx จัดการตัวเองหมดแล้ว */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} currentUser={currentUser} handleCheckout={handleCheckout} />} />
        <Route path="/profile" element={<Profile currentUser={currentUser} orders={orders} />} />
        <Route path="/admin" element={
          <Admin 
            currentUser={currentUser} products={products} newProduct={newProduct} setNewProduct={setNewProduct} 
            handleAddProduct={handleAddProduct} handleDeleteProduct={handleDeleteProduct} handleEditProduct={handleEditProduct}
            orders={orders} handleUpdateOrderStatus={handleUpdateOrderStatus} 
          />
        } />
      </Routes>
    </div>
  );
}