"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';


import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosSync } from '@/hooks/usePosSync';
import { AppMessage } from '@/types/messages';
import { UserRole } from '@/types/enums';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { APP_ROUTES } from '@/constants/routes';
export default function Booking() {
  const router = useRouter();
  const params = useParams();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showtime, setShowtime] = useState<any>(null);
  const { pushState } = usePosSync(true);

  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'error', onConfirm?: () => void) => {
    setStatusModal({
      show: true,
      type,
      title: type === 'success' ? AppMessage.TITLE_SUCCESS : AppMessage.TITLE_NOTIFICATION,
      message,
      onConfirm
    });
  };

  // Giả lập danh sách ghế
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const seatsPerRow = 14;

  useEffect(() => {
    // POS không cần bắt buộc đăng nhập (hoặc dùng admin user)
    const storedUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Giả lập user admin cho POS nếu chưa đăng nhập
      setUser({ id: 1, role: UserRole.ADMIN, fullName: 'Nhân viên POS' });
    }

    if (params?.showtimeId) {
      // Lấy thông tin showtime
      fetch(`${API_ENDPOINTS.SHOWTIMES_}${params.showtimeId}`)
        .then(res => res.json())
        .then(data => setShowtime(data))
        .catch(err => console.error('Lỗi khi tải showtime:', err));

      // Lấy danh sách ghế đã đặt
      fetch(`${API_ENDPOINTS.BOOKINGS_BOOKEDSEATS}?showtimeId=${params.showtimeId}`)
        .then(res => res.json())
        .then(data => setBookedSeats(data))
        .catch(err => console.error('Lỗi khi tải ghế:', err));
    }
  }, [router, params?.showtimeId]);

  useEffect(() => {
    pushState({ selectedSeats });
  }, [selectedSeats, pushState]);

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      showAlert(AppMessage.POS_BOOKING_SELECT_SEAT);
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: parseInt(params?.showtimeId as string),
          seats: selectedSeats,
          totalPrice: selectedSeats.length * 80000
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`${APP_ROUTES.POS2}/payment/${data.id}`);
      } else {
        showAlert(AppMessage.POS_BOOKING_ERROR);
      }
    } catch (err) {
      showAlert(AppMessage.POS_BOOKING_CONNECTION_ERROR);
    }
  };

  return (
    <main className="main-content">
        <div className="container breadcrumb" style={{ margin: '20px auto', color: '#888', fontSize: '14px' }}>
            <Link href={APP_ROUTES.POS2} style={{ color: '#ff4d4f', textDecoration: 'none' }}>Trang chủ</Link> {'>'} <span>Chọn Ghế</span>
        </div>

        <section className="seat-selection-section container" style={{ padding: '30px', backgroundColor: 'var(--card-bg)', borderRadius: '10px', marginTop: '20px' }}>
            <div className="seat-header">
                <p><strong>Phim: {showtime?.movie?.title || 'Đang tải...'}</strong></p>
                <p><strong>Giờ chiếu: {showtime ? new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'} - {showtime ? new Date(showtime.start_time).toLocaleDateString('vi-VN') : '...'}</strong></p>
            </div>
            
            <div className="screen-area" style={{ textAlign: 'center' }}>
                <div className="screen-curve"></div>
                <p style={{ color: '#888', fontSize: '18px', fontWeight: 'bold', letterSpacing: '8px', marginTop: '15px', textShadow: '0 0 10px rgba(255, 152, 0, 0.5)' }}>MÀN HÌNH</p>
                <div style={{ marginTop: '20px', marginBottom: '10px', color: '#ccc', fontSize: '16px' }}>Phòng chiếu: {showtime?.screen?.name || '...'}</div>
            </div>

            <div className="seat-grid-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', overflowX: 'auto', paddingBottom: '20px' }}>
                
                {/* Cửa trái */}
                <div style={{ textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
                    <div style={{ width: '20px', height: '50px', border: '2px solid #555', borderRight: 'none', marginBottom: '10px', borderRadius: '5px 0 0 5px' }}></div>
                    <p style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 0, letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>LỐI RA / VÀO ⬅</p>
                </div>

                <div className="seat-grid">
                    {rows.map(row => (
                        <div key={row} className="seat-row">
                            {Array.from({ length: seatsPerRow }).map((_, i) => {
                                const seatId = `${row}${i + 1}`;
                                const isSelected = selectedSeats.includes(seatId);
                                const isBooked = bookedSeats.includes(seatId);
                                
                                let seatClass = 'standard';
                                if (row === 'H' || row === 'J') seatClass = 'vip';
                                if (row === AGE_LIMITS.K) seatClass = 'couple';

                                return (
                                    <div
                                        key={seatId}
                                        className={`seat ${seatClass} ${isBooked ? 'sold' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => !isBooked && toggleSeat(seatId)}
                                    >
                                        {isBooked ? 'X' : seatId}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Cửa phải */}
                <div style={{ textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
                    <div style={{ width: '20px', height: '50px', border: '2px solid #555', borderLeft: 'none', marginBottom: '10px', borderRadius: '0 5px 5px 0' }}></div>
                    <p style={{ writingMode: 'vertical-rl', margin: 0, letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>➡ LỐI RA / VÀO</p>
                </div>
            </div>

            <div className="seat-legend">
                <div className="legend-item"><span className="seat sold">X</span> Đã đặt</div>
                <div className="legend-item"><span className="seat selected"></span> Ghế bạn chọn</div>
                <div className="legend-item"><span className="seat standard"></span> Ghế thường</div>
                <div className="legend-item"><span className="seat vip"></span> Ghế VIP</div>
                <div className="legend-item"><span className="seat couple"></span> Ghế đôi</div>
            </div>

            <div className="booking-summary">
                <div className="summary-info">
                    <p>Ghế đã chọn: <strong className="selected-seats-text" style={{ color: '#ff4d4f' }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}</strong></p>
                    <p>Tổng tiền: <strong className="total-price">{(selectedSeats.length * 80000).toLocaleString('vi-VN')}đ</strong></p>
                </div>
                <div className="summary-actions">
                    <button className="btn btn-outline" onClick={() => router.back()}>Quay lại</button>
                    <button className="btn btn-primary" onClick={handleCheckout}>Thanh toán</button>
                </div>
            </div>
        </section>

        {/* Status Modal */}
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
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>{statusModal.title}</h3>
                    <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>{statusModal.message}</p>
                    <button onClick={statusModal.onConfirm || (() => setStatusModal(null))} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                        Đóng
                    </button>
                </div>
            </div>
        )}
    </main>
  );
}
