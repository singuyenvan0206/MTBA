'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Payment() {
  const router = useRouter();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('CARD'); // CASH, TRANSFER, CARD, EWALLET

  useEffect(() => {
    // Gọi API lấy thông tin booking
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: parseInt(bookingId as string),
          payment_method: method,
          payment_status: 'COMPLETED',
          amount: booking.total_price_movie || 0
        })
      });

      if (res.ok) {
        alert('Thanh toán thành công!');
        router.push('/');
      } else {
        alert('Lỗi khi thanh toán');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    }
  };

  if (loading) return <div className="text-center  py-20">Đang tải thông tin...</div>;
  if (!booking) return <div className="text-center  py-20">Không tìm thấy đơn đặt vé.</div>;

  return (
    <main className="main-content">
        <div className="container breadcrumb" style={{ margin: '20px auto', color: '#888', fontSize: '14px' }}>
            <a href="/" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Trang chủ</a> {'>'} <a href="#" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Đặt vé</a> {'>'} <span>Thanh toán</span>
        </div>

        <div className="container layout-grid" style={{ display: 'flex', gap: '30px' }}>
            {/* Cột trái: Thông tin vé */}
            <div className="left-column" style={{ flex: 2 }}>
                <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                        <img src={booking.showtime?.movie?.image || "https://placehold.co/100x150"} alt="Poster" style={{ width: '120px', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div>
                            <h2 style={{ fontSize: '24px', margin: 0, color: '#fff' }}>{booking.showtime?.movie?.title || 'Phim đã xóa'}</h2>
                            <p style={{ color: '#ff4d4f', margin: '5px 0', fontWeight: 'bold' }}>{booking.showtime?.movie?.type || 'TYPE_2D'}</p>
                            <p style={{ color: '#888', margin: '10px 0 0 0', fontSize: '14px' }}>Thời gian đặt: {new Date(booking.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="info-grid mt-40" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px', margin: 0 }}>Mã đơn</p>
                            <p className="value" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>#{booking.id}</p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px', margin: 0 }}>Ngày giờ chiếu</p>
                            <p className="value" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{booking.showtime ? new Date(booking.showtime.start_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px', margin: 0 }}>Ghế</p>
                            <p className="value" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0, wordBreak: 'break-word' }}>
                                {booking.bookingseat?.map((bs: any) => bs.seat?.seat_number).join(', ') || 'N/A'}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px', margin: 0 }}>Cụm rạp</p>
                            <p className="value" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{booking.showtime?.screen?.theater?.name || 'N/A'}</p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px', margin: 0 }}>Phòng chiếu</p>
                            <p className="value" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{booking.showtime?.screen?.name || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px', border: '1px solid var(--card-border)', marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Thông tin thanh toán</h3>
                    <table className="payment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ textAlign: 'left', padding: '10px 0', color: '#888' }}>Danh mục</th>
                                <th style={{ textAlign: 'center', padding: '10px 0', color: '#888' }}>Số lượng</th>
                                <th style={{ textAlign: 'right', padding: '10px 0', color: '#888' }}>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '15px 0' }}>Ghế ngồi ({booking.bookingseat?.map((bs: any) => bs.seat?.seat_number).join(', ')})</td>
                                <td style={{ textAlign: 'center', padding: '15px 0' }}>{booking.total_seat || 0}</td>
                                <td style={{ textAlign: 'right', padding: '15px 0', fontWeight: 'bold' }}>{booking.total_price_movie?.toLocaleString() || 0}đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cột phải: Phương thức thanh toán */}
            <div className="right-column" style={{ flex: 1 }}>
                <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Phương thức thanh toán</h3>
                    <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {['TRANSFER', 'CARD', 'EWALLET'].map(m => (
                            <label key={m} className={`method-option ${method === m ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${method === m ? '#ff4d4f' : '#444'}`, borderRadius: '8px', cursor: 'pointer', background: method === m ? 'rgba(255,77,79,0.1)' : 'transparent' }}>
                                <input type="radio" name="payment_method" value={m} checked={method === m} onChange={() => setMethod(m)} style={{ accentColor: '#ff4d4f' }} />
                                <span>{m === 'CARD' ? 'Thẻ Ngân hàng' : m === 'TRANSFER' ? 'Chuyển khoản' : 'Ví thanh toán'}</span>
                            </label>
                        ))}
                    </div>

                    <h3 className="mt-40" style={{ marginTop: '30px', marginBottom: '20px', fontSize: '20px' }}>Chi phí</h3>
                    <div className="cost-summary" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888' }}>Thành tiền</span>
                            <span style={{ fontWeight: 'bold' }}>{booking.total_price_movie?.toLocaleString() || 0}đ</span>
                        </div>
                        <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888' }}>Phí</span>
                            <span style={{ fontWeight: 'bold' }}>0đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '1px solid #444', marginTop: '10px' }}>
                            <strong style={{ fontSize: '18px' }}>Tổng cộng:</strong>
                            <strong style={{ fontSize: '20px', color: '#ff4d4f' }}>{booking.total_price_movie?.toLocaleString() || 0}đ</strong>
                        </div>
                    </div>

                    <div className="payment-actions mt-40" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button className="btn btn-primary w-100" onClick={handlePayment} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>Thanh toán</button>
                        <a href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className="back-link" style={{ textAlign: 'center', color: '#888', textDecoration: 'none' }}>Quay lại</a>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
