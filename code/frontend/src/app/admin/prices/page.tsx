'use client';

import { useEffect, useState } from 'react';

type TicketPrice = {
  id: number;
  seat_type: string;
  day_type: string;
  price: number;
  type?: string;
};

export default function AdminPrices() {
  const [data, setData] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    seat_type: 'Thuong',
    day_type: 'Thuong',
    price: ''
  });

  const fetchData = () => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) setData(d);
        else setData([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ seat_type: 'Thuong', day_type: 'Thuong', price: '' });
    setShowModal(true);
  };

  const openEditModal = (item: TicketPrice) => {
    setEditingId(item.id);
    setFormData({
      seat_type: item.seat_type || item.type || 'Thuong',
      day_type: item.day_type || 'Thuong',
      price: String(item.price || '')
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giá vé này?')) return;
    fetch(`/api/prices/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa giá vé thành công!');
        fetchData();
      })
      .catch(err => alert('Lỗi khi xóa giá vé'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/prices/${editingId}`
      : '/api/prices';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      seat_type: formData.seat_type,
      day_type: formData.day_type,
      price: parseFloat(formData.price)
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật giá vé thành công!' : 'Thêm giá vé thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert('Lỗi khi lưu giá vé'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Giá Vé</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Giá Mới
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại ghế</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại ngày</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giá tiền</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.seat_type || item.type}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.day_type}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có dữ liệu giá vé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Giá vé' : 'Thêm Giá vé Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại ghế</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.seat_type} onChange={e => setFormData({...formData, seat_type: e.target.value})}
                >
                  <option value="Thuong">Thường</option>
                  <option value="VIP">VIP</option>
                  <option value="Sweetbox">Sweetbox (Ghế đôi)</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại ngày</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.day_type} onChange={e => setFormData({...formData, day_type: e.target.value})}
                >
                  <option value="Thuong">Ngày thường</option>
                  <option value="CuoiTuan">Cuối tuần (T7, CN)</option>
                  <option value="Le">Ngày Lễ</option>
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Giá tiền (VNĐ)</label>
                <input 
                  type="number" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: 80000"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}>
                  Hủy
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: '500' }}>
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
