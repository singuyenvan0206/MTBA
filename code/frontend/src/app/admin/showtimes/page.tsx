'use client';

import { useEffect, useState } from 'react';

type Showtime = {
  id: number;
  movie_id: number;
  screen_id: number;
  start_time: string;
  end_time: string;
  movie?: { title: string };
  screen?: { name: string, screen_name?: string };
};

export default function AdminShowtimes() {
  const [data, setData] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    movie_id: '',
    screen_id: '',
    start_time: '',
    end_time: ''
  });

  const fetchData = () => {
    fetch('/api/showtimes')
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
    fetch('/api/movies').then(res => res.json()).then(setMovies);
    fetch('/api/screens').then(res => res.json()).then(setScreens);
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ movie_id: '', screen_id: '', start_time: '', end_time: '' });
    setShowModal(true);
  };

  const openEditModal = (item: Showtime) => {
    setEditingId(item.id);
    setFormData({
      movie_id: String(item.movie_id),
      screen_id: String(item.screen_id),
      start_time: item.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : '',
      end_time: item.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) return;
    fetch(`/api/showtimes/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa lịch chiếu thành công!');
        fetchData();
      })
      .catch(err => alert('Lỗi khi xóa lịch chiếu'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/showtimes/${editingId}`
      : '/api/showtimes';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      movie_id: parseInt(formData.movie_id),
      screen_id: parseInt(formData.screen_id),
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString()
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm lịch chiếu thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert('Lỗi khi lưu lịch chiếu'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Lịch Chiếu</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Lịch Chiếu
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Phim</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Phòng chiếu</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giờ bắt đầu</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giờ kết thúc</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : data.length > 0 ? (
              data.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.movie?.title || item.movie_id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.screen?.name || item.screen?.screen_name || item.screen_id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <span style={{ backgroundColor: 'rgba(40, 167, 69, 0.2)', color: '#28a745', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {new Date(item.start_time).toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <span style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {new Date(item.end_time).toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có lịch chiếu nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Lịch chiếu' : 'Thêm Lịch chiếu Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Phim</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.movie_id} onChange={e => setFormData({...formData, movie_id: e.target.value})}
                >
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Phòng chiếu</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.screen_id} onChange={e => setFormData({...formData, screen_id: e.target.value})}
                >
                  <option value="">-- Chọn Phòng chiếu --</option>
                  {screens.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.screen_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời gian bắt đầu</label>
                <input 
                  type="datetime-local" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời gian kết thúc</label>
                <input 
                  type="datetime-local" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
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
