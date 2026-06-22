'use client';

import { useEffect, useState } from 'react';

type Movie = {
  id: number;
  title: string;
  genre: string;
  duration: number;
  posterUrl?: string;
  releaseDate?: string;
  type?: string;
  description?: string;
  author?: string;
  actors?: string;
  ageLimit?: string;
  trailer?: string;
};

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAgeLimit, setFilterAgeLimit] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [ageLimits, setAgeLimits] = useState<any[]>([]);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    releaseDate: '',
    posterUrl: '',
    type: 'TYPE_2D',
    description: '',
    author: '',
    actors: '',
    ageLimit: '',
    trailer: ''
  });


  const fetchMovies = () => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMovies();
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error(err));
    fetch('/api/age-limits')
      .then(res => res.json())
      .then(data => setAgeLimits(data))
      .catch(err => console.error(err));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '', genre: '', duration: '', releaseDate: '',
      posterUrl: '', type: 'TYPE_2D', description: '',
      author: '', actors: '', ageLimit: '', trailer: ''
    });

    setShowModal(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingId(movie.id);
    setFormData({
      title: movie.title || '',
      genre: movie.genre || '',
      duration: movie.duration ? String(movie.duration) : '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      posterUrl: movie.posterUrl || '',
      type: movie.type || 'TYPE_2D',
      description: movie.description || '',
      author: movie.author || '',
      actors: movie.actors || '',
      ageLimit: movie.ageLimit || '',
      trailer: movie.trailer || ''
    });

    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return;
    fetch(`/api/movies/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa phim thành công!');
        fetchMovies();
      })
      .catch(err => alert('Lỗi khi xóa phim'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/movies/${editingId}`
      : '/api/movies';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const savedMovie = await res.json();
      const movieId = editingId || savedMovie.id;


      alert(editingId ? 'Cập nhật thành công!' : 'Thêm phim thành công!');
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      alert('Lỗi khi lưu phim');
    }
  };

  const filteredMovies = movies.filter((movie: any) => {
    let match = true;
    if (searchTerm && !movie.title.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
    if (filterAgeLimit && movie.ageLimit !== filterAgeLimit) match = false;
    if (filterStatus) {
      const isComingSoon = new Date(movie.releaseDate) > new Date();
      if (filterStatus === 'COMING_SOON' && !isComingSoon) match = false;
      if (filterStatus === 'SHOWING' && isComingSoon) match = false;
    }
    return match;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Danh sách Phim</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Phim Mới
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Tìm kiếm Tên Phim</label>
          <input type="text" placeholder="Nhập tên phim..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Trạng thái</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
            <option value="">Tất cả trạng thái</option>
            <option value="SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Độ tuổi</label>
          <select value={filterAgeLimit} onChange={e => setFilterAgeLimit(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
            <option value="">Tất cả độ tuổi</option>
            {ageLimits.map(al => (
              <option key={al.id} value={al.code}>{al.code}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterAgeLimit(''); }} style={{ padding: '8px 15px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--foreground)', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '37px' }}>Xóa bộ lọc</button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Poster</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Tên Phim</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Thể loại</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Thời lượng</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Trạng thái</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : filteredMovies.length > 0 ? (
              filteredMovies.map((movie: any) => {
                const releaseDateObj = new Date(movie.releaseDate);
                const isComingSoon = releaseDateObj > new Date();
                const statusText = isComingSoon ? 'Sắp chiếu' : 'Đang chiếu';
                const statusBg = isComingSoon ? 'rgba(255, 193, 7, 0.2)' : 'rgba(40, 167, 69, 0.2)';
                const statusColor = isComingSoon ? '#ffc107' : '#28a745';

                return (
                  <tr key={movie.id}>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{movie.id}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '70px', backgroundColor: 'var(--card-border)', borderRadius: '4px' }}></div>
                      )}
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                      <strong style={{ color: 'var(--foreground)' }}>{movie.title}</strong>
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>{movie.type}</small>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{movie.genre}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{movie.duration} phút</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                      <span style={{ backgroundColor: statusBg, color: statusColor, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {statusText}
                      </span>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                      <button onClick={() => openEditModal(movie)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                      <button onClick={() => handleDelete(movie.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có phim nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '600px', border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Phim' : 'Thêm Phim Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tên phim</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Nhập tên phim"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thể loại</label>
                  <select 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                    value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}
                  >
                    <option value="">-- Chọn Thể loại --</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.genre_name}>{g.genre_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời lượng (phút)</label>
                  <input 
                    type="number" required 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: 120"
                    value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Ngày khởi chiếu</label>
                  <input 
                    type="date" required 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Định dạng (2D/3D)</label>
                  <select 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="TYPE_2D">2D</option>
                    <option value="TYPE_3D">3D</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tác giả (Đạo diễn)</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: Victor Vũ"
                    value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Diễn viên</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: Trấn Thành, Hari Won"
                    value={formData.actors} onChange={e => setFormData({...formData, actors: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Độ tuổi</label>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                    value={formData.ageLimit} onChange={e => setFormData({...formData, ageLimit: e.target.value})}
                  >
                    <option value="">-- Chọn Độ tuổi --</option>
                    {ageLimits.map(al => (
                      <option key={al.id} value={al.code}>{al.code} ({al.description})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>URL Ảnh Poster</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="https://..."
                  value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>URL Trailer</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="https://youtube.com/..."
                  value={formData.trailer} onChange={e => setFormData({...formData, trailer: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Mô tả</label>
                <textarea 
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Nội dung phim..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
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
