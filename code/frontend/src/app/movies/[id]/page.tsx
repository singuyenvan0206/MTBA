"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';


import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useParams } from 'next/navigation';

import { API_ENDPOINTS } from '@/constants/endpoints';
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
  ageLimit?: string;
  ageLimitDescription?: string;
  roomtype_ids?: number[];
};

export default function MovieDetail() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

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

  // Extract unique dates and theaters
  const availableDates = Array.from(new Set(showtimes.map(st => {
    // Convert to local YYYY-MM-DD
    const d = new Date(st.start_time);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))).sort();

  const availableTheaters = Array.from(new Set(showtimes.map(st => st.screen?.theater?.name || 'Rạp khác'))).sort();
  // Filter room types to only include those supported by the movie
  const availableRoomTypes = Array.from(new Set(
    showtimes
      .filter(st => movie?.roomtype_ids?.includes(st.screen?.roomtype_id))
      .map(st => st.screen?.roomtype?.name || '2D')
  )).sort();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('All');

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
    if (availableTheaters.length > 0 && !selectedTheater) {
      setSelectedTheater(availableTheaters[0]);
    }
  }, [availableDates, selectedDate, availableTheaters, selectedTheater]);

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[d.getDay()];
  };

  const filteredShowtimes = showtimes.filter(st => {
    const d = new Date(st.start_time);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Only show showtimes for room types that the movie supports
    if (movie?.roomtype_ids && !movie.roomtype_ids.includes(st.screen?.roomtype_id)) return false;
    
    // Require theater to be selected
    if (!selectedTheater) return false;
    if (selectedTheater && (st.screen?.theater?.name || 'Rạp khác') !== selectedTheater) return false;
    
    if (selectedDate && dateStr !== selectedDate) return false;
    if (selectedRoomType !== 'All' && (st.screen?.roomtype?.name || '2D') !== selectedRoomType) return false;
    return true;
  });

  if (loading) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Đang tải thông tin phim...</div>;
  if (!movie) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Không tìm thấy phim.</div>;

  return (
    <main className="main-content">
      <div className="container breadcrumb" style={{ margin: '20px auto', color: '#888', fontSize: '14px' }}>
        <Link href="/" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Trang chủ</Link> {'>'} <span>Phim đang chiếu</span> {'>'} <span style={{ color: 'var(--text-color)' }}>{movie.title}</span>
      </div>

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
              <p><strong>Đạo diễn:</strong> {movie.author || 'Đang cập nhật'}</p>
              <p><strong>Diễn viên:</strong> {movie.actors || 'Đang cập nhật'}</p>
              <p><strong>Khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
            </div>

            <p className="movie-synopsis">
              {movie.description || 'Chưa có thông tin mô tả cho bộ phim này.'}
            </p>

            <p className="movie-warning">
              Kiểm duyệt: {movie.ageLimit || AGE_LIMITS.P} - {movie.ageLimitDescription || (movie.ageLimit === AGE_LIMITS.P ? 'PHIM DÀNH CHO MỌI LỨA TUỔI' : movie.ageLimit === AGE_LIMITS.K ? 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ' : `PHIM DÀNH CHO KHÁN GIẢ TỪ ${movie.ageLimit?.replace('T', '') || '18'} TUỔI TRỞ LÊN`)}
            </p>

            <div className="movie-actions">
              {movie.trailer && (
                <Link href={`/trailer/${movie.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ borderColor: '#ff4d4f', color: '#ff4d4f', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', display: 'inline-block' }}>Xem trailer</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chọn Lịch Chiếu */}
      <div className="container showtime-section mt-40" style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Vui lòng chọn lịch chiếu</h2>

        {showtimes.length === 0 ? (
          <p style={{ color: '#888' }}>Chưa có lịch chiếu cho phim này.</p>
        ) : (
          <>
            {/* Bộ lọc Ngày và Rạp */}
            <div style={{ marginBottom: '30px' }}>
              <div className="date-selector" style={{ overflowX: 'auto', paddingBottom: '15px' }}>
                {availableDates.map(date => {
                  const d = new Date(date);
                  const dayName = getDayName(date);
                  const isSelected = date === selectedDate;
                  return (
                    <button
                      key={date}
                      className={`date-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDate(date)}
                      style={{ border: isSelected ? '1px solid #ff4d4f' : '1px solid #333' }}
                    >
                      <span className="day">{dayName}</span>
                      <span className="date">{d.getDate()}</span>
                      <span className="month">Tháng {d.getMonth() + 1}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#888' }}>Chọn Cụm Rạp:</span>
                  <select
                    value={selectedTheater}
                    onChange={(e) => setSelectedTheater(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none' }}
                  >
                    {availableTheaters.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#888' }}>Chọn Cụm Phòng:</span>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', outline: 'none' }}
                  >
                    <option value="All">Tất cả phòng</option>
                    {availableRoomTypes.map(rt => (
                      <option key={rt} value={rt}>{rt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredShowtimes.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Không có lịch chiếu phù hợp với lựa chọn của bạn.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {Object.entries(
                  filteredShowtimes.reduce((acc, st) => {
                    const groupName = `${st.screen?.theater?.name || 'Rạp'} - ${st.screen?.name || 'Phòng'} (${st.screen?.roomtype?.name || '2D'})`;
                    if (!acc[groupName]) acc[groupName] = [];
                    acc[groupName].push(st);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).sort(([nameA, listA]: any, [nameB, listB]: any) => {
                  const getWeight = (roomShowtimes: any[]) => {
                    const name = (roomShowtimes[0]?.screen?.roomtype?.name || '').toUpperCase();
                    if (name.includes('2D')) return 1;
                    if (name.includes('3D')) return 2;
                    if (name.includes('IMAX')) return 3;
                    return 4;
                  };
                  const weightA = getWeight(listA);
                  const weightB = getWeight(listB);
                  if (weightA !== weightB) {
                    return weightA - weightB;
                  }
                  return nameA.localeCompare(nameB);
                }).map(([groupName, roomShowtimes]: any) => (
                  <div key={groupName} className="theater-group" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#60a5fa' }}>{groupName}</h3>
                    <div className="time-slots" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {(roomShowtimes as any[]).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map(showtime => {
                        const time = new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <Link href={`/booking/${showtime.id}`} key={showtime.id} className="time-btn" style={{ display: 'block', textDecoration: 'none' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{time}</div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
