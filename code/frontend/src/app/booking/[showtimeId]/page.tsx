'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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

  useEffect(() => {
    setCurrentTime(new Date());
    if (timeLeft <= 0) {
      alert("Thời gian giữ ghế đã hết. Vui lòng chọn lại!");
      window.location.reload();
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
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      setShowLoginModal(true);
      return;
    }
    setUser(JSON.parse(storedUser));

    // Lấy bảng giá
    fetch('/api/prices')
      .then(res => res.json())
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    if (params?.showtimeId) {
      // Lấy thông tin showtime
      fetch(`/api/showtimes/${params.showtimeId}`)
        .then(res => res.json())
        .then(data => {
          setShowtime(data);
          if (data.screen_id) {
            // Lấy danh sách ghế của phòng chiếu này
            fetch(`/api/seats?screen_id=${data.screen_id}`)
              .then(res => res.json())
              .then(seats => setDbSeats(seats))
              .catch(err => console.error('Lỗi khi tải ghế của phòng chiếu:', err));
          }
        })
        .catch(err => console.error('Lỗi khi tải showtime:', err));

      // Lấy danh sách ghế đã đặt
      fetch(`/api/bookings/booked-seats?showtimeId=${params.showtimeId}`)
        .then(res => res.json())
        .then(data => setBookedSeats(data))
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
    const movieType = showtime.movie.type || 'TYPE_2D';
    
    const isWeekend = (dateString: string) => {
        const day = new Date(dateString).getDay();
        return day === 0 || day === 6;
    };
    const showtimeDayType = isWeekend(showtime.start_time);

    let total = 0;
    
    selectedSeats.forEach(seatId => {
      const seat = dbSeats.find(s => s.seat_number === seatId);
      const seatType = seat?.type || 'STANDARD';

      // Find price config matching movieType, seatType and day_type
      const priceConfig = prices.find(p => p.type_movie === movieType && p.type_seat === seatType && p.day_type === showtimeDayType);
      
      let price = 0;
      if (priceConfig) {
        price = priceConfig.price;
      } else {
        if (seatType === 'STANDARD') price = 80000;
        else if (seatType === 'VIP') price = 100000;
        else if (seatType === 'SWEETBOX') price = 150000;
      }
      total += price;
    });
    
    return total;
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      return alert('Vui lòng chọn ít nhất 1 ghế!');
    }

    try {
      const totalPrice = calculateTotalPrice();
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: parseInt(params?.showtimeId as string),
          seats: selectedSeats,
          totalPrice: totalPrice
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/payment/${data.id}`);
      } else {
        alert('Có lỗi xảy ra khi đặt vé.');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
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
                                if (seat.type === 'VIP') seatClass = 'vip';
                                if (seat.type === 'SWEETBOX') seatClass = 'couple';

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
            <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px', textAlign: 'center', maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-color)' }}>Chưa đăng nhập</h2>
                    <p style={{ color: '#888', marginBottom: '20px' }}>Vui lòng đăng nhập để tiếp tục đặt vé.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => router.push('/login')} className="btn btn-primary">Đăng nhập ngay</button>
                        <button onClick={() => router.push('/')} className="btn btn-outline">Trở về Trang chủ</button>
                    </div>
                </div>
            </div>
        )}
    </main>
  );
}
