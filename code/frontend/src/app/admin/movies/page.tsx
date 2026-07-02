"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';


import { useEffect, useState } from 'react';
import { MovieType } from '@/types/enums';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
type Movie = {
  id: number;
  title: string;
  genre?: string;
  genres?: string[];
  duration: number;
  posterUrl?: string;
  bannerUrl?: string;
  releaseDate?: string;
  type?: string;
  roomtype_id?: number;
  roomtype_ids?: number[];
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

  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: '4px', opacity: sortKey === col ? 1 : 0.3, fontSize: '11px' }}>
      {sortKey === col ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
    </span>
  );

  const [showModal, setShowModal] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [ageLimits, setAgeLimits] = useState<any[]>([]);
  const [roomtypes, setRoomtypes] = useState<any[]>([]);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    genres: [] as string[],
    duration: '',
    releaseDate: '',
    posterUrl: '',
    bannerUrl: '',
    roomtype_ids: [] as string[],
    description: '',
    author: '',
    actors: '',
    ageLimit: '',
    trailer: ''
  });


  const fetchMovies = () => {
    fetch(API_ENDPOINTS.MOVIES)
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
    fetch(API_ENDPOINTS.GENRES)
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error(err));
    fetch(API_ENDPOINTS.AGELIMITS)
      .then(res => res.json())
      .then(data => setAgeLimits(data))
      .catch(err => console.error(err));
    fetch(API_ENDPOINTS.ROOMTYPES)
      .then(res => res.json())
      .then(data => setRoomtypes(data))
      .catch(err => console.error(err));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '', genres: [], duration: '', releaseDate: '',
      posterUrl: '', bannerUrl: '', roomtype_ids: roomtypes.length > 0 ? [String(roomtypes[0].id)] : [], description: '',
      author: '', actors: '', ageLimit: '', trailer: ''
    });

    setShowModal(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingId(movie.id);
    setFormData({
      title: movie.title || '',
      genres: movie.genres || (movie.genre ? movie.genre.split(', ') : []),
      duration: movie.duration ? String(movie.duration) : '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      posterUrl: movie.posterUrl || '',
      bannerUrl: movie.bannerUrl || '',
      roomtype_ids: movie.roomtype_ids ? movie.roomtype_ids.map(id => String(id)) : (movie.roomtype_id ? [String(movie.roomtype_id)] : []),
      description: movie.description || '',
      author: movie.author || '',
      actors: movie.actors || '',
      ageLimit: movie.ageLimit || '',
      trailer: movie.trailer || ''
    });

    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm(UI_MESSAGES.X_C_NH_N_X_A_PHIM)) return;
    const adminUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || '{}');
    fetch(`${API_ENDPOINTS.MOVIES_}${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminUser.accessToken || ''}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.error || 'Lỗi khi xóa phim');
        }
        return res.json();
      })
      .then(() => {
        alert(UI_MESSAGES.X_A_PHIM_TH_NH_C_NG);
        fetchMovies();
      })
      .catch(err => alert(err.message));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId
      ? `${API_ENDPOINTS.MOVIES_}${editingId}`
      : API_ENDPOINTS.MOVIES;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const payload = {
        ...formData,
        duration: parseInt(String(formData.duration)) || 0,
        roomtype_ids: formData.roomtype_ids.map(id => parseInt(id)).filter(id => !isNaN(id)),
      };

      const adminUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || '{}');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.accessToken || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = Array.isArray(err.message) ? err.message[0] : (err.message || err.error || 'Lỗi lưu dữ liệu');
        throw new Error(errMsg);
      }
      const savedMovie = await res.json();
      const movieId = editingId || savedMovie.id;


      alert(editingId ? 'Cập nhật thành công!' : 'Thêm phim thành công!');
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      alert(UI_MESSAGES.L_I_KHI_L_U_PHIM);
    }
  };

  const filteredMovies = movies.filter((movie: any) => {
    let match = true;
    if (searchTerm && !movie.title.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
    if (filterAgeLimit && movie.ageLimit !== filterAgeLimit) match = false;
    if (filterStatus) {
      const isComingSoon = new Date(movie.releaseDate) > new Date();
      if (filterStatus === MOVIE_STATUS.COMING_SOON && !isComingSoon) match = false;
      if (filterStatus === MOVIE_STATUS.SHOWING && isComingSoon) match = false;
    }
    return match;
  });

  const sortedMovies = [...filteredMovies].sort((a: any, b: any) => {
    let valA: any, valB: any;
    if (sortKey === 'id') { valA = a.id; valB = b.id; }
    else if (sortKey === 'title') { valA = a.title?.toLowerCase(); valB = b.title?.toLowerCase(); }
    else if (sortKey === 'duration') { valA = a.duration; valB = b.duration; }
    else if (sortKey === 'releaseDate') { valA = new Date(a.releaseDate).getTime(); valB = new Date(b.releaseDate).getTime(); }
    else { valA = a[sortKey]; valB = b[sortKey]; }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
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
            <option value={MOVIE_STATUS.SHOWING}>Đang chiếu</option>
            <option value={MOVIE_STATUS.COMING_SOON}>Sắp chiếu</option>
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
              <th onClick={() => handleSort('id')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>ID <SortIcon col="id" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Poster</th>
              <th onClick={() => handleSort('title')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Tên Phim <SortIcon col="title" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Thể loại</th>
              <th onClick={() => handleSort('duration')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Thời lượng <SortIcon col="duration" /></th>
              <th onClick={() => handleSort('releaseDate')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Trạng thái <SortIcon col="releaseDate" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : sortedMovies.length > 0 ? (
              sortedMovies.map((movie: any) => {
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
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thể loại (Có thể chọn nhiều)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', maxHeight: '150px', overflowY: 'auto' }}>
                    {genres.map(g => (
                      <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--foreground)' }}>
                        <input
                          type="checkbox"
                          value={g.genre_name}
                          checked={formData.genres.includes(g.genre_name)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({ ...formData, genres: [...formData.genres, e.target.value] });
                            } else {
                              setFormData({ ...formData, genres: formData.genres.filter(val => val !== e.target.value) });
                            }
                          }}
                        />
                        {g.genre_name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời lượng (phút)</label>
                  <input
                    type="number" required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: 120"
                    value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Ngày khởi chiếu</label>
                  <input
                    type="date" required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Định dạng (Có thể chọn nhiều)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', maxHeight: '150px', overflowY: 'auto' }}>
                    {roomtypes.map(rt => (
                      <label key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--foreground)' }}>
                        <input
                          type="checkbox"
                          value={rt.id}
                          checked={formData.roomtype_ids.includes(String(rt.id))}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({ ...formData, roomtype_ids: [...formData.roomtype_ids, e.target.value] });
                            } else {
                              setFormData({ ...formData, roomtype_ids: formData.roomtype_ids.filter(val => val !== e.target.value) });
                            }
                          }}
                        />
                        {rt.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tác giả (Đạo diễn)</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: Victor Vũ"
                    value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Diễn viên</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                    placeholder="Ví dụ: Trấn Thành, Hari Won"
                    value={formData.actors} onChange={e => setFormData({ ...formData, actors: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Độ tuổi</label>
                  <select
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                    value={formData.ageLimit} onChange={e => setFormData({ ...formData, ageLimit: e.target.value })}
                  >
                    <option value="">-- Chọn Độ tuổi --</option>
                    {ageLimits.map(al => (
                      <option key={al.id} value={al.code}>{al.code} ({al.description})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>URL Ảnh Banner <span style={{ color: '#888', fontWeight: '400', fontSize: '12px' }}>(landscape 16:9, dùng cho hero section trang chủ)</span></label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="https://... (tỷ lệ 16:9)"
                  value={formData.bannerUrl} onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>URL Ảnh Poster <span style={{ color: '#888', fontWeight: '400', fontSize: '12px' }}>(portrait 2:3, dùng cho danh sách phim)</span></label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="https://..."
                  value={formData.posterUrl} onChange={e => setFormData({ ...formData, posterUrl: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>URL Trailer</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="https://youtube.com/..."
                  value={formData.trailer} onChange={e => setFormData({ ...formData, trailer: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Mô tả</label>
                <textarea
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Nội dung phim..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
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
