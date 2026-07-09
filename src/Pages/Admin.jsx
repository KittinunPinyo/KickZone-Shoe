import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function Admin({ currentUser, products, newProduct, setNewProduct, handleAddProduct, handleDeleteProduct, handleEditProduct, orders, handleUpdateOrderStatus }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  if (currentUser !== 'admin') return <Navigate to="/" />;

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);

  const startEdit = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setNewProduct({ name: product.name, brand: product.brand, price: product.price.toString(), image: product.image });
  };

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">⚙️ Admin Panel</h3>
      <div className="nav nav-pills mb-4 gap-2">
        {['dashboard', 'products', 'orders'].map(tab => (
          <button key={tab} className={`nav-link text-capitalize fw-bold ${activeTab === tab ? 'active bg-dark' : 'bg-light text-dark'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="row g-4">
          <div className="col-md-4"><div className="card p-4 bg-primary text-white text-center"><h5>ยอดขายรวม</h5><h2>฿{totalSales.toLocaleString()}</h2></div></div>
          <div className="col-md-4"><div className="card p-4 bg-success text-white text-center"><h5>ออเดอร์</h5><h2>{orders.length}</h2></div></div>
          <div className="col-md-4"><div className="card p-4 bg-warning text-dark text-center"><h5>สินค้า</h5><h2>{products.length}</h2></div></div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="card p-4 border-0 shadow-sm rounded-4">
          <form onSubmit={(e) => { e.preventDefault(); isEditing ? handleEditProduct({...newProduct, id: editId}) : handleAddProduct(e); setIsEditing(false); setNewProduct({name:"", brand:"", price:"", image:""}) }}>
            <div className="row g-3">
              <div className="col-md-4"><input className="form-control" placeholder="ชื่อสินค้า" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required/></div>
              <div className="col-md-2"><input className="form-control" placeholder="แบรนด์" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
              <div className="col-md-2"><input className="form-control" placeholder="ราคา" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required/></div>
              <div className="col-md-4"><button className="btn btn-dark w-100">{isEditing ? 'อัปเดต' : 'เพิ่มสินค้า'}</button></div>
            </div>
          </form>
          <table className="table mt-4 align-middle">
            <tbody>{products.map(p => <tr key={p.id}><td>{p.name}</td><td>฿{p.price.toLocaleString()}</td><td className="text-end"><button className="btn btn-sm btn-outline-secondary me-2" onClick={() => startEdit(p)}>แก้ไข</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(p.id)}>ลบ</button></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card p-4 border-0 shadow-sm rounded-4">
          <table className="table align-middle">
            <thead><tr><th>เลขที่ออเดอร์</th><th>อีเมลลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="text-primary fw-bold">{o.id}</td>
                  <td>{o.customer_email}</td>
                  <td>฿{Number(o.total).toLocaleString()}</td>
                  <td>
                    {/* แอดมินกดเปลี่ยนสถานะตรงนี้ มันจะวิ่งไปอัปเดตบน DB ทันที */}
                    <select 
                      className={`form-select-sm fw-bold ${o.status === 'จัดส่งแล้ว' ? 'bg-success text-white' : 'bg-warning text-dark'}`} 
                      value={o.status} 
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="รอชำระเงิน">รอชำระเงิน</option>
                      <option value="กำลังจัดเตรียมสินค้า">กำลังจัดเตรียมสินค้า</option>
                      <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}