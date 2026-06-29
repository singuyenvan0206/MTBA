'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentMethod, PaymentStatus, MovieType } from '@/types/enums';
import { AppMessage } from '@/types/messages';

import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
export default function Payment() {
  const router = useRouter();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CARD); // CASH, TRANSFER, CARD, EWALLET
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [paymentConfig, setPaymentConfig] = useState({
    bankId: 'TPB',
    accountNo: '00000003137',
    accountName: 'NGUYEN VAN SI'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER);
    const token = storedUser ? JSON.parse(storedUser).accessToken : '';

    fetch(API_ENDPOINTS.PAYMENTS_CONFIG, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.bankId) {
          setPaymentConfig(data);
        }
      })
      .catch(err => console.error('Lỗi khi tải cấu hình thanh toán:', err));
  }, []);

  useEffect(() => {
    // Gọi API lấy thông tin booking với Auth token
    const storedUser = localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER);
    const token = storedUser ? JSON.parse(storedUser).accessToken : '';

    fetch(`${API_ENDPOINTS.BOOKINGS_}${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  // Polling check trạng thái thanh toán từ backend mỗi 3s khi chọn TRANSFER
  useEffect(() => {
    if (!booking || method !== PaymentMethod.TRANSFER) return;

    const storedUser = localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER);
    const token = storedUser ? JSON.parse(storedUser).accessToken : '';

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.PAYMENTS_STATUS_}${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            alert(AppMessage.PAYMENT_TRANSFER_SUCCESS);
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [booking, method, bookingId, router]);

  useEffect(() => {
    if (!booking) return;

    const calculateTimeLeft = () => {
      const createdTime = new Date(booking.created_at).getTime();
      const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
      const remaining = 300 - elapsedSeconds; // 5 minutes holding time
      return remaining > 0 ? remaining : 0;
    };

    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft <= 0) {
      alert(AppMessage.PAYMENT_SESSION_EXPIRED);
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        alert(AppMessage.PAYMENT_SESSION_EXPIRED);
        router.push('/');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    if (timeLeft !== null && timeLeft <= 0) {
      alert(AppMessage.PAYMENT_SESSION_EXPIRED);
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER) || '{}');
      const res = await fetch(API_ENDPOINTS.PAYMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'customer',
          'x-user-id': String(user.id || '')
        },
        body: JSON.stringify({
          booking_id: parseInt(bookingId as string),
          payment_method: method,
          payment_status: PaymentStatus.COMPLETED,
          amount: booking.total_price_movie || 0
        })
      });

      if (res.ok) {
        alert(AppMessage.PAYMENT_SUCCESS);
        router.push('/');
      } else {
        const errorData = await res.json();
        alert(errorData.message || AppMessage.PAYMENT_FAILED);
      }
    } catch (err) {
      alert(AppMessage.PAYMENT_CONNECTION_ERROR);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm(AppMessage.CANCEL_CONFIRM)) {
      return;
    }

    try {
      const storedUser = localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER);
      const token = storedUser ? JSON.parse(storedUser).accessToken : '';

      const res = await fetch(`${API_ENDPOINTS.BOOKINGS_}${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert(AppMessage.CANCEL_SUCCESS);
        router.push('/');
      } else {
        const data = await res.json();
        alert(data.message || AppMessage.CANCEL_FAILED);
      }
    } catch (err) {
      alert(AppMessage.CANCEL_CONNECTION_ERROR);
    }
  };

  if (loading) return <div className="text-center  py-20">Đang tải thông tin...</div>;
  if (!booking) return <div className="text-center  py-20">Không tìm thấy đơn đặt vé.</div>;

  return (
    <main className="main-content">
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
                            <p style={{ color: '#ff4d4f', margin: '5px 0', fontWeight: 'bold' }}>{(booking.showtime?.movie?.type || MovieType.TYPE_2D).replace(/^TYPE_/, '')}</p>
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
                    {timeLeft !== null && (
                        <div style={{
                            color: '#ff4d4f',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            backgroundColor: 'rgba(255, 77, 79, 0.1)',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 77, 79, 0.2)',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>⏳ Thời gian giữ ghế:</span>
                            <span style={{ fontSize: '18px', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Phương thức thanh toán</h3>
                    <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[PaymentMethod.TRANSFER, PaymentMethod.CARD, PaymentMethod.EWALLET].map(m => (
                            <label key={m} className={`method-option ${method === m ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${method === m ? '#ff4d4f' : '#444'}`, borderRadius: '8px', cursor: 'pointer', background: method === m ? 'rgba(255,77,79,0.1)' : 'transparent' }}>
                                <input type="radio" name="payment_method" value={m} checked={method === m} onChange={() => setMethod(m)} style={{ accentColor: '#ff4d4f' }} />
                                <span>{m === PaymentMethod.CARD ? 'Thẻ Ngân hàng' : m === PaymentMethod.TRANSFER ? 'Chuyển khoản (VietQR)' : 'Ví thanh toán'}</span>
                            </label>
                        ))}
                    </div>

                    {method === PaymentMethod.TRANSFER && (
                        <div style={{
                            marginTop: '25px',
                            padding: '20px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '15px', color: '#fff' }}>Quét mã VietQR để thanh toán</p>
                            
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '15px',
                                borderRadius: '8px',
                                display: 'inline-block',
                                marginBottom: '15px'
                            }}>
                                <img 
                                    src={`https://img.vietqr.io/image/${paymentConfig.bankId}-${paymentConfig.accountNo}-compact.png?amount=${booking.total_price_movie}&addInfo=MTBA${booking.id}&accountName=${encodeURIComponent(paymentConfig.accountName)}`} 
                                    alt="VietQR Code" 
                                    style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                                />
                            </div>

                            <div style={{ textAlign: 'left', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Ngân hàng:</span>
                                    <strong style={{ color: '#fff' }}>{paymentConfig.bankId}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Số tài khoản:</span>
                                    <strong style={{ color: '#fff' }}>{paymentConfig.accountNo}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Chủ tài khoản:</span>
                                    <strong style={{ color: '#fff' }}>{paymentConfig.accountName}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Số tiền:</span>
                                    <strong style={{ color: '#ff4d4f' }}>{booking.total_price_movie?.toLocaleString()}đ</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '4px', border: '1px dashed rgba(255, 77, 79, 0.3)' }}>
                                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Nội dung:</span>
                                    <strong style={{ color: '#ff4d4f', fontFamily: 'monospace', fontSize: '15px' }}>MTBA{booking.id}</strong>
                                </div>
                            </div>
                        </div>
                    )}

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
                        {method === PaymentMethod.TRANSFER ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '15px',
                                border: '1px dashed #ff4d4f',
                                borderRadius: '8px',
                                background: 'rgba(255, 77, 79, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div className="spinner" style={{
                                    width: '24px',
                                    height: '24px',
                                    border: '3px solid rgba(255,77,79,0.3)',
                                    borderTop: '3px solid #ff4d4f',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '15px' }}>Đang chờ thanh toán chuyển khoản...</span>
                                <span style={{ color: '#888', fontSize: '13px' }}>Hệ thống tự động nhận diện giao dịch sau vài giây</span>
                            </div>
                        ) : (
                            <button className="btn btn-primary w-100" onClick={handlePayment} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>Thanh toán</button>
                        )}
                        
                        <button 
                            onClick={handleCancelBooking} 
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                fontSize: '15px', 
                                fontWeight: 'bold',
                                color: '#ff4d4f',
                                backgroundColor: 'transparent',
                                border: '1px solid #ff4d4f',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 77, 79, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Hủy đặt vé & Giải phóng ghế
                        </button>
                        
                        <a href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className="back-link" style={{ textAlign: 'center', color: '#888', textDecoration: 'none' }}>Quay lại</a>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
