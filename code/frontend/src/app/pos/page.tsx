'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePosSync } from '../../hooks/usePosSync';

type Movie = {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
};

export default function Home() {
  usePosSync(false);

  const [movies, setMovies] = useState<any[]>([]);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [comingMovies, setComingMovies] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Tự động chuyển slide banner sau 10 giây
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNextBanner = () => {
    if (banners.length <= 1) return;
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    if (banners.length <= 1) return;
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

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
        <section className="hero-banner" id="hero-banner-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {banners.length > 0 ? (
                <>
                  <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentBannerIndex * 100}%)`, width: '100%' }}>
                    {banners.map((banner, index) => (
                      <div key={banner.id} style={{ minWidth: '100%', flexShrink: 0 }}>
                        {banner.type === 'VIDEO' ? (
                          <iframe width="100%" height="500px" src={banner.url} title="Banner Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ pointerEvents: 'none' }}></iframe>
                        ) : (
                          <img src={banner.url} alt={`Banner ${index}`} className="w-100" style={{ width: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                  {banners.length > 1 && (
                    <>
                      <button onClick={handlePrevBanner} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>❮</button>
                      <button onClick={handleNextBanner} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>❯</button>
                      
                      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                        {banners.map((_, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setCurrentBannerIndex(idx)}
                            style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', backgroundColor: idx === currentBannerIndex ? '#ff4d4f' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background-color 0.3s' }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
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
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '60%', maxWidth: '600px', background: 'white', color: 'black', borderRadius: '8px', zIndex: 50, maxHeight: '300px', overflowY: 'auto', textAlign: 'left', border: '1px solid #ddd' }}>
                    {movies.filter((m: any) => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        movies.filter((m: any) => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((movie: any) => (
                            <Link href={`/pos/movies/${movie.id}`} key={movie.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', textDecoration: 'none', color: 'black', borderBottom: '1px solid #eee' }}>
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
                        <Link href="/pos/calendar" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="movie-grid">
                        {loading ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải danh sách phim...</p>
                        ) : showingMovies.length > 0 ? (
                            showingMovies.slice(0, 6).map((movie) => (
                                <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/pos/movies/${movie.id}`}>
                                    <div className="movie-poster">
                                        <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                        <div className="age-rating">{movie.ageLimit || 'P'}</div>
                                        <div className="movie-overlay">
                                            <Link href={`/pos/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Mua vé</Link>
                                            <Link href={`/pos/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Chi tiết</Link>
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
                        <Link href="/pos/calendar" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="movie-grid">
                        {loading ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải danh sách phim...</p>
                        ) : comingMovies.length > 0 ? (
                            comingMovies.slice(0, 6).map((movie) => (
                                <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/pos/movies/${movie.id}`}>
                                    <div className="movie-poster">
                                        <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                        <div className="age-rating">{movie.ageLimit || 'P'}</div>
                                        <div className="movie-overlay">
                                            <Link href={`/pos/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Mua vé</Link>
                                            <Link href={`/pos/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>Chi tiết</Link>
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
                        <Link href="/pos/promotions" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="promo-list">
                        <div className="promo-item" onClick={() => window.location.href = '/pos/promotions'}>
                            <img src="https://placehold.co/400x200/222/FFF?text=Promo" alt="Khuyến mãi" />
                            <h4>Giảm 20% khi thanh toán qua VNPay</h4>
                        </div>
                    </div>
                </section>

                <section className="event-section mt-40">
                    <div className="section-header">
                        <h2>Sự kiện</h2>
                        <Link href="/pos/news" className="view-all">Xem tất cả</Link>
                    </div>
                    <div className="promo-list">
                        <div className="promo-item" onClick={() => window.location.href = '/pos/news'}>
                            <img src="https://placehold.co/400x200/222/FFF?text=Event" alt="Sự kiện" />
                            <h4>Sự kiện ra mắt phim bom tấn</h4>
                        </div>
                    </div>
                </section>
                
                <section className="ads-section mt-40">
                    <div className="lhp-card" onClick={() => window.location.href='/pos/festivals'} style={{ cursor: 'pointer' }}>
                        <div className="lhp-content">
                            <h3>Liên Hoan Phim<br/>Quốc Tế 2026</h3>
                            <p>Sự kiện quy tụ những kiệt tác điện ảnh xuất sắc nhất cùng dàn sao đình đám. Đừng bỏ lỡ!</p>
                            <Link href="/pos/festivals" className="btn btn-outline" style={{ borderColor: 'white', color: 'var(--text-color)' }}>Khám phá ngay</Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
  );
}
