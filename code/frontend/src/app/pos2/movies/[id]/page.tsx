'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Movie = {
  id: number;
  title: string;
  description: string;
  genre: string;
  posterUrl: string;
  releaseDate: string;
  duration: number;
  trailer: string;
  type: string;
  author: string;
  actors: string;
  ageLimit: string;
  ageLimitDescription?: string;
};

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Seat selection state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const seatsPerRow = 14;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ id: 7, role: 'admin', fullName: 'Nhân viên POS' });
    }

    if (!params?.id) return;
    
    fetch(`/api/movies/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        return fetch(`/api/showtimes?movieId=${params.id}`);
      })
      .then(res => res.json())
      .then(data => {
        setShowtimes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  // Handle unique dates
  const dates = Array.from(new Set(showtimes.map(st => {
    const d = new Date(st.start_time);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))).sort();

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const handleSelectShowtime = (showtime: any) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookedSeats([]);
    fetch(`/api/bookings/booked-seats?showtimeId=${showtime.id}`)
      .then(res => res.json())
      .then(data => setBookedSeats(data))
      .catch(err => console.error('Lỗi khi tải ghế:', err));
  };

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      return alert('Vui lòng chọn ít nhất 1 ghế!');
    }
    if (!selectedShowtime) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: selectedShowtime.id,
          seats: selectedSeats,
          totalPrice: selectedSeats.length * 80000
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/pos2/payment/${data.id}`);
      } else {
        alert('Có lỗi xảy ra khi đặt vé.');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    }
  };

  if (loading) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Đang tải thông tin phim...</div>;
  if (!movie) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Không tìm thấy phim.</div>;

  const showtimesForDate = showtimes.filter(st => {
    const d = new Date(st.start_time);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dStr === selectedDate;
  });

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <main className="main-content">
        <section className="movie-banner">
            <div className="movie-banner-bg" style={{ backgroundImage: "url('https://placehold.co/1440x600/222/FFF?text=Background')" }}></div>
            <div className="container movie-banner-content" id="movie-detail-container">
                <div className="movie-poster">
                    <img src={movie.posterUrl || 'https://placehold.co/300x450/333/FFF?text=Poster'} alt={`Poster ${movie.title}`} />
                </div>
                <div className="movie-info">
                    <h1>{movie.title} <span className="badge">{movie.type || '2D'}</span></h1>
                    <p className="movie-meta">{movie.genre} - {movie.duration} phút</p>
                    
                    <div className="movie-details">
                        <p><strong>Đạo diễn:</strong> {movie.author || 'Đang cập nhật'}</p>
                        <p><strong>Diễn viên:</strong> {movie.actors || 'Đang cập nhật'}</p>
                        <p><strong>Khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <p className="movie-synopsis">
                        {movie.description || 'Chưa có thông tin mô tả cho bộ phim này.'}
                    </p>
                    
                    <p className="movie-warning">
                        Kiểm duyệt: {movie.ageLimit || 'P'} - {movie.ageLimitDescription || (movie.ageLimit === 'P' ? 'PHIM DÀNH CHO MỌI LỨA TUỔI' : movie.ageLimit === 'K' ? 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ' : `PHIM DÀNH CHO KHÁN GIẢ TỪ ${movie.ageLimit?.replace('T', '') || '18'} TUỔI TRỞ LÊN`)}
                    </p>
                    
                    <div className="movie-actions">
                        {movie.trailer && (
                            <a href={movie.trailer} target="_blank" rel="noreferrer" className="btn btn-outline text-primary border-primary">Xem trailer</a>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* Lịch chiếu */}
        <section className="showtimes-section container">
            <div className="date-selector" id="dynamic-date-selector">
                {dates.length === 0 ? (
                    <p style={{ color: 'var(--text-color)' }}>Phim chưa có lịch chiếu.</p>
                ) : (
                    dates.map(dateStr => {
                        const d = new Date(dateStr);
                        const dayName = dayNames[d.getDay()];
                        const isSelected = dateStr === selectedDate;
                        return (
                            <button 
                                key={dateStr} 
                                className={`date-btn ${isSelected ? 'active' : ''}`} 
                                onClick={() => {
                                    setSelectedDate(dateStr);
                                    setSelectedShowtime(null);
                                }}
                            >
                                <span className="day">{dayName}</span>
                                <span className="date">{d.getDate()}</span>
                                <span className="month">Tháng {d.getMonth() + 1}</span>
                            </button>
                        );
                    })
                )}
            </div>
            
            <p className="age-warning">Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.</p>
            
            <div className="time-slots" id="dynamic-time-slots">
                {showtimesForDate.map(showtime => {
                    const time = new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    const isSelected = selectedShowtime?.id === showtime.id;
                    return (
                        <button 
                            key={showtime.id} 
                            className="time-btn" 
                            style={isSelected ? { borderColor: '#ff4d4f', color: '#ff4d4f' } : {}}
                            onClick={() => handleSelectShowtime(showtime)}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>
        </section>

        {/* Phần Chọn Ghế */}
        {selectedShowtime && (
            <section className="seat-selection-section container">
                <div className="seat-header">
                    <p><strong>Giờ chiếu: {new Date(selectedShowtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedShowtime.start_time).toLocaleDateString('vi-VN')}</strong></p>
                    <p className="timer">Thời gian hiện tại: <span id="real-time-clock">{currentTime}</span></p>
                </div>
                
                <div className="screen-area" style={{ textAlign: 'center' }}>
                    <div className="screen-curve"></div>
                    <p style={{ color: '#888', fontSize: '18px', fontWeight: 'bold', letterSpacing: '8px', marginTop: '15px', textShadow: '0 0 10px rgba(255, 152, 0, 0.5)' }}>MÀN HÌNH</p>

                    <select id="screen-selector" style={{ maxWidth: '250px', margin: '0 auto 0', display: 'block', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid #444', padding: '8px 15px', borderRadius: '5px', fontSize: '16px', outline: 'none', cursor: 'pointer' }} disabled>
                        <option value={selectedShowtime.screen?.id}>{selectedShowtime.screen?.name} ({selectedShowtime.screen?.seat_capacity || 140} ghế)</option>
                    </select>
                </div>

                <div className="seat-grid-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', overflowX: 'auto', paddingBottom: '20px' }}>
                    
                    {/* Cửa trái */}
                    <div style={{ textAlign: 'center', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
                        <div style={{ width: '20px', height: '50px', border: '2px solid #555', borderRight: 'none', marginBottom: '10px', borderRadius: '5px 0 0 5px' }}></div>
                        <p style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 0, letterSpacing: '2px', fontSize: '12px', fontWeight: 'bold' }}>LỐI RA / VÀO ⬅</p>
                    </div>

                    <div className="seat-grid" id="seatGrid">
                        {rows.map(row => (
                            <div key={row} className="seat-row">
                                {Array.from({ length: seatsPerRow }).map((_, i) => {
                                    const seatId = `${row}${i + 1}`;
                                    const isSelected = selectedSeats.includes(seatId);
                                    const isBooked = bookedSeats.includes(seatId);
                                    
                                    let seatClass = 'standard';
                                    if (row === 'H' || row === 'J') seatClass = 'vip';
                                    if (row === 'K') seatClass = 'couple';

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
                        <p>Tổng tiền: <strong className="total-price">{(selectedSeats.length * (selectedShowtime?.price || 80000)).toLocaleString('vi-VN')}đ</strong></p>
                    </div>
                    <div className="summary-actions">
                        <button className="btn btn-outline" onClick={() => window.scrollTo(0, 0)}>Quay lại</button>
                        <button className="btn btn-primary" onClick={handleCheckout}>Thanh toán</button>
                    </div>
                </div>
            </section>
        )}
    </main>
  );
}
