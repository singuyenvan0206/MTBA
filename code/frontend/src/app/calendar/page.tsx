'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Movie = {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  genre: string;
  director: string;
  cast: string;
  language: string;
  posterUrl: string;
  trailerUrl: string;
  ageLimit?: string;
};

export default function Calendar() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('showing');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredMovies = movies.filter(movie => {
    const isMatchingType = type === 'showing' ? new Date(movie.releaseDate) <= new Date() : new Date(movie.releaseDate) > new Date();
    const isMatchingSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    return isMatchingType && isMatchingSearch;
  });

  return (
    <main className="main-content">
        <div className="container mt-40">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Tìm kiếm nhanh..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
            </div>
            
            <div className="calendar-header" style={{ textAlign: 'center' }}>
                <div className="date-selector mt-40" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                    <button 
                      className={`date-btn ${type === 'showing' ? 'active' : ''}`} 
                      onClick={() => setType('showing')}
                    >Phim đang chiếu</button>
                    <button 
                      className={`date-btn ${type === 'coming' ? 'active' : ''}`} 
                      onClick={() => setType('coming')}
                    >Phim sắp chiếu</button>
                </div>
            </div>

            <div className="movie-grid mt-40">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Đang tải danh sách phim...</p>
                ) : filteredMovies.length > 0 ? (
                    filteredMovies.map(movie => (
                        <div className="movie-card" key={movie.id}>
                            <div className="movie-poster">
                                <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                <div className="age-rating">{movie.ageLimit || 'P'}</div>
                                <div className="movie-overlay">
                                    <Link href={`/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }}>Mua vé</Link>
                                    <Link href={`/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }}>Chi tiết</Link>
                                </div>
                            </div>
                            <div className="movie-info">
                                <h3 className="movie-title">{movie.title}</h3>
                                <p className="movie-genre">{movie.genre}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Không tìm thấy phim phù hợp.</p>
                )}
            </div>
        </div>
    </main>
  );
}
