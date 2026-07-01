"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTheater } from '@/app/pos/TheaterContext';
import { usePosSync } from '@/hooks/usePosSync';
import { AppMessage } from '@/types/messages';
import { MovieType, SeatType } from '@/types/enums';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { APP_ROUTES } from '@/constants/routes';
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
  const { pushState } = usePosSync(true); // Staff mode
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Seat selection state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { selectedTheater } = useTheater();
  const [selectedShowtime, setSelectedShowtime] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [dbSeats, setDbSeats] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ id: 1, role: ROLES.ADMIN, fullName: UI_MESSAGES.POS_STAFF });
    }

    if (!params?.id) return;

    // Lấy bảng giá
    fetch(API_ENDPOINTS.PRICES)
      .then(res => res.json())
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`${API_ENDPOINTS.MOVIES_}${params.id}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        return fetch(`${API_ENDPOINTS.SHOWTIMES}?movieId=${params.id}`);
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
  const availableDates = Array.from(new Set(showtimes.map(st => {
    const d = new Date(st.start_time);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))).sort();

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
      pushState({ selectedDate: availableDates[0] });
    }
  }, [availableDates, selectedDate]);

  const handleSelectShowtime = (showtime: any) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookedSeats([]);
    setDbSeats([]);
    pushState({ showtimeId: showtime.id, selectedSeats: [] });

    if (showtime.screen_id) {
      fetch(`${API_ENDPOINTS.SEATS}?screen_id=${showtime.screen_id}`)
        .then(res => res.json())
        .then(seats => setDbSeats(Array.isArray(seats) ? seats : []))
        .catch(err => console.error(UI_MESSAGES.ERROR_LOADING_SEATS, err));
    }

    fetch(`${API_ENDPOINTS.BOOKINGS_BOOKEDSEATS}?showtimeId=${showtime.id}`)
      .then(res => res.json())
      .then(data => setBookedSeats(Array.isArray(data.bookedSeats) ? data.bookedSeats : []))
      .catch(err => console.error('Lỗi khi tải ghế:', err));
  };

  const toggleSeat = (seatId: string) => {
    let newSelectedSeats = [];
    if (selectedSeats.includes(seatId)) {
      newSelectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      if (selectedSeats.length >= 8) {
        showAlert(UI_MESSAGES.CH_____C_CH_N_T_I__A_8_GH);
        return;
      }
      newSelectedSeats = [...selectedSeats, seatId];
    }
    setSelectedSeats(newSelectedSeats);
    pushState({ selectedSeats: newSelectedSeats, showtimeId: selectedShowtime?.id });
  };

  const calculateTotalPrice = () => {
    if (!movie) return 0;
    const showtimeRoomtypeId = selectedShowtime?.screen?.roomtype_id;

    const isWeekend = (dateString: string) => {
      const day = new Date(dateString).getDay();
      return day === 0 || day === 6;
    };
    const showtimeDayType = selectedShowtime ? isWeekend(selectedShowtime.start_time) : false;

    let total = 0;

    selectedSeats.forEach(seatId => {
      const seat = dbSeats.find(s => s.seat_number === seatId);
      const seatType = (seat?.type as SeatType) || SeatType.STANDARD;

      const priceConfig = prices.find(p =>
        p.roomtype_id === showtimeRoomtypeId &&
        p.type_seat === seatType &&
        p.day_type === showtimeDayType
      );

      let price = 0;
      if (priceConfig) {
        price = priceConfig.price;
      }
      total += price;
    });

    return total;
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      showAlert(AppMessage.POS_BOOKING_SELECT_SEAT);
      return;
    }
    if (!selectedShowtime) return;

    try {
      const totalPrice = calculateTotalPrice();
      const res = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken || ''}`
        },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: selectedShowtime.id,
          seats: selectedSeats,
          totalPrice: totalPrice
        })
      });

      if (res.ok) {
        const booking = await res.json();
        pushState({ currentPath: `/pos2/payment/${booking.id}`, showtimeId: selectedShowtime.id, selectedSeats: selectedSeats });
        router.push(`${APP_ROUTES.POS2}/payment/${booking.id}`);
      } else {
        const errorData = await res.json().catch(() => null);
        showAlert(errorData?.message || UI_MESSAGES.BOOKING_ERROR_OCCURRED);
      }
    } catch (err) {
      showAlert(UI_MESSAGES.L_I_K_T_N_I_SERVER_43);
    }
  };

  if (loading || !movie) return <div className="text-center py-20 text-[color:var(--text-secondary)]">{loading ? UI_MESSAGES.LOADING_MOVIE : UI_MESSAGES.MOVIE_NOT_FOUND}</div>;

  const showtimesForDate = showtimes.filter(st => {
    const d = new Date(st.start_time);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (selectedDate && dateStr !== selectedDate) return false;
    if (selectedTheater && st.screen?.theater_id?.toString() !== selectedTheater) return false;
    return true;
  });

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Nhóm ghế theo hàng để hiển thị
  const rowMap = new Map<string, any[]>();
  dbSeats.forEach(seat => {
    const row = seat.seat_number.charAt(0);
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(seat);
  });
  const dbRows = Array.from(rowMap.keys()).sort();

  return (
    <main className="main-content">
      <section className="movie-banner">
        <div className="movie-banner-bg" style={{ backgroundImage: `url(${movie.posterUrl || 'https://placehold.co/1440x600/222/FFF?text=Background'})` }}></div>
        <div className="container movie-banner-content" id="movie-detail-container">
          <div className="movie-poster">
            <img src={movie.posterUrl || 'https://placehold.co/300x450/333/FFF?text=Poster'} alt={`Poster ${movie.title}`} />
          </div>
          <div className="movie-info">
            <h1>{movie.title} <span className="badge">{movie.type?.replace(/^TYPE_/, '') || '2D'}</span></h1>
            <p className="movie-meta">{movie.genre} - {movie.duration} phút</p>

            <div className="movie-details">
              <p><strong>{UI_MESSAGES.DIRECTOR}</strong> {movie.author || UI_MESSAGES.UPDATING}</p>
              <p><strong>{UI_MESSAGES.ACTORS}</strong> {movie.actors || UI_MESSAGES.UPDATING}</p>
              <p><strong>{UI_MESSAGES.RELEASE_DATE}</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
            </div>

            <p className="movie-synopsis">
              {movie.description}
            </p>

            <p className="movie-warning">
              {UI_MESSAGES.AGE_RATING} {movie.ageLimit} - {movie.ageLimitDescription}
            </p>

            <div className="movie-actions">
              {movie.trailer && (
                <a href={movie.trailer} target="_blank" rel="noreferrer" className="btn btn-outline text-primary border-primary">{UI_MESSAGES.WATCH_TRAILER}</a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lịch chiếu */}
      <section className="showtimes-section container">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="date-selector" id="dynamic-date-selector" style={{ margin: 0 }}>
            {availableDates.length === 0 ? (
              <p style={{ color: 'var(--text-color)' }}>{UI_MESSAGES.NO_SHOWTIMES}</p>
            ) : (
              availableDates.map(dateStr => {
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
                      pushState({ selectedDate: dateStr, showtimeId: null, selectedSeats: [] });
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
        </div>

        <p className="age-warning">{UI_MESSAGES.AGE_WARNING}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {Object.entries(
            showtimesForDate.reduce((acc, st) => {
              const rName = `${st.screen?.name} (${st.screen?.roomtype?.name})`;
              if (!acc[rName]) acc[rName] = [];
              acc[rName].push(st);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([roomName, roomShowtimes]) => (
            <div key={roomName} className="room-group" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#60a5fa' }}>{roomName}</h3>
              <div className="time-slots" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {(roomShowtimes as any[]).map(showtime => {
                  const time = new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const isSelected = selectedShowtime?.id === showtime.id;
                  return (
                    <button
                      key={showtime.id}
                      className={`time-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectShowtime(showtime)}
                    >
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{time}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Phần Chọn Ghế */}
      {selectedShowtime && (
        <section className="seat-selection-section container">
          <div className="seat-header">
            <p><strong>{UI_MESSAGES.SHOWTIME} {new Date(selectedShowtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedShowtime.start_time).toLocaleDateString('vi-VN')}</strong></p>
            <p className="timer">{UI_MESSAGES.CURRENT_TIME} <span id="real-time-clock">{currentTime}</span></p>
          </div>

          <div className="screen-area" style={{ textAlign: 'center' }}>
            <div className="screen-curve"></div>
            <p style={{ color: '#888', fontSize: '18px', fontWeight: 'bold', letterSpacing: '8px', marginTop: '15px', textShadow: '0 0 10px rgba(255, 152, 0, 0.5)' }}>{UI_MESSAGES.SCREEN}</p>

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
              {dbRows.map(row => (
                <div key={row} className="seat-row" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  {rowMap.get(row)!.sort((a, b) => {
                    // Extract numbers from seat_number (e.g., A1 -> 1, A10 -> 10)
                    const numA = parseInt(a.seat_number.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.seat_number.replace(/\D/g, '')) || 0;
                    return numA - numB;
                  }).map((seat: any) => {
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
              <p>{UI_MESSAGES.SELECTED_SEATS} <strong className="selected-seats-text" style={{ color: '#ff4d4f' }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : UI_MESSAGES.NOT_SELECTED}</strong></p>
              <p>{UI_MESSAGES.TOTAL_PRICE} <strong className="total-price">{calculateTotalPrice().toLocaleString('vi-VN')}đ</strong></p>
            </div>
            <div className="summary-actions">
              <button className="btn btn-outline" onClick={() => window.scrollTo(0, 0)}>{UI_MESSAGES.BACK}</button>
              <button className="btn btn-primary" onClick={handleCheckout}>{UI_MESSAGES.CHECKOUT}</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
