'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useParams } from 'next/navigation';

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
};

export default function MovieDetail() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Đang tải thông tin phim...</div>;
  if (!movie) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Không tìm thấy phim.</div>;

  return (
    <main className="main-content">
        <div className="container breadcrumb" style={{ margin: '20px auto', color: '#888', fontSize: '14px' }}>
            <Link href="/" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Trang chủ</Link> {'>'} <span>Phim đang chiếu</span> {'>'} <span style={{ color: 'var(--text-color)' }}>{movie.title}</span>
        </div>

        <div className="container movie-detail-wrapper" id="movie-detail-container" style={{ display: 'flex', gap: '30px', backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '10px' }}>
            <div className="movie-poster" style={{ flex: '0 0 300px' }}>
                <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} style={{ width: '100%', borderRadius: '8px' }} />
            </div>
            <div className="movie-info" style={{ flex: 1 }}>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{movie.title} <span className="badge" style={{ fontSize: '14px', background: '#ff4d4f', padding: '3px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>{movie.type || '2D'}</span></h1>
                <p className="movie-meta" style={{ color: '#aaa', marginBottom: '20px' }}>{movie.genre} - {movie.duration} phút</p>
                
                <div className="movie-details" style={{ marginBottom: '20px', lineHeight: 1.8 }}>
                    <p><strong>Khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Tác giả:</strong> {movie.author || 'Đang cập nhật'}</p>
                    <p><strong>Diễn viên:</strong> {movie.actors || 'Đang cập nhật'}</p>
                </div>
                
                <p className="movie-synopsis" style={{ color: '#ccc', marginBottom: '20px', lineHeight: 1.6 }}>
                    {movie.description || 'Chưa có thông tin mô tả cho bộ phim này.'}
                </p>
                
                <p className="movie-warning" style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    Kiểm duyệt: {movie.ageLimit || 'P'} - {movie.ageLimitDescription || (movie.ageLimit === 'P' ? 'PHIM DÀNH CHO MỌI LỨA TUỔI' : movie.ageLimit === 'K' ? 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ' : `PHIM DÀNH CHO KHÁN GIẢ TỪ ${movie.ageLimit?.replace('T', '') || '18'} TUỔI TRỞ LÊN`)}
                </p>
                
                <div className="movie-actions">
                    {movie.trailer && (
                        <a href={movie.trailer} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>Xem trailer</a>
                    )}
                </div>
            </div>
        </div>

        {/* Chọn Lịch Chiếu */}
        <div className="container showtime-section mt-40" style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Vui lòng chọn lịch chiếu</h2>
            {showtimes.length === 0 ? (
                <p style={{ color: '#888' }}>Chưa có lịch chiếu cho phim này.</p>
            ) : (
                <div className="time-slots" id="dynamic-time-slots" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {showtimes.map(showtime => {
                        const time = new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                            <Link href={`/booking/${showtime.id}`} key={showtime.id} style={{ display: 'block', padding: '10px 20px', backgroundColor: 'var(--card-bg)', border: '1px solid #444', borderRadius: '5px', textDecoration: 'none', color: 'var(--text-color)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{time}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>{showtime.screen?.name}</div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    </main>
  );
}
