'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [comingMovies, setComingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [showingPage, setShowingPage] = useState(0);
  const [comingPage, setComingPage] = useState(0);
  const PAGE_SIZE = 8;

  // Auto-rotate hero movie mỗi 8 giây
  useEffect(() => {
    if (showingMovies.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % Math.min(showingMovies.length, 5)), 8000);
    return () => clearInterval(t);
  }, [showingMovies.length]);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
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
      .catch(() => setLoading(false));
  }, []);

  const heroMovie = showingMovies[heroIndex];
  const thumbnailMovies = showingMovies.filter((_, i) => i !== heroIndex).slice(0, 5);

  return (
    <main className="main-content">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Cinematic Banner kiểu LuPhim
      ═══════════════════════════════════════════════════════ */}
      <section
        id="hero-banner"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '440px',
          overflow: 'hidden',
          background: '#0a0a0a',
        }}
      >
        {/* Background banner (landscape) — fallback sang poster nếu chưa có banner */}
        {heroMovie && (
          <div
            key={heroMovie.id}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroMovie.bannerUrl || heroMovie.posterUrl || 'https://placehold.co/1400x500/111/222'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              filter: 'brightness(0.55)',
              transition: 'background-image 0.8s ease',
            }}
          />
        )}

        {/* Gradient overlay — mạnh bên trái, trong suốt bên phải */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.75) 40%, rgba(10,10,10,0.15) 70%, transparent 100%)',
        }} />
        {/* Gradient overlay — bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 40%)',
        }} />

        {/* Nội dung hero */}
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '60px 24px 40px',
            gap: '24px',
          }}
        >
          {/* CỘT TRÁI: thông tin phim */}
          {heroMovie ? (
            <div style={{ flex: '1 1 55%', maxWidth: '600px' }}>
              {/* Tiêu đề */}
              <h1
                style={{
                  fontSize: 'clamp(24px, 4vw, 42px)',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  marginBottom: '8px',
                  textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                  letterSpacing: '-0.5px',
                }}
              >
                {heroMovie.title}
              </h1>

              {/* Phụ đề (thể loại / mô tả ngắn) */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#e5a020',
                  fontWeight: '600',
                  marginBottom: '14px',
                  letterSpacing: '0.3px',
                }}
              >
                {heroMovie.genre || 'Đang chiếu'}
              </p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {heroMovie.type && (
                  <span style={{
                    background: '#e5a020',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}>
                    {heroMovie.type}
                  </span>
                )}
                {heroMovie.ageLimit && (
                  <span style={{
                    background: heroMovie.ageLimit === 'P' ? '#28a745' : heroMovie.ageLimit === 'C13' ? '#ffc107' : '#ff4d4f',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}>
                    {heroMovie.ageLimit}
                  </span>
                )}
                {heroMovie.duration && (
                  <span style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}>
                    ⏱ {heroMovie.duration} phút
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.7,
                  marginBottom: '28px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxWidth: '520px',
                }}
              >
                {heroMovie.description || 'Xem ngay bộ phim đang được yêu thích nhất tại rạp!'}
              </p>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link
                  href={`/movies/${heroMovie.id}`}
                  id="hero-btn-buy"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ff4d4f',
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '50px',
                    fontWeight: '700',
                    fontSize: '15px',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 20px rgba(255,77,79,0.4)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  Mua vé ngay
                </Link>

                <Link
                  href={`/movies/${heroMovie.id}`}
                  id="hero-btn-detail"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontWeight: '600',
                    fontSize: '15px',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  Chi tiết
                </Link>
              </div>

              {/* Dots chuyển phim */}
              {showingMovies.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
                  {showingMovies.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      id={`hero-dot-${idx}`}
                      onClick={() => setHeroIndex(idx)}
                      style={{
                        width: idx === heroIndex ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: idx === heroIndex ? '#ff4d4f' : 'rgba(255,255,255,0.35)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: '1 1 55%' }} />
          )}

          {/* CỘT PHẢI: danh sách thumbnail phim */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '200px',
            }}
          >
            {thumbnailMovies.map((m, idx) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                id={`hero-thumb-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '8px',
                  padding: '6px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,77,79,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(255,77,79,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onClick={() => setHeroIndex(showingMovies.findIndex(sm => sm.id === m.id))}
              >
                <img
                  src={m.posterUrl || 'https://placehold.co/50x70/1a1a1a/444'}
                  alt={m.title}
                  style={{ width: '42px', height: '58px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px',
                  }}>
                    {m.title}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: '3px 0 0' }}>
                    {m.genre || 'Đang chiếu'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SEARCH BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="container" style={{ marginTop: '24px', textAlign: 'center', position: 'relative' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm nhanh tên phim..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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

      {/* ═══════════════════════════════════════════════════════
          PHIM ĐANG CHIẾU & SẮP CHIẾU
      ═══════════════════════════════════════════════════════ */}
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
                showingMovies.slice(showingPage * PAGE_SIZE, (showingPage + 1) * PAGE_SIZE).map(movie => (
                  <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/movies/${movie.id}`}>
                    <div className="movie-poster">
                      <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                      <div className="age-rating">{movie.ageLimit || 'P'}</div>
                      <div className="movie-overlay">
                        <Link href={`/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>Mua vé</Link>
                        <Link href={`/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>Chi tiết</Link>
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
            {/* Pagination - Phim đang chiếu */}
            {!loading && showingMovies.length > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                <button
                  onClick={() => setShowingPage(p => Math.max(0, p - 1))}
                  disabled={showingPage === 0}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                    background: showingPage === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                    color: showingPage === 0 ? '#555' : '#fff', cursor: showingPage === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}
                >&#8592; Trước</button>
                {Array.from({ length: Math.ceil(showingMovies.length / PAGE_SIZE) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setShowingPage(i)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: showingPage === i ? '2px solid #ff4d4f' : '1px solid rgba(255,255,255,0.15)',
                      background: showingPage === i ? '#ff4d4f' : 'rgba(255,255,255,0.07)',
                      color: '#fff', cursor: 'pointer', fontWeight: showingPage === i ? 700 : 400,
                      fontSize: '14px', transition: 'all 0.2s',
                    }}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setShowingPage(p => Math.min(Math.ceil(showingMovies.length / PAGE_SIZE) - 1, p + 1))}
                  disabled={showingPage >= Math.ceil(showingMovies.length / PAGE_SIZE) - 1}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                    background: showingPage >= Math.ceil(showingMovies.length / PAGE_SIZE) - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                    color: showingPage >= Math.ceil(showingMovies.length / PAGE_SIZE) - 1 ? '#555' : '#fff',
                    cursor: showingPage >= Math.ceil(showingMovies.length / PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}
                >Tiếp &#8594;</button>
              </div>
            )}
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
                comingMovies.slice(comingPage * PAGE_SIZE, (comingPage + 1) * PAGE_SIZE).map(movie => (
                  <div className="movie-card" key={movie.id} onClick={() => window.location.href = `/movies/${movie.id}`}>
                    <div className="movie-poster">
                      <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                      <div className="age-rating">{movie.ageLimit || 'P'}</div>
                      <div className="movie-overlay">
                        <Link href={`/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>Mua vé</Link>
                        <Link href={`/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>Chi tiết</Link>
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
            {/* Pagination - Phim sắp chiếu */}
            {!loading && comingMovies.length > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                <button
                  onClick={() => setComingPage(p => Math.max(0, p - 1))}
                  disabled={comingPage === 0}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                    background: comingPage === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                    color: comingPage === 0 ? '#555' : '#fff', cursor: comingPage === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}
                >&#8592; Trước</button>
                {Array.from({ length: Math.ceil(comingMovies.length / PAGE_SIZE) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setComingPage(i)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: comingPage === i ? '2px solid #ff4d4f' : '1px solid rgba(255,255,255,0.15)',
                      background: comingPage === i ? '#ff4d4f' : 'rgba(255,255,255,0.07)',
                      color: '#fff', cursor: 'pointer', fontWeight: comingPage === i ? 700 : 400,
                      fontSize: '14px', transition: 'all 0.2s',
                    }}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setComingPage(p => Math.min(Math.ceil(comingMovies.length / PAGE_SIZE) - 1, p + 1))}
                  disabled={comingPage >= Math.ceil(comingMovies.length / PAGE_SIZE) - 1}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                    background: comingPage >= Math.ceil(comingMovies.length / PAGE_SIZE) - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                    color: comingPage >= Math.ceil(comingMovies.length / PAGE_SIZE) - 1 ? '#555' : '#fff',
                    cursor: comingPage >= Math.ceil(comingMovies.length / PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}
                >Tiếp &#8594;</button>
              </div>
            )}
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
