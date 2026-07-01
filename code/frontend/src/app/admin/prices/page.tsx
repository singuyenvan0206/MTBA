'use client';

import { useEffect, useState } from 'react';
import { SeatType, MovieType } from '@/types/enums';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';
type TicketPrice = {
  id: number;
  type_seat: string;
  type_movie?: string;
  roomtype_id?: number;
  roomtype?: { name: string };
  price: number;
  day_type: boolean;
  start_time?: string;
  end_time?: string;
};

export default function AdminPrices() {
  const [data, setData] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [roomtypes, setRoomtypes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type_seat: SeatType.STANDARD,
    roomtype_id: '',
    day_type: 'false',
    price: ''
  });

  const fetchData = () => {
    fetch(API_ENDPOINTS.PRICES)
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
    fetch(API_ENDPOINTS.ROOMTYPES)
      .then(res => res.json())
      .then(d => setRoomtypes(d))
      .catch(err => console.error(err));
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ type_seat: SeatType.STANDARD, roomtype_id: roomtypes.length > 0 ? String(roomtypes[0].id) : '', day_type: 'false', price: '' });
    setShowModal(true);
  };

  const openEditModal = (item: TicketPrice) => {
    setEditingId(item.id);
    setFormData({
      type_seat: (item.type_seat as SeatType) || SeatType.STANDARD,
      roomtype_id: item.roomtype_id ? String(item.roomtype_id) : (roomtypes.length > 0 ? String(roomtypes[0].id) : ''),
      day_type: String(item.day_type || false),
      price: String(item.price || '')
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giá vé này?')) return;
    const adminUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || '{}');
    fetch(`${API_ENDPOINTS.PRICES_}${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminUser.accessToken || ''}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.error || UI_MESSAGES.L_I_KHI_X_A_GI__V);
        }
        alert(UI_MESSAGES.X_A_GI__V__TH_NH_C_NG);
        fetchData();
      })
      .catch(err => alert(err.message));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `${API_ENDPOINTS.PRICES_}${editingId}`
      : API_ENDPOINTS.PRICES;
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      type_seat: formData.type_seat,
      roomtype_id: parseInt(formData.roomtype_id) || null,
      day_type: formData.day_type === 'true',
      price: parseFloat(formData.price),
      start_time: new Date('1970-01-01T00:00:00Z').toISOString(),
      end_time: new Date('1970-01-01T23:59:59Z').toISOString()
    };

    const adminUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || '{}');

    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser.accessToken || ''}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const errMsg = Array.isArray(err.message) ? err.message[0] : (err.message || err.error || UI_MESSAGES.L_I_KHI_L_U_GI__V);
          throw new Error(errMsg);
        }
        return res.json();
      })
      .then(() => {
        alert(editingId ? 'Cập nhật giá vé thành công!' : 'Thêm giá vé thành công!');
        setShowModal(false);
        fetchData();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--foreground)' }}>Quản lý Giá Vé</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          + Thêm Giá Mới
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại ghế</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại phim</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Loại ngày</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '500' }}>Giá tiền</th>
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
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold', color: 'var(--foreground)' }}>{item.type_seat === SeatType.STANDARD ? 'Thường' : (item.type_seat === SeatType.VIP ? SEAT_TYPES.VIP : 'Sweetbox')}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.roomtype?.name || item.roomtype_id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{item.day_type ? 'Cuối tuần / Lễ' : 'Ngày thường'}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid var(--card-border)' }}>
                    <button onClick={() => openEditModal(item)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' }}>Sửa</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Không có dữ liệu giá vé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--foreground)' }}>
              {editingId ? 'Cập nhật thông tin Giá vé' : 'Thêm Giá vé Mới'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại ghế</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.type_seat} onChange={e => setFormData({...formData, type_seat: e.target.value as SeatType})}
                >
                  <option value={SeatType.STANDARD}>Thường</option>
                  <option value={SeatType.VIP}>VIP</option>
                  <option value={SeatType.SWEETBOX}>Sweetbox (Ghế đôi)</option>
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Loại ngày</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                  value={formData.day_type} onChange={e => setFormData({...formData, day_type: e.target.value})}
                >
                  <option value="false">Ngày thường (T2 - T6)</option>
                  <option value="true">Cuối tuần / Ngày Lễ</option>
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: 'var(--foreground)' }}>Giá tiền (VNĐ)</label>
                <input 
                  type="number" required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                  placeholder="Ví dụ: 80000"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
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
