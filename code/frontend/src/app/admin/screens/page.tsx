'use client';

import { useEffect, useState } from 'react';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
type Screen = {
  id: number;
  name?: string;
  screen_name?: string;
  theater_id: number;
  capacity?: number;
  seat_capacity?: number;
  roomtype_id?: number;
  roomtype?: { name: string };
};

export default function AdminScreens() {
  const [data, setData] = useState<Screen[]>([]);
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
  const [theaters, setTheaters] = useState<any[]>([]);
  const [roomtypes, setRoomtypes] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    theater_id: '',
    seat_capacity: '',
    roomtype_id: ''
  });

  const [filterTheaterId, setFilterTheaterId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = () => {
    fetch(API_ENDPOINTS.SCREENS)
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) setData(d);
        else setData([]);
        setLoading(false);
        setSelectedIds([]);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    fetch(API_ENDPOINTS.THEATERS)
      .then(res => res.json())
      .then(t => setTheaters(t))
      .catch(err => console.error(err));
      
    fetch(API_ENDPOINTS.ROOMTYPES)
      .then(res => res.json())
      .then(r => setRoomtypes(r))
      .catch(err => console.error(err));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', theater_id: '', seat_capacity: '', roomtype_id: roomtypes.length > 0 ? String(roomtypes[0].id) : '' });
    setShowModal(true);
  };

  const openEditModal = (item: Screen) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || item.screen_name || '',
      theater_id: String(item.theater_id || ''),
      seat_capacity: String(item.seat_capacity || item.capacity || ''),
      roomtype_id: item.roomtype_id ? String(item.roomtype_id) : (roomtypes.length > 0 ? String(roomtypes[0].id) : '')
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) return;
    fetch(`${API_ENDPOINTS.SCREENS_}${id}`, { method: 'DELETE' })
      .then(() => {
        alert(UI_MESSAGES.X_A_PH_NG_CHI_U_TH_NH_C_NG);
        fetchData();
      })
      .catch(err => alert(UI_MESSAGES.L_I_KHI_X_A_PH_NG_CHI_U));
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} phòng chiếu đã chọn?`)) return;

    fetch(API_ENDPOINTS.SCREENS_BULKDELETE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          alert(UI_MESSAGES.X_A_TH_NH_C_NG);
          fetchData();
        } else {
          alert('Lỗi: ' + d.error);
        }
      })
      .catch(err => alert(UI_MESSAGES.L_I_KHI_X_A_H_NG_LO_T));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `${API_ENDPOINTS.SCREENS_}${editingId}`
      : API_ENDPOINTS.SCREENS;
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      name: formData.name,
      theater_id: parseInt(formData.theater_id),
      seat_capacity: parseInt(formData.seat_capacity),
      roomtype_id: parseInt(formData.roomtype_id)
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
      .catch(err => alert(UI_MESSAGES.L_I_KHI_L_U_PH_NG_CHI_U));
  };

  const filteredData = data.filter((item: any) => {
    let match = true;
    if (filterTheaterId && String(item.theater_id) !== filterTheaterId) match = false;
    return match;
  });

  const sortedFilteredData = [...filteredData].sort((a: any, b: any) => {
    let valA: any, valB: any;
    if (sortKey === 'id') { valA = a.id; valB = b.id; }
    else if (sortKey === 'name') { valA = (a.name || a.screen_name || '').toLowerCase(); valB = (b.name || b.screen_name || '').toLowerCase(); }
    else if (sortKey === 'capacity') { valA = a.seat_capacity || a.capacity || 0; valB = b.seat_capacity || b.capacity || 0; }
    else if (sortKey === 'theater') {
      valA = (theaters.find((t: any) => t.id === a.theater_id)?.name || '').toLowerCase();
      valB = (theaters.find((t: any) => t.id === b.theater_id)?.name || '').toLowerCase();
    }
    else { valA = a[sortKey]; valB = b[sortKey]; }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedFilteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
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

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--card-border)', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo cụm rạp</label>
          <select 
            value={filterTheaterId} onChange={e => setFilterTheaterId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
          >
            <option value="" style={{ color: '#000' }}>Tất cả cụm rạp</option>
            {theaters.map(t => <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.name}</option>)}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <button 
              onClick={handleDeleteSelected}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Xóa {selectedIds.length} phòng đã chọn
            </button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={sortedFilteredData.length > 0 && selectedIds.length === sortedFilteredData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('id')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>ID <SortIcon col="id" /></th>
              <th onClick={() => handleSort('name')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Tên Phòng <SortIcon col="name" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại phòng</th>
              <th onClick={() => handleSort('theater')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Cụm Rạp <SortIcon col="theater" /></th>
              <th onClick={() => handleSort('capacity')} style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>Sức chứa <SortIcon col="capacity" /></th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : sortedFilteredData.length > 0 ? (
              sortedFilteredData.map((item) => (
                <tr key={item.id} style={{ backgroundColor: selectedIds.includes(item.id) ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.name || item.screen_name}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.roomtype?.name || item.roomtype_id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    {theaters.find(t => t.id === item.theater_id)?.name || item.theater_id}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.capacity || item.seat_capacity || 'N/A'} ghế</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => {
                      if(confirm('Bạn có muốn tạo tự động các ghế cho phòng này theo sức chứa?')) {
                        fetch(API_ENDPOINTS.SEATS_GENERATE, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ screen_id: item.id })
                        })
                        .then(res => res.json())
                        .then(d => alert(UI_MESSAGES.CREATE_SUCCESS_SEATS))
                        .catch(err => alert(UI_MESSAGES.L_I_KHI_T_O_GH));
                      }
                    }} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Tạo ghế</button>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có phòng chiếu nào.</td></tr>
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại phòng</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.roomtype_id} onChange={e => setFormData({...formData, roomtype_id: e.target.value})}
                >
                  {roomtypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
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
