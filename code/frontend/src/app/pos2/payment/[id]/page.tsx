'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PosPayment() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    if (!params?.id) return;
    
    // fetch booking details
    fetch(`/api/bookings/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const methodMap: any = {
        'CASH': 'VIETQR', // Using existing enum for CASH
        'CARD': 'VIETTEL_PAY', 
        'EWALLET': 'VNPAY'
      };
      
      const res = await fetch(`/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: methodMap[paymentMethod],
          payment_status: 'COMPLETED',
          amount: booking.total_price_movie,
          payment_time: new Date().toISOString()
        })
      });

      if (res.ok) {
        alert('Thanh toán thành công! In vé...');
        router.push('/pos2');
      } else {
        alert('Thanh toán thất bại.');
      }
    } catch (err) {
      alert('Lỗi kết nối server khi thanh toán.');
    }
  };

  if (loading) return <div className="text-center py-20 ">Đang tải thông tin thanh toán...</div>;
  if (!booking) return <div className="text-center py-20 ">Không tìm thấy mã đặt vé.</div>;

  const showtime = booking.showtime;
  const movie = showtime?.movie;
  const screen = showtime?.screen;
  const bookedSeats = booking.bookingseat?.map((bs: any) => bs.seat.seat_number) || [];

  return (
    <main className="main-content">
        <div className="container layout-grid payment-layout mt-40" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', margin: '40px auto' }}>
            
            {/* Cột trái: Thông tin phim và vé */}
            <div className="left-column">
                <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Thông tin phim</h3>
                    <div className="info-row">
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Phim</p>
                            <p className="value" id="movie-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>{movie?.title}</p>
                        </div>
                    </div>
                    <div className="info-grid mt-40" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ngày giờ chiếu</p>
                            <p className="value" id="showtime-date" style={{ fontWeight: 'bold' }}>
                              {showtime?.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : 'Đang tải...'}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ngày đặt vé</p>
                            <p className="value" id="booking-date" style={{ fontWeight: 'bold' }}>
                              {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ghế</p>
                            <p className="value" id="selected-seats" style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                              {bookedSeats.join(', ')}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Định dạng</p>
                            <p className="value" id="movie-format" style={{ fontWeight: 'bold' }}>{movie?.type || '2D'}</p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Phòng chiếu</p>
                            <p className="value" id="screen-name" style={{ fontWeight: 'bold' }}>{screen?.name}</p>
                        </div>
                    </div>
                </div>

                <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Thông tin thanh toán</h3>
                    <table className="payment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <th style={{ textAlign: 'left', padding: '10px 0', color: '#888' }}>Danh mục</th>
                                <th style={{ textAlign: 'center', padding: '10px 0', color: '#888' }}>Số lượng</th>
                                <th className="text-right" style={{ textAlign: 'right', padding: '10px 0', color: '#888' }}>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody id="ticket-list-body">
                            <tr>
                                <td style={{ padding: '15px 0', borderBottom: '1px solid #222' }}>Vé xem phim người lớn ({movie?.type || '2D'})</td>
                                <td style={{ textAlign: 'center', padding: '15px 0', borderBottom: '1px solid #222' }}>{booking.total_seat}</td>
                                <td style={{ textAlign: 'right', padding: '15px 0', borderBottom: '1px solid #222', fontWeight: 'bold' }}>{booking.total_price_movie?.toLocaleString('vi-VN')}đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cột phải: Phương thức thanh toán */}
            <div className="right-column">
                    <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Tra cứu & Khuyến mãi</h3>
                        <div className="input-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <input type="text" id="pos-phone" placeholder="Nhập SĐT khách hàng..." className="form-control" style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} />
                            <button className="btn btn-outline" style={{ whiteSpace: 'nowrap', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Tìm khách</button>
                        </div>
                        <p id="pos-user-result" style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}></p>

                        <div className="input-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <input type="text" id="pos-voucher" placeholder="Nhập mã Voucher..." className="form-control" style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} />
                            <button className="btn btn-outline" style={{ whiteSpace: 'nowrap', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Áp dụng</button>
                        </div>
                        <p id="pos-voucher-result" style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}></p>
                    </div>

                    <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Phương thức thanh toán</h3>
                        <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label className={`method-option ${paymentMethod === 'CASH' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'CASH' ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/28a745/FFF?text=Cash" alt="Cash" />
                                <span>Tiền mặt (Đã thu tiền)</span>
                            </label>
                            <label className={`method-option ${paymentMethod === 'CARD' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'CARD' ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value="CARD" checked={paymentMethod === 'CARD'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/ffc107/000?text=Card" alt="Card" />
                                <span>Quẹt thẻ POS / Chuyển khoản</span>
                            </label>
                            <label className={`method-option ${paymentMethod === 'EWALLET' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === 'EWALLET' ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value="EWALLET" checked={paymentMethod === 'EWALLET'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/17a2b8/FFF?text=Wallet" alt="EWallet" />
                                <span>Ví thanh toán (MoMo / ZaloPay)</span>
                            </label>
                        </div>
                    </div>

                    <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Chi phí</h3>
                        <div className="cost-summary">
                            <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Thành tiền</span>
                                <span id="summary-total">{booking.total_price_movie?.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Phí</span>
                                <span>0đ</span>
                            </div>
                            <div className="cost-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #444', fontWeight: 'bold', fontSize: '18px', color: '#ff4d4f' }}>
                                <span>Tổng cộng</span>
                                <span id="final-total">{booking.total_price_movie?.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <div className="payment-actions mt-40" style={{ marginTop: '30px' }}>
                            <button className="btn btn-primary w-100" id="btn-pay" onClick={handlePayment} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Thanh toán ngay</button>
                            <Link href={`/pos2/movies/${movie?.id}`} className="back-link" style={{ display: 'block', textAlign: 'center', color: '#888', textDecoration: 'underline' }}>Quay lại</Link>
                        </div>
                        
                        <p className="age-warning mt-40" style={{ fontSize: '12px', marginBottom: 0, marginTop: '20px', color: '#f0a500' }}>Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.</p>
                    </div>
            </div>
        </div>
    </main>
  );
}
