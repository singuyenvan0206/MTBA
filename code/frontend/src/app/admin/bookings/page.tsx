'use client';

import React, { useEffect, useState } from 'react';
import { PaymentStatus, PaymentMethod } from '@/types/enums';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ status: PaymentStatus.PENDING, method: PaymentMethod.CASH, id: null as any });

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openPaymentModal = (booking: any) => {
    setEditingBooking(booking);
    const pm = booking.payment?.[0] || {};
    setPaymentData({ 
      status: pm.payment_status || PaymentStatus.PENDING, 
      method: pm.payment_method || PaymentMethod.CASH,
      id: pm.id || null
    });
    setShowModal(true);
  };

  const savePayment = async () => {
    try {
      if (paymentData.id) {
        // Cập nhật payment cũ
        await fetch(`/api/payments/${paymentData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: paymentData.status, payment_method: paymentData.method })
        });
      } else {
        // Tạo payment mới
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: editingBooking.id,
            payment_status: paymentData.status,
            payment_method: paymentData.method,
            amount: editingBooking.total_price_movie
          })
        });
      }
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      alert('Lỗi khi lưu thanh toán');
    }
  };

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
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Thanh toán</th>
                  <th style={{ textAlign: 'left', padding: '15px', borderBottom: '1px solid var(--card-border)' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map((b: any) => {
                  const pm = b.payment?.[0];
                  return (
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
                    <td style={{ padding: '15px', opacity: 0.8, fontSize: '13px' }}>
                      {new Date(b.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {pm ? (
                        <div>
                          <div style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '5px', backgroundColor: pm.payment_status === PaymentStatus.COMPLETED ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: pm.payment_status === PaymentStatus.COMPLETED ? '#34d399' : '#fbbf24', fontSize: '12px', fontWeight: 'bold' }}>
                            {pm.payment_status === PaymentStatus.COMPLETED ? 'Đã TT' : 'Chưa TT'}
                          </div>
                          <div style={{ fontSize: '11px', marginTop: '5px', opacity: 0.6 }}>{pm.payment_method}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '5px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
                          Trống
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => openPaymentModal(b)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                          Sửa TT
                        </button>
                        <button onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa đơn này?')) {
                            fetch(`/api/bookings/${b.id}`, { method: 'DELETE' })
                              .then(() => fetchBookings())
                              .catch(err => alert('Lỗi khi xóa đơn'));
                          }
                        }} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                }) : (  <tr><td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>Chưa có dữ liệu đặt vé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Payment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1f2937', padding: '30px', borderRadius: '10px', width: '400px', border: '1px solid #374151' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Cập nhật thanh toán</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Trạng thái</label>
                <select value={paymentData.status} onChange={e => setPaymentData({...paymentData, status: e.target.value as PaymentStatus})} style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: 'white', borderRadius: '5px' }}>
                  <option value={PaymentStatus.PENDING}>Chưa thanh toán (PENDING)</option>
                  <option value={PaymentStatus.COMPLETED}>Đã thanh toán (COMPLETED)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Phương thức</label>
                <select value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value as PaymentMethod})} style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: 'white', borderRadius: '5px' }}>
                  <option value={PaymentMethod.CASH}>Tiền mặt (CASH)</option>
                  <option value={PaymentMethod.CARD}>Thẻ ngân hàng (CARD)</option>
                  <option value={PaymentMethod.EWALLET}>Ví điện tử (EWALLET)</option>
                  <option value={PaymentMethod.TRANSFER}>Chuyển khoản (TRANSFER)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: '#374151', color: 'white' }}>Hủy</button>
                <button onClick={savePayment} style={{ padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: '#3b82f6', color: 'white' }}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
