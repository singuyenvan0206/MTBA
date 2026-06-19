'use client';

import React, { useEffect, useState } from 'react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Đặt Vé</h1>
      </div>

      <div className="premium-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Mã Vé</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Khách hàng</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Phim & Suất chiếu</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Ghế ngồi</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Tổng tiền</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '15px', opacity: 0.7, fontWeight: '500' }}>#{b.id}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600' }}>{b.user ? `${b.user.first_name} ${b.user.last_name}` : `User ID: ${b.user_id}`}</div>
                      <div style={{ fontSize: '13px', opacity: 0.7 }}>{b.user?.email || ''}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#60a5fa' }}>{b.showtime?.movie?.title || 'Phim đã xóa'}</div>
                      <div style={{ fontSize: '13px', opacity: 0.8 }}>
                        {b.showtime ? `${new Date(b.showtime.start_time).toLocaleString('vi-VN')} - Phòng ${b.showtime.screen?.name || 'N/A'}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {b.bookingseat?.length > 0 ? b.bookingseat.map((bs: any) => (
                          <span key={bs.id} style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '13px' }}>
                            {bs.seat?.seat_number || '?'}
                          </span>
                        )) : (
                          <span style={{ opacity: 0.5 }}>Không rõ</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>Tổng: {b.total_seat} ghế</div>
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#34d399' }}>{b.total_price_movie?.toLocaleString()} ₫</td>
                    <td style={{ padding: '15px', opacity: 0.6, fontSize: '13px' }}>{new Date(b.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>Chưa có dữ liệu đặt vé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
