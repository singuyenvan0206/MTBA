'use client';

import { useEffect, useState } from 'react';

type Seat = {
  id: number;
  screen_id: number;
  seat_number: string;
  type: string;
  is_booked: boolean;
  screen?: { name: string, screen_name?: string, theater_id?: number, theater?: { name: string } };
};

export default function AdminSeats() {
  const [data, setData] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showBulkTypeModal, setShowBulkTypeModal] = useState(false);
  const [bulkType, setBulkType] = useState('STANDARD');
  const [screens, setScreens] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    screen_id: '',
    seat_number: '',
    type: 'STANDARD',
    is_booked: 'false'
  });

  const [filterTheaterId, setFilterTheaterId] = useState<string>('');
  const [filterScreenId, setFilterScreenId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = () => {
    fetch('/api/seats')
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
    fetch('/api/screens').then(res => res.json()).then(setScreens);
    fetch('/api/theaters').then(res => res.json()).then(setTheaters);
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ screen_id: '', seat_number: '', type: 'STANDARD', is_booked: 'false' });
    setShowModal(true);
  };

  const openEditModal = (item: Seat) => {
    setEditingId(item.id);
    setFormData({
      screen_id: String(item.screen_id),
      seat_number: item.seat_number || '',
      type: item.type || 'STANDARD',
      is_booked: String(item.is_booked || false)
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghế này?')) return;
    fetch(`/api/seats/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Xóa ghế thành công!');
        fetchData();
      })
      .catch(err => alert('Lỗi khi xóa ghế'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `/api/seats/${editingId}`
      : '/api/seats';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      screen_id: parseInt(formData.screen_id),
      seat_number: formData.seat_number,
      type: formData.type,
      is_booked: formData.is_booked === 'true'
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm ghế thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert('Lỗi khi lưu ghế'));
  };

  const filteredData = data.filter((item: any) => {
    let match = true;
    if (filterTheaterId) {
      const theaterId = item.screen?.theater_id || screens.find(s => s.id === item.screen_id)?.theater_id;
      if (String(theaterId) !== filterTheaterId) match = false;
    }
    if (filterScreenId && String(item.screen_id) !== filterScreenId) match = false;
    if (filterType && item.type !== filterType) match = false;
    return match;
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
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} ghế đã chọn?`)) {
      try {
        const res = await fetch('/api/seats/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) {
          alert('Xóa thành công!');
          setSelectedIds([]);
          fetchData();
        } else {
          alert('Lỗi khi xóa ghế');
        }
      } catch (err) {
        alert('Lỗi kết nối khi xóa ghế');
      }
    }
  };

  const handleBulkUpdateType = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/seats/bulk-update-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, type: bulkType })
      });
      if (res.ok) {
        alert('Cập nhật loại ghế thành công!');
        setShowBulkTypeModal(false);
        setSelectedIds([]);
        fetchData();
      } else {
        alert('Lỗi khi cập nhật ghế');
      }
    } catch (err) {
      alert('Lỗi kết nối khi cập nhật ghế');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Ghế</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <>
              <button 
                onClick={() => setShowBulkTypeModal(true)}
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                Đổi Loại {selectedIds.length} ghế
              </button>
              <button 
                onClick={handleDeleteSelected}
                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                Xóa {selectedIds.length} ghế đã chọn
              </button>
            </>
          )}
          <button 
            onClick={openAddModal}
            style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            + Thêm Ghế Mới
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo cụm rạp</label>
          <select 
            value={filterTheaterId} onChange={e => { setFilterTheaterId(e.target.value); setFilterScreenId(''); }}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
          >
            <option value="" style={{ color: '#000' }}>Tất cả cụm rạp</option>
            {theaters.map(t => <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo phòng chiếu</label>
          <select 
            value={filterScreenId} onChange={e => setFilterScreenId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
          >
            <option value="" style={{ color: '#000' }}>Tất cả phòng chiếu</option>
            {screens.filter(s => !filterTheaterId || String(s.theater_id) === filterTheaterId).map(s => (
              <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.name || s.screen_name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: 'var(--text-muted)' }}>Lọc theo loại ghế</label>
          <select 
            value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
          >
            <option value="" style={{ color: '#000' }}>Tất cả loại ghế</option>
            <option value="STANDARD" style={{ color: '#000' }}>Thường (STANDARD)</option>
            <option value="VIP" style={{ color: '#000' }}>VIP</option>
            <option value="SWEETBOX" style={{ color: '#000' }}>Giường nằm (SWEETBOX)</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', width: '50px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Tên Ghế</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Phòng chiếu</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại Ghế</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Trạng thái</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item: any) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                <tr key={item.id} style={{ backgroundColor: isSelected ? 'rgba(255, 77, 79, 0.1)' : 'transparent' }}>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelect(item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>#{item.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>
                    {item.seat_number}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    {item.screen?.theater?.name && <span style={{fontSize: '12px', color: 'var(--text-muted)', display: 'block'}}>{item.screen.theater.name}</span>}
                    {item.screen?.name || item.screen?.screen_name || `Phòng ${item.screen_id}`}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', 
                      backgroundColor: item.type === 'VIP' ? 'rgba(255, 193, 7, 0.2)' : item.type === 'SWEETBOX' ? 'rgba(233, 30, 99, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: item.type === 'VIP' ? '#ffc107' : item.type === 'SWEETBOX' ? '#e91e63' : 'var(--text-muted)'
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', backgroundColor: item.is_booked ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)', color: item.is_booked ? '#dc3545' : '#28a745' }}>
                      {item.is_booked ? 'Đã đặt' : 'Trống'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              )})
            ) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có ghế nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Ghế' : 'Thêm Ghế Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Phòng chiếu</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  value={formData.screen_id} onChange={e => setFormData({...formData, screen_id: e.target.value})}
                >
                  <option value="" style={{ color: '#000' }}>-- Chọn phòng chiếu --</option>
                  {screens.map(s => (
                    <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.name || s.screen_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Tên Ghế</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: A1"
                  value={formData.seat_number} onChange={e => setFormData({...formData, seat_number: e.target.value.toUpperCase()})}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại Ghế</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="STANDARD" style={{ color: '#000' }}>Thường (STANDARD)</option>
                  <option value="VIP" style={{ color: '#000' }}>VIP</option>
                  <option value="SWEETBOX" style={{ color: '#000' }}>Giường nằm (SWEETBOX)</option>
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Trạng thái</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  value={formData.is_booked} onChange={e => setFormData({...formData, is_booked: e.target.value})}
                >
                  <option value="false" style={{ color: '#000' }}>Trống</option>
                  <option value="true" style={{ color: '#000' }}>Đã đặt</option>
                </select>
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

      {/* Modal Đổi Loại Ghế Hàng Loạt */}
      {showBulkTypeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '10px', width: '400px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--foreground)' }}>Đổi loại cho {selectedIds.length} ghế</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--foreground)' }}>Chọn loại ghế mới</label>
              <select 
                value={bulkType} 
                onChange={e => setBulkType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                required
              >
                <option value="STANDARD" style={{ color: '#000' }}>Thường (STANDARD)</option>
                <option value="VIP" style={{ color: '#000' }}>VIP</option>
                <option value="SWEETBOX" style={{ color: '#000' }}>Giường nằm (SWEETBOX)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowBulkTypeModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleBulkUpdateType} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
