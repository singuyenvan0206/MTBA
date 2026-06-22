'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    bookings: 0,
    users: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/movies').then(res => res.json()).catch(() => []),
      fetch('/api/bookings').then(res => res.json()).catch(() => []),
      fetch('/api/users').then(res => res.json()).catch(() => []),
      fetch('/api/payments').then(res => res.json()).catch(() => [])
    ]).then(([movies, bookings, users, payments]) => {
      const totalRevenue = Array.isArray(payments) ? payments.reduce((sum: number, p: any) => {
        if (p.payment_status === 'COMPLETED') {
          return sum + (p.amount || 0);
        }
        return sum;
      }, 0) : 0;
      setStats({
        movies: Array.isArray(movies) ? movies.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        revenue: totalRevenue
      });
      if (Array.isArray(bookings)) {
        setRecentBookings(bookings.slice(0, 5));
      }
    });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Tổng quan hệ thống</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="premium-card" style={{ padding: '24px', borderLeft: '4px solid #007bff' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px 0' }}>Tổng số Phim</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', margin: 0 }}>{stats.movies}</p>
        </div>
        <div className="premium-card" style={{ padding: '24px', borderLeft: '4px solid #28a745' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px 0' }}>Vé đã bán</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', margin: 0 }}>{stats.bookings}</p>
        </div>
        <div className="premium-card" style={{ padding: '24px', borderLeft: '4px solid #ffc107' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px 0' }}>Người dùng</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', margin: 0 }}>{stats.users}</p>
        </div>
        <div className="premium-card" style={{ padding: '24px', borderLeft: '4px solid #dc3545' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px 0' }}>Doanh thu</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>{stats.revenue.toLocaleString()} ₫</p>
        </div>
      </div>

      <div className="premium-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', opacity: 0.9, margin: 0 }}>Đặt vé gần đây</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {recentBookings.length > 0 ? (
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Mã vé</th>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Phim</th>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Ghế</th>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Tổng tiền</th>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '15px', opacity: 0.7, fontWeight: '500' }}>#{b.id}</td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#60a5fa' }}>{b.showtime?.movie?.title || 'N/A'}</td>
                    <td style={{ padding: '15px', opacity: 0.8 }}>{b.bookingseat?.map((bs:any)=>bs.seat?.seat_number).join(', ') || 'N/A'}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#34d399' }}>{b.total_price_movie?.toLocaleString()} ₫</td>
                    <td style={{ padding: '15px', opacity: 0.6, fontSize: '12px' }}>{new Date(b.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6, margin: 0 }}>Chưa có dữ liệu đặt vé</p>
          )}
        </div>
      </div>
    </div>
  );
}
