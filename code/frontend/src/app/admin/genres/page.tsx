'use client';

import { useEffect, useState } from 'react';

export default function GenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    genre_name: '',
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = () => {
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => {
        setGenres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ genre_name: '' });
    setShowModal(true);
  };

  const openEditModal = (g: any) => {
    setEditingId(g.id);
    setFormData({ genre_name: g.genre_name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await fetch(`/api/genres/${id}`, { method: 'DELETE' });
        fetchGenres();
      } catch (err) {
        alert('Lỗi khi xóa thể loại');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/genres/${editingId}` 
      : '/api/genres';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchGenres();
      } else {
        alert('Có lỗi xảy ra khi lưu.');
      }
    } catch (err) {
      alert('Lỗi kết nối server.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--foreground)' }}>Quản lý Thể loại Phim</h1>
        <button onClick={openAddModal} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
          + Thêm Thể loại
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--card-border)', color: 'var(--foreground)' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Tên Thể loại</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : genres.length > 0 ? (
              genres.map((g: any) => (
                <tr key={g.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{g.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <strong style={{ color: 'var(--foreground)' }}>{g.genre_name}</strong>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(g)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(g.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có dữ liệu thể loại.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Sửa thông tin Thể loại' : 'Thêm Thể loại Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tên Thể loại</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: Hành động"
                  value={formData.genre_name} onChange={e => setFormData({...formData, genre_name: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ff4d4f', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
