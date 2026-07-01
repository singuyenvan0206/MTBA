'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SeatType, MovieType } from '@/types/enums';
import { AppMessage } from '@/types/messages';

import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { APP_ROUTES } from '@/constants/routes';
export default function Booking() {
  const router = useRouter();
  const params = useParams();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showtime, setShowtime] = useState<any>(null);
  const [dbSeats, setDbSeats] = useState<any[]>([]);

  const [prices, setPrices] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [alertModal, setAlertModal] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'error' | 'success'; 
    onConfirm?: () => void 
  } | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    if (timeLeft <= 0) {
      setAlertModal({
        show: true,
        title: AppMessage.TITLE_EXPIRED,
        message: AppMessage.BOOKING_SESSION_EXPIRED,
        type: 'error',
        onConfirm: () => {
          setAlertModal(null);
          window.location.reload();
        }
      });
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Check login
    const storedUser = localStorage.getItem(ROLES.USER) || sessionStorage.getItem(ROLES.USER);
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (parsedUser) {
      setUser(parsedUser);
    }

    // Lấy bảng giá
    fetch(API_ENDPOINTS.PRICES)
      .then(res => res.json())
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    if (params?.showtimeId) {
      // Lấy thông tin showtime
      fetch(`${API_ENDPOINTS.SHOWTIMES_}${params.showtimeId}`)
        .then(res => res.json())
        .then(data => {
          setShowtime(data);
          if (data.screen_id) {
            // Lấy danh sách ghế của phòng chiếu này
            fetch(`${API_ENDPOINTS.SEATS}?screen_id=${data.screen_id}`)
              .then(res => res.json())
              .then(seats => setDbSeats(seats))
              .catch(err => console.error('Lỗi khi tải ghế của phòng chiếu:', err));
          }
        })
        .catch(err => console.error('Lỗi khi tải showtime:', err));

      // Lấy danh sách ghế đã đặt
      const userId = parsedUser?.id || '';
      fetch(`${API_ENDPOINTS.BOOKINGS_BOOKEDSEATS}?showtimeId=${params.showtimeId}${userId ? `&userId=${userId}` : ''}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object' && 'bookedSeats' in data) {
            setBookedSeats(data.bookedSeats);
            
            // Khôi phục ghế đã chọn từ sessionStorage nếu có
            const pendingSeatsStr = sessionStorage.getItem('pendingBookingSeats');
            if (pendingSeatsStr) {
              const pending = JSON.parse(pendingSeatsStr);
              if (String(pending.showtimeId) === String(params.showtimeId)) {
                setSelectedSeats(pending.seats);
              }
              sessionStorage.removeItem('pendingBookingSeats');
            } else if (data.myPendingBooking) {
              setSelectedSeats(data.myPendingBooking.seats);
              
              // Cập nhật lại đếm ngược theo thời gian thực của booking đang chờ
              const createdTime = new Date(data.myPendingBooking.created_at).getTime();
              const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
              const remaining = 300 - elapsedSeconds;
              if (remaining > 0) {
                setTimeLeft(remaining);
              }
            }
          } else {
            setBookedSeats(Array.isArray(data) ? data : []);
            
            // Khôi phục ghế đã chọn từ sessionStorage nếu có
            const pendingSeatsStr = sessionStorage.getItem('pendingBookingSeats');
            if (pendingSeatsStr) {
              const pending = JSON.parse(pendingSeatsStr);
              if (String(pending.showtimeId) === String(params.showtimeId)) {
                setSelectedSeats(pending.seats);
              }
              sessionStorage.removeItem('pendingBookingSeats');
            }
          }
        })
        .catch(err => console.error('Lỗi khi tải ghế đã đặt:', err));
    }
  }, [router, params?.showtimeId]);

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotalPrice = () => {
    if (!showtime?.movie) return 0;
    const showtimeRoomtypeId = showtime?.screen?.roomtype_id;
    
    const isWeekend = (dateString: string) => {
        const day = new Date(dateString).getDay();
        return day === 0 || day === 6;
    };
    const showtimeDayType = isWeekend(showtime.start_time);

    let total = 0;
    
    selectedSeats.forEach(seatId => {
      const seat = dbSeats.find(s => s.seat_number === seatId);
      const seatType = (seat?.type as SeatType) || SeatType.STANDARD;

      // Find price config matching roomtype_id, seatType and day_type
      const priceConfig = prices.find(p => p.roomtype_id === showtimeRoomtypeId && p.type_seat === seatType && p.day_type === showtimeDayType);
      
      let price = 0;
      if (priceConfig) {
        price = priceConfig.price;
      } else {
        if (seatType === SeatType.STANDARD) price = 80000;
        else if (seatType === SeatType.VIP) price = 100000;
        else if (seatType === SeatType.SWEETBOX) price = 150000;
      }
      total += price;
    });
    
    return total;
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      setAlertModal({
        show: true,
        title: AppMessage.TITLE_NO_SEATS,
        message: AppMessage.BOOKING_SELECT_SEAT,
        type: 'info'
      });
      return;
    }

    if (!user) {
      sessionStorage.setItem('pendingBookingSeats', JSON.stringify({
        showtimeId: params?.showtimeId,
        seats: selectedSeats
      }));
      setShowLoginModal(true);
      return;
    }

    try {
      const totalPrice = calculateTotalPrice();
      const res = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'customer',
          'x-user-id': String(user.id || '')
        },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: parseInt(params?.showtimeId as string),
          seats: selectedSeats,
          totalPrice: totalPrice
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`${APP_ROUTES.PAYMENT}/${data.id}`);
      } else {
        const errData = await res.json();
        setAlertModal({
          show: true,
          title: AppMessage.TITLE_BOOKING_FAILED,
          message: errData.message || AppMessage.BOOKING_CONNECTION_ERROR,
          type: 'error'
        });
      }
    } catch (err) {
      setAlertModal({
        show: true,
        title: AppMessage.TITLE_CONNECTION_ERROR,
        message: AppMessage.BOOKING_CONNECTION_ERROR,
        type: 'error'
      });
    }
  };

  // Nhóm ghế theo hàng để hiển thị
  const rowMap = new Map<string, any[]>();
  dbSeats.forEach(seat => {
    const row = seat.seat_number.charAt(0);
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(seat);
  });
  const rows = Array.from(rowMap.keys()).sort();

  return (
    <main className="main-content">
        <div className="container breadcrumb" style={{ margin: '20px auto', color: '#888', fontSize: '14px' }}>
            <Link href="/" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Trang chủ</Link> {'>'} <span>Chọn Ghế</span>
        </div>

        <section className="seat-selection-section container" style={{ padding: '30px', backgroundColor: 'var(--card-bg)', borderRadius: '10px', marginTop: '20px' }}>
            <div className="seat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p><strong>Phim: {showtime?.movie?.title || 'Đang tải...'}</strong></p>
                  <p><strong>Giờ chiếu: {showtime ? new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'} - {showtime ? new Date(showtime.start_time).toLocaleDateString('vi-VN') : '...'}</strong></p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '18px', backgroundColor: 'rgba(255, 77, 79, 0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 77, 79, 0.2)' }}>
                    ⏳ Thời gian giữ ghế: {formatTime(timeLeft)}
                  </div>
                  {currentTime && (
                    <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>
                      Bây giờ là: {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  )}
                </div>
            </div>
            
            <div className="screen-area" style={{ textAlign: 'center' }}>
                <div className="screen-curve"></div>
                <p style={{ color: '#888', fontSize: '18px', fontWeight: 'bold', letterSpacing: '8px', marginTop: '15px', textShadow: '0 0 10px rgba(255, 152, 0, 0.5)' }}>MÀN HÌNH</p>
                <div style={{ marginTop: '20px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Rạp: {showtime?.screen?.theater?.name || '...'}</div>
                <div style={{ marginBottom: '10px', color: '#ccc', fontSize: '16px' }}>Phòng chiếu: {showtime?.screen?.name || '...'}</div>
            </div>

            <div className="seat-grid-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', overflowX: 'auto', paddingBottom: '20px' }}>
                
                {/* Cửa trái */}
                <div style={{ textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
                    <div style={{ width: '20px', height: '50px', border: '2px solid #555', borderRight: 'none', marginBottom: '10px', borderRadius: '5px 0 0 5px' }}></div>
                    <p style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 0, letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>LỐI RA / VÀO ⬅</p>
                </div>

                <div className="seat-grid">
                    {dbSeats.length > 0 ? rows.map(row => (
                        <div key={row} className="seat-row">
                            {rowMap.get(row)!.sort((a,b) => {
                              const numA = parseInt(a.seat_number.slice(1));
                              const numB = parseInt(b.seat_number.slice(1));
                              return numA - numB;
                            }).map((seat) => {
                                const seatId = seat.seat_number;
                                const isSelected = selectedSeats.includes(seatId);
                                const isBooked = bookedSeats.includes(seatId);
                                
                                let seatClass = 'standard';
                                if (seat.type === SeatType.VIP) seatClass = 'vip';
                                if (seat.type === SeatType.SWEETBOX) seatClass = 'couple';

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
                    )) : (
                        <div style={{ color: '#888', padding: '50px' }}>Chưa có sơ đồ ghế cho phòng chiếu này. Vui lòng liên hệ Admin.</div>
                    )}
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
                    <p>Tổng tiền: <strong className="total-price">{(calculateTotalPrice()).toLocaleString('vi-VN')}đ</strong></p>
                </div>
                <div className="summary-actions">
                    <button className="btn btn-outline" onClick={() => router.back()}>Quay lại</button>
                    <button className="btn btn-primary" onClick={handleCheckout}>Thanh toán</button>
                </div>
            </div>
        </section>

        {/* Login Modal */}
        {showLoginModal && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px', textAlign: 'center', maxWidth: '400px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-color)' }}>Yêu cầu đăng nhập</h2>
                    <p style={{ color: '#888', marginBottom: '20px' }}>Vui lòng đăng nhập để thực hiện thanh toán đặt vé.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => router.push(`${APP_ROUTES.LOGIN}?redirect=/booking/${params?.showtimeId}`)} className="btn btn-primary">Đăng nhập ngay</button>
                        <button onClick={() => setShowLoginModal(false)} className="btn btn-outline">Hủy</button>
                    </div>
                </div>
            </div>
        )}

        {/* Custom Alert Modal */}
        {alertModal && alertModal.show && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {alertModal.type === 'success' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                    )}
                    {(alertModal.type === 'error' || alertModal.type === 'info') && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: alertModal.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: alertModal.type === 'error' ? '#ef4444' : '#3b82f6', marginBottom: '20px' }}>
                            {alertModal.type === 'error' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.086.796l-.845 2.536a.75.75 0 00.187.816l.034.027a.75.75 0 01-1.086-.796l.845-2.536a.75.75 0 00-.187-.816l-.034-.027zm1.5-3.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                            )}
                        </div>
                    )}
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>{alertModal.title}</h3>
                    <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>{alertModal.message}</p>
                    
                    <button onClick={alertModal.onConfirm || (() => setAlertModal(null))} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                        Đóng
                    </button>
                </div>
            </div>
        )}
    </main>
  );
}
