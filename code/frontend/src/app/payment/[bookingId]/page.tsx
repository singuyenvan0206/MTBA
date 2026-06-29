'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentMethod, MovieType } from '@/types/enums';
import { AppMessage } from '@/types/messages';

import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
export default function Payment() {
  const router = useRouter();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.TRANSFER); // CASH, TRANSFER, CARD, EWALLET
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [paymentConfig, setPaymentConfig] = useState({
    bankId: 'TPB',
    accountNo: '00000003137',
    accountName: 'NGUYEN VAN SI'
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [statusModal, setStatusModal] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'success' | 'error' | 'confirm'; 
    onConfirm?: () => void 
  } | null>(null);

  useEffect(() => {
    if (!showSuccessModal) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showSuccessModal, router]);

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
    if (!booking || method !== PaymentMethod.TRANSFER || showSuccessModal) return;

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
            setSuccessMessage(AppMessage.PAYMENT_TRANSFER_SUCCESS);
            setShowSuccessModal(true);
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [booking, method, bookingId, router, showSuccessModal]);

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
      setShowExpiredModal(true);
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setShowExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };



  const executeCancelBooking = async () => {
    setStatusModal(null);
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
        setStatusModal({
          show: true,
          title: AppMessage.TITLE_CANCEL_SUCCESS,
          message: AppMessage.CANCEL_SUCCESS,
          type: 'success',
          onConfirm: () => {
            setStatusModal(null);
            router.push('/');
          }
        });
      } else {
        const data = await res.json();
        setStatusModal({
          show: true,
          title: AppMessage.TITLE_CANCEL_FAILED,
          message: data.message || AppMessage.CANCEL_FAILED,
          type: 'error'
        });
      }
    } catch (err) {
      setStatusModal({
        show: true,
        title: AppMessage.TITLE_CONNECTION_ERROR,
        message: AppMessage.CANCEL_CONNECTION_ERROR,
        type: 'error'
      });
    }
  };

  const handleCancelBooking = () => {
    setStatusModal({
      show: true,
      title: AppMessage.TITLE_CANCEL_CONFIRM,
      message: AppMessage.CANCEL_CONFIRM,
      type: 'confirm',
      onConfirm: executeCancelBooking
    });
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
                    <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                        {[PaymentMethod.TRANSFER, PaymentMethod.CARD, PaymentMethod.EWALLET].map(m => {
                            const isTransfer = m === PaymentMethod.TRANSFER;
                            return (
                                <label 
                                    key={m} 
                                    className={`method-option ${isTransfer ? 'active' : ''}`} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        padding: '15px', 
                                        border: `1px solid ${isTransfer ? '#ff4d4f' : '#333'}`, 
                                        borderRadius: '8px', 
                                        cursor: isTransfer ? 'pointer' : 'not-allowed', 
                                        background: isTransfer ? 'rgba(255,77,79,0.1)' : 'rgba(255,255,255,0.02)',
                                        opacity: isTransfer ? 1 : 0.5
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="radio" 
                                            name="payment_method" 
                                            value={m} 
                                            checked={isTransfer} 
                                            disabled={!isTransfer} 
                                            readOnly
                                            style={{ accentColor: '#ff4d4f' }} 
                                        />
                                        <span>
                                            {m === PaymentMethod.CARD ? 'Thẻ Ngân hàng' : m === PaymentMethod.TRANSFER ? 'Chuyển khoản (VietQR)' : 'Ví thanh toán'}
                                        </span>
                                    </div>
                                    {!isTransfer && (
                                        <span style={{ fontSize: '11px', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Coming soon</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>

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

        {/* Success Modal */}
        {showSuccessModal && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '45px 30px', borderRadius: '15px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', marginBottom: '20px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#fff', fontWeight: 'bold' }}>Thanh toán thành công!</h2>
                    <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '15px', lineHeight: '1.6' }}>
                        {successMessage}
                        <br />
                        <span style={{ fontSize: '13px', color: '#ff4d4f', fontWeight: 'bold' }}>Tự động chuyển hướng sau {countdown} giây...</span>
                    </p>
                    <button onClick={() => router.push('/profile')} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                        Xem thông tin vé ngay
                    </button>
                </div>
            </div>
        )}

        {/* Expired Modal */}
        {showExpiredModal && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '45px 30px', borderRadius: '15px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>Hết Thời Gian Giữ Ghế</h3>
                    <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>
                        {AppMessage.PAYMENT_SESSION_EXPIRED || "Thời gian giữ ghế của bạn đã kết thúc. Vui lòng thực hiện đặt vé lại."}
                    </p>
                    <button onClick={() => router.push('/')} className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                        Quay lại Trang chủ
                    </button>
                </div>
            </div>
        )}

        {/* Status Modal (Success, Error, Confirm) */}
        {statusModal && statusModal.show && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {statusModal.type === 'success' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                    )}
                    {statusModal.type === 'error' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                    )}
                    {statusModal.type === 'confirm' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                    )}
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>{statusModal.title}</h3>
                    <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>{statusModal.message}</p>
                    
                    {statusModal.type === 'confirm' ? (
                        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                            <button onClick={() => setStatusModal(null)} className="btn btn-outline" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                                Đóng
                            </button>
                            <button onClick={statusModal.onConfirm} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                                Xác nhận
                            </button>
                        </div>
                    ) : (
                        <button onClick={statusModal.onConfirm || (() => setStatusModal(null))} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        )}
    </main>
  );
}
