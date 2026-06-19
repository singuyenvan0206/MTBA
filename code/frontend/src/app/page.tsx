'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Movie = {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
};

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [comingMovies, setComingMovies] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch movies
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMovies(data);
          const now = new Date();
          const showing = data.filter((m: any) => m.releaseDate && new Date(m.releaseDate) <= now);
          const coming = data.filter((m: any) => m.releaseDate && new Date(m.releaseDate) > now);
          
          setShowingMovies(showing.length > 0 ? showing : data.slice(0, Math.ceil(data.length / 2)));
          setComingMovies(coming.length > 0 ? coming : data.slice(Math.ceil(data.length / 2)));
        } else {
          setMovies([]);
          setShowingMovies([]);
          setComingMovies([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load movies:', err);
        setLoading(false);
      });

    // Fetch banners
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error('Failed to load banners:', err));
  }, []);

  return (
    <main className="main-content">
        <section className="hero-banner" id="hero-banner-container">
            {banners.length > 0 ? (
                <img src={banners[0].url} alt="Banner lớn" className="w-100" />
            ) : (
                <img src="https://phimmoichills.net/wp-content/uploads/2024/05/hien-vien-kiem-han-chi-van.jpg" alt="Cinestar Banner" className="w-100" />
            )}
        </section>

        <div className="container" style={{ marginTop: '30px', textAlign: 'center', position: 'relative' }}>
            <input 
                type="text" 
                className="search-input"
                placeholder="Tìm kiếm nhanh tên phim..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
                <div className="search-results">
                    {movies.filter((m: any) => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        movies.filter((m: any) => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((movie: any) => (
                            <Link href={`/movies/${movie.id}`} key={movie.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', textDecoration: 'none', color: 'inherit' }}>
                                <img src={movie.posterUrl || 'https://placehold.co/40x60'} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                <div>
                                    <h4 style={{ margin: 0 }}>{movie.title}</h4>
                                    <span style={{ fontSize: '12px', color: '#666' }}>{movie.genre}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>Không tìm thấy phim phù hợp</div>
                    )}
                </div>
            )}
        </div>

        <div className="container layout-grid">
            <div className="left-column">
                <section className="movie-section">
                    <div className="section-header">
                        <h2><span className="dot"></span> Phim đang chiếu</h2>
                        <Link href="/calendar" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="movie-grid">
                        {loading ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải danh sách phim...</p>
                        ) : showingMovies.length > 0 ? (
                            showingMovies.slice(0, 6).map((movie) => (
                                <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/movies/${movie.id}`}>
                                    <div className="movie-poster">
                                        <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                        <div className="age-rating">{movie.ageLimit || 'P'}</div>
                                        <div className="movie-overlay">
                                            <Link href={`/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Mua vé</Link>
                                            <Link href={`/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Chi tiết</Link>
                                        </div>
                                    </div>
                                    <div className="movie-info">
                                        <h3 title={movie.title}>{movie.title}</h3>
                                        <p>{movie.genre}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Không có phim đang chiếu.</p>
                        )}
                    </div>
                </section>

                <section className="movie-section mt-40">
                    <div className="section-header">
                        <h2><span className="dot"></span> Phim sắp chiếu</h2>
                        <Link href="/calendar" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="movie-grid">
                        {loading ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải danh sách phim...</p>
                        ) : comingMovies.length > 0 ? (
                            comingMovies.slice(0, 6).map((movie) => (
                                <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/movies/${movie.id}`}>
                                    <div className="movie-poster">
                                        <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                        <div className="age-rating">{movie.ageLimit || 'P'}</div>
                                        <div className="movie-overlay">
                                            <Link href={`/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Mua vé</Link>
                                            <Link href={`/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Chi tiết</Link>
                                        </div>
                                    </div>
                                    <div className="movie-info">
                                        <h3 title={movie.title}>{movie.title}</h3>
                                        <p>{movie.genre}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Không có phim sắp chiếu.</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="right-column">
                <section className="promo-section">
                    <div className="section-header">
                        <h2>Khuyến mãi</h2>
                        <Link href="/promotions" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="promo-list">
                        <div className="promo-item" onClick={() => window.location.href = '/promotions'}>
                            <img src="https://placehold.co/400x200/222/FFF?text=Promo" alt="Khuyến mãi" />
                            <h4>Giảm 20% khi thanh toán qua VNPay</h4>
                        </div>
                    </div>
                </section>

                <section className="event-section mt-40">
                    <div className="section-header">
                        <h2>Sự kiện</h2>
                        <Link href="/news" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="promo-list">
                        <div className="promo-item" onClick={() => window.location.href = '/news'}>
                            <img src="https://placehold.co/400x200/222/FFF?text=Event" alt="Sự kiện" />
                            <h4>Sự kiện ra mắt phim bom tấn</h4>
                        </div>
                    </div>
                </section>
                
                <section className="ads-section mt-40">
                    <div className="lhp-card" onClick={() => window.location.href='/festivals'} style={{ cursor: 'pointer' }}>
                        <div className="lhp-content">
                            <h3>Liên Hoan Phim<br/>Quốc Tế 2026</h3>
                            <p>Sự kiện quy tụ những kiệt tác điện ảnh xuất sắc nhất cùng dàn sao đình đám. Đừng bỏ lỡ!</p>
                            <Link href="/festivals" className="btn btn-outline" style={{ borderColor: 'white', color: 'var(--text-color)' }}>Khám phá ngay</Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
  );
}
