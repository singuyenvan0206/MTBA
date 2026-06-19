'use client';

import { useEffect, useState } from 'react';

type Screen = {
  id: number;
  name?: string;
  screen_name?: string;
  theater_id: number;
  capacity?: number;
  seat_capacity?: number;
};

export default function AdminScreens() {
  const [data, setData] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [theaters, setTheaters] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    theater_id: '',
    seat_capacity: ''
  });

  const fetchData = () => {
    fetch('/api/screens')
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
    fetch('/api/theaters')
      .then(res => res.json())
      .then(t => setTheaters(t))
      .catch(err => console.error(err));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', theater_id: '', seat_capacity: '' });
    setShowModal(true);
  };

  const openEditModal = (item: Screen) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || item.screen_name || '',
      theater_id: String(item.theater_id || ''),
      seat_capacity: String(item.seat_capacity || item.capacity || '')
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) return;
    fetch(`/api/screens/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa phòng chiếu thành công!');
        fetchData();
      })
      .catch(err => alert('Lỗi khi xóa phòng chiếu'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/screens/${editingId}`
      : '/api/screens';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      name: formData.name,
      theater_id: parseInt(formData.theater_id),
      seat_capacity: parseInt(formData.seat_capacity)
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm phòng chiếu thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert('Lỗi khi lưu phòng chiếu'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Phòng Chiếu</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Phòng Mới
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Tên Phòng</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Cụm Rạp</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Sức chứa</th>
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
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.name || item.screen_name}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    {theaters.find(t => t.id === item.theater_id)?.name || item.theater_id}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.capacity || item.seat_capacity || 'N/A'} ghế</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có phòng chiếu nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Phòng chiếu' : 'Thêm Phòng chiếu Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tên phòng chiếu</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: Phòng 1"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Cụm rạp</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.theater_id} onChange={e => setFormData({...formData, theater_id: e.target.value})}
                >
                  <option value="">-- Chọn Cụm rạp --</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Sức chứa (Số ghế)</label>
                <input 
                  type="number" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: 50"
                  value={formData.seat_capacity} onChange={e => setFormData({...formData, seat_capacity: e.target.value})}
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
