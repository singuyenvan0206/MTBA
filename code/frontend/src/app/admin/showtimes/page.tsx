'use client';

import { useEffect, useState } from 'react';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
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
  const [theaters, setTheaters] = useState<any[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    movie_id: '',
    screen_id: '',
    start_time: '',
    end_time: ''
  });

  const fetchData = () => {
    fetch(API_ENDPOINTS.SHOWTIMES)
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
    fetch(API_ENDPOINTS.MOVIES).then(res => res.json()).then(setMovies);
    fetch(API_ENDPOINTS.SCREENS).then(res => res.json()).then(setScreens);
    fetch(API_ENDPOINTS.THEATERS).then(res => res.json()).then(setTheaters);
  }, []);

  const [weeklySchedules, setWeeklySchedules] = useState<any>({
    'T2': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'T3': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'T4': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'T5': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'T6': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'T7': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' },
    'CN': { checked: false, times: '09:00, 12:00, 15:00, 18:00, 20:00, 22:00' }
  });
  const [baseDate, setBaseDate] = useState<string>(''); // For weekly generation
  const [isBulkMode, setIsBulkMode] = useState<boolean>(true); // Mode to switch

  // Auto-update weekly schedules based on room type
  useEffect(() => {
    if (formData.screen_id && isBulkMode) {
      const selectedScreen = screens.find(s => s.id === parseInt(formData.screen_id));
      if (selectedScreen?.roomtype?.name) {
        const roomTypeName = selectedScreen.roomtype.name.toUpperCase();
        let defaultTimes = '09:00, 12:00, 15:00, 18:00, 20:00, 22:00';
        
        if (roomTypeName === '3D') {
          // 4 slots, 4hr gap, start 12:00
          defaultTimes = '12:00, 16:00, 20:00, 00:00';
        } else if (roomTypeName === 'IMAX') {
          // 5 slots, 4hr gap, start 10:30
          defaultTimes = '10:30, 14:30, 18:30, 22:30, 02:30';
        }
        
        setWeeklySchedules({
          'T2': { checked: false, times: defaultTimes },
          'T3': { checked: false, times: defaultTimes },
          'T4': { checked: false, times: defaultTimes },
          'T5': { checked: false, times: defaultTimes },
          'T6': { checked: false, times: defaultTimes },
          'T7': { checked: false, times: defaultTimes },
          'CN': { checked: false, times: defaultTimes }
        });
      }
    }
  }, [formData.screen_id, screens, isBulkMode]);

  const openAddModal = () => {
    setEditingId(null);
    setSelectedTheater('');
    setFormData({ movie_id: '', screen_id: '', start_time: '', end_time: '' });
    setBaseDate(new Date().toISOString().slice(0, 10)); // Default to today
    setIsBulkMode(true);
    setShowModal(true);
  };

  const openEditModal = (item: Showtime) => {
    setEditingId(item.id);
    setIsBulkMode(false);
    
    // Tìm rạp chứa phòng chiếu này để set selectedTheater
    const screen = screens.find(s => s.id === item.screen_id);
    if (screen) setSelectedTheater(String(screen.theater_id));
    else setSelectedTheater('');

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
    fetch(`${API_ENDPOINTS.SHOWTIMES_}${id}`, { method: 'DELETE' })
      .then(() => {
        alert(UI_MESSAGES.X_A_L_CH_CHI_U_TH_NH_C_NG);
        fetchData();
      })
      .catch(err => alert(UI_MESSAGES.L_I_KHI_X_A_L_CH_CHI_U));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.movie_id || !formData.screen_id) {
      alert(UI_MESSAGES.VUI_L_NG_CH_N_PHIM_V__PH_NG_CH);
      return;
    }

    if (editingId || !isBulkMode) {
      // Single create/update
      const url = editingId 
        ? `${API_ENDPOINTS.SHOWTIMES_}${editingId}`
        : API_ENDPOINTS.SHOWTIMES;
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        movie_id: parseInt(formData.movie_id),
        screen_id: parseInt(formData.screen_id),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const errMsg = Array.isArray(err.message) ? err.message[0] : (err.message || err.error || 'Lỗi khi lưu lịch chiếu');
          throw new Error(errMsg);
        }
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm lịch chiếu thành công!');
        setShowModal(false);
        fetchData();
      } catch (err: any) {
        alert(err.message || UI_MESSAGES.L_I_KHI_L_U_L_CH_CHI_U);
      }
    } else {
      // Bulk create using weekly schedule
      if (!baseDate) {
        alert(UI_MESSAGES.VUI_L_NG_CH_N_NG_Y_B_T___U__P);
        return;
      }

      try {
        const startDate = new Date(baseDate);
        const dayMap: Record<number, string> = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };
        const movie = movies.find(m => m.id === parseInt(formData.movie_id));
        const duration = movie?.duration || 120;
        
        let createdCount = 0;
        let hasError = false;
        let errorMsg = '';

        for (let i = 0; i < 7; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const dayStr = dayMap[d.getDay()];
          const schedule = weeklySchedules[dayStr as keyof typeof weeklySchedules];
          
          if (schedule && schedule.checked) {
            const times = schedule.times.split(',').map((t: string) => t.trim()).filter(Boolean);
            for (const timeStr of times) {
              const [hours, minutes] = timeStr.split(':');
              if (hours && minutes) {
                const stDate = new Date(d);
                stDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                const res = await fetch(API_ENDPOINTS.SHOWTIMES, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    movie_id: parseInt(formData.movie_id),
                    screen_id: parseInt(formData.screen_id),
                    start_time: stDate.toISOString(),
                    end_time: new Date(stDate.getTime() + duration * 60000).toISOString()
                  })
                });
                
                if (!res.ok) {
                  hasError = true;
                  const err = await res.json().catch(() => ({}));
                  errorMsg = Array.isArray(err.message) ? err.message[0] : (err.message || err.error || 'Lỗi khi lưu lịch chiếu');
                  break;
                }
                
                createdCount++;
              }
            }
            if (hasError) break;
          }
        }

        if (hasError) {
          throw new Error(errorMsg);
        }

        alert(UI_MESSAGES.CREATE_SUCCESS_SHOWTIMES);
        setShowModal(false);
        fetchData();
      } catch (err: any) {
        alert(err.message || UI_MESSAGES.L_I_KHI_L_U_L_CH_CHI_U);
        fetchData();
      }
    }
  };

  const [filterMovieId, setFilterMovieId] = useState<string>('');
  const [filterTheaterId, setFilterTheaterId] = useState<string>('');
  const [filterScreenId, setFilterScreenId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterTime, setFilterTime] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredData = data.filter((item: any) => {
    let match = true;
    if (filterMovieId && String(item.movie_id) !== filterMovieId) match = false;
    if (filterTheaterId) {
      const theaterId = item.screen?.theater_id || screens.find(s => s.id === item.screen_id)?.theater_id;
      if (String(theaterId) !== filterTheaterId) match = false;
    }
    if (filterScreenId && String(item.screen_id) !== filterScreenId) match = false;
    if (filterDate) {
      const itemDate = new Date(item.start_time).toISOString().slice(0, 10);
      if (itemDate !== filterDate) match = false;
    }
    if (filterTime) {
      const stDate = new Date(item.start_time);
      const hours = String(stDate.getHours()).padStart(2, '0');
      const minutes = String(stDate.getMinutes()).padStart(2, '0');
      if (`${hours}:${minutes}` !== filterTime) match = false;
    }
    return match;
  }).sort((a: any, b: any) => {
    const getWeight = (item: any) => {
      const name = (item.screen?.roomtype?.name || '').toUpperCase();
      if (name.includes('2D')) return 1;
      if (name.includes('3D')) return 2;
      if (name.includes('IMAX')) return 3;
      return 4;
    };
    const weightA = getWeight(a);
    const weightB = getWeight(b);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((item: any) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} lịch chiếu đã chọn?`)) {
      try {
        const res = await fetch(API_ENDPOINTS.SHOWTIMES_BULKDELETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) {
          alert(UI_MESSAGES.X_A_TH_NH_C_NG);
          setSelectedIds([]);
          fetchData();
        } else {
          alert(UI_MESSAGES.L_I_KHI_X_A_L_CH_CHI_U);
        }
      } catch (err) {
        alert(UI_MESSAGES.L_I_K_T_N_I_KHI_X_A_L_CH_CHI_U);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Lịch Chiếu</h1>
        <div>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginRight: '10px' }}
            >
              Xóa {selectedIds.length} đã chọn
            </button>
          )}
          <button 
            onClick={openAddModal}
            style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            + Thêm Lịch Chiếu
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo Phim</label>
          <select value={filterMovieId} onChange={e => setFilterMovieId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
            <option value="">-- Tất cả phim --</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo Cụm Rạp</label>
          <select
            value={filterTheaterId}
            onChange={e => { setFilterTheaterId(e.target.value); setFilterScreenId(''); }}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
          >
            <option value="">-- Tất cả rạp --</option>
            {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo Phòng chiếu</label>
          <select
            value={filterScreenId}
            onChange={e => setFilterScreenId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
          >
            <option value="">-- Tất cả phòng --</option>
            {screens
              .filter(s => !filterTheaterId || String(s.theater_id) === filterTheaterId)
              .map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || s.screen_name}{s.roomtype?.name ? ` (${s.roomtype.name})` : ''}
                </option>
              ))
            }
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo Ngày chiếu</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo Giờ chiếu</label>
          <input type="time" value={filterTime} onChange={e => setFilterTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={() => { setFilterMovieId(''); setFilterTheaterId(''); setFilterScreenId(''); setFilterDate(''); setFilterTime(''); }} style={{ padding: '8px 15px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--foreground)', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '37px' }}>Xóa bộ lọc</button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', width: '40px', borderBottom: '1px solid var(--card-border)' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredData.length && filteredData.length > 0} />
              </th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Phim</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Rạp / Phòng chiếu</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giờ bắt đầu</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giờ kết thúc</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} />
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.movie?.title || item.movie_id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.screen?.theater?.name || theaters.find(t => t.id === item.screen?.theater_id)?.name || ''}</div>
                    <div>{item.screen?.name || item.screen?.screen_name || item.screen_id}</div>
                  </td>
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
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có lịch chiếu nào phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Lịch chiếu' : 'Thêm Lịch chiếu Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Phim</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.movie_id} onChange={e => setFormData({...formData, movie_id: e.target.value, screen_id: ''})}
                >
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Cụm rạp</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={selectedTheater} onChange={e => { setSelectedTheater(e.target.value); setFormData({...formData, screen_id: ''}); }}
                >
                  <option value="">-- Chọn Cụm Rạp --</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Phòng chiếu</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.screen_id} onChange={e => setFormData({...formData, screen_id: e.target.value})}
                  disabled={!selectedTheater && theaters.length > 0}
                >
                  <option value="">-- Chọn Phòng chiếu --</option>
                  {screens.filter(s => {
                    const matchesTheater = !selectedTheater || String(s.theater_id) === selectedTheater;
                    const selectedMovie = formData.movie_id ? movies.find(m => m.id === parseInt(formData.movie_id)) : null;
                    const matchesRoomtype = (!formData.movie_id || !selectedMovie || !selectedMovie.roomtype_ids || selectedMovie.roomtype_ids.length === 0) ? true : selectedMovie.roomtype_ids.includes(s.roomtype_id);
                    return matchesTheater && matchesRoomtype;
                  }).map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.screen_name} {s.roomtype?.name ? `(${s.roomtype.name})` : ''}</option>
                  ))}
                </select>
                {(!selectedTheater && theaters.length > 0) && <small style={{ color: '#ff4d4f' }}>Vui lòng chọn cụm rạp trước</small>}
              </div>

              {isBulkMode ? (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Ngày bắt đầu áp dụng</label>
                    <input 
                      type="date" required 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                      value={baseDate} onChange={e => setBaseDate(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--foreground)' }}>Lịch chiếu trong tuần</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 15px 0' }}>Tick chọn ngày và nhập các khung giờ (phân cách bằng dấu phẩy, VD: 09:00, 12:00, 14:00)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                      {Object.entries(weeklySchedules).map(([dayKey, schedule]: any) => (
                        <div key={dayKey} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '60px', cursor: 'pointer', color: 'var(--foreground)' }}>
                            <input 
                              type="checkbox" 
                              checked={schedule.checked}
                              onChange={(e) => setWeeklySchedules({
                                ...weeklySchedules,
                                [dayKey]: { ...schedule, checked: e.target.checked }
                              })}
                            />
                            {dayKey}
                          </label>
                          <input 
                            type="text"
                            disabled={!schedule.checked}
                            placeholder="VD: 09:00, 12:00"
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: schedule.checked ? 'transparent' : 'rgba(255,255,255,0.1)', color: 'var(--foreground)' }}
                            value={schedule.times}
                            onChange={(e) => setWeeklySchedules({
                                ...weeklySchedules,
                                [dayKey]: { ...schedule, times: e.target.value }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời gian bắt đầu</label>
                    <input 
                      type="datetime-local" required 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                      value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Thời gian kết thúc</label>
                    <input 
                      type="datetime-local" required 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                      value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
                </>
              )}

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
