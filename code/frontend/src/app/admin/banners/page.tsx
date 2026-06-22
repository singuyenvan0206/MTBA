'use client';

import { useEffect, useState } from 'react';

type Banner = {
  id: number;
  url: string;
  type: string;
  position: string;
};

export default function AdminBanners() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    type: 'IMAGE',
    position: 'home_top'
  });

  const fetchData = () => {
    fetch('/api/banners')
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
    setFormData({ url: '', type: 'IMAGE', position: 'home_top' });
    setShowModal(true);
  };

  const openEditModal = (item: Banner) => {
    setEditingId(item.id);
    setFormData({
      url: item.url || '',
      type: item.type || 'IMAGE',
      position: item.position || 'home_top'
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    fetch(`/api/banners/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa banner thành công!');
        fetchData();
      })
      .catch(err => alert('Lỗi khi xóa banner'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/banners/${editingId}`
      : '/api/banners';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm banner thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert('Lỗi khi lưu banner'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Banner</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Banner Mới
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hình ảnh / Video</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Vị trí</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : data.length > 0 ? (
              data.map((item: Banner) => (
                <tr key={item.id} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', color: 'var(--foreground)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', color: 'var(--foreground)' }}>
                    {item.type === 'IMAGE' ? (
                      <img src={item.url} alt="Banner" style={{ width: '150px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>Link Video</a>
                    )}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: item.type === 'IMAGE' ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255, 193, 7, 0.1)', color: item.type === 'IMAGE' ? '#007bff' : '#ffc107' }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', color: 'var(--foreground)' }}>{item.position}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(item)} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Sửa</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '10px', width: '500px', maxWidth: '90%', border: '1px solid var(--card-border)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--foreground)' }}>
              {editingId ? 'Sửa Banner' : 'Thêm Banner Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--foreground)' }}>Loại</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  required
                >
                  <option value="IMAGE" style={{ color: '#000' }}>Hình ảnh (IMAGE)</option>
                  <option value="VIDEO" style={{ color: '#000' }}>Video (VIDEO)</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--foreground)' }}>Đường dẫn (URL)</label>
                <input 
                  type="text" 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--foreground)' }}>Vị trí</label>
                <input 
                  type="text" 
                  value={formData.position} 
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: home_top, slider_main..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
