'use client';

import { useEffect, useState } from 'react';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
type Theater = {
  id: number;
  name: string;
  location: string;
  phone?: string;
  theater_name?: string;
  address?: string;
};

export default function AdminCinemas() {
  const [data, setData] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: '4px', opacity: sortKey === col ? 1 : 0.3, fontSize: '11px' }}>
      {sortKey === col ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
    </span>
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: ''
  });

  const fetchData = () => {
    fetch(API_ENDPOINTS.THEATERS)
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
    setFormData({ name: '', location: '', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (item: Theater) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || item.theater_name || '',
      location: item.location || item.address || '',
      phone: item.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa rạp này?')) return;
    fetch(`${API_ENDPOINTS.THEATERS_}${id}`, { method: 'DELETE' })
      .then(() => {
        alert(UI_MESSAGES.X_A_R_P_TH_NH_C_NG);
        fetchData();
      })
      .catch(err => alert(UI_MESSAGES.L_I_KHI_X_A_R_P));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `${API_ENDPOINTS.THEATERS_}${editingId}`
      : API_ENDPOINTS.THEATERS;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật rạp thành công!' : 'Thêm rạp thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert(UI_MESSAGES.L_I_KHI_L_U_R_P));
  };

  const sortedData = [...data].sort((a: any, b: any) => {
    let valA: any = a[sortKey]?.toString().toLowerCase() ?? '';
    let valB: any = b[sortKey]?.toString().toLowerCase() ?? '';
    if (sortKey === 'id') { valA = a.id; valB = b.id; }
    else if (sortKey === 'name') { valA = (a.name || a.theater_name || '').toLowerCase(); valB = (b.name || b.theater_name || '').toLowerCase(); }
    else if (sortKey === 'location') { valA = (a.location || a.address || '').toLowerCase(); valB = (b.location || b.address || '').toLowerCase(); }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Cụm Rạp</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Rạp Mới
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>ID <SortIcon col="id" /></th>
              <th onClick={() => handleSort('name')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Tên Rạp <SortIcon col="name" /></th>
              <th onClick={() => handleSort('location')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Địa chỉ <SortIcon col="location" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>SĐT Liên hệ</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.name || item.theater_name}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.location || item.address}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.phone || 'Chưa cập nhật'}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có rạp nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Cụm Rạp' : 'Thêm Cụm Rạp Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tên Cụm Rạp</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: Rạp 1"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Địa chỉ</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: 123 Đường A..."
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Số điện thoại</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: 0123456789"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
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
