"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';

import { UI_MESSAGES } from '@/constants/messages';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
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

  const [type, setType] = useState(MOVIE_TABS.SHOWING);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(API_ENDPOINTS.MOVIES)
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
    const isMatchingType = type === MOVIE_TABS.SHOWING ? new Date(movie.releaseDate) <= new Date() : new Date(movie.releaseDate) > new Date();
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
                  placeholder={UI_MESSAGES.SEARCH_MOVIE} 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
            </div>
            
            <div className="calendar-header" style={{ textAlign: 'center' }}>
                <div className="date-selector mt-40" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                    <button 
                      className={`date-btn ${type === MOVIE_TABS.SHOWING ? 'active' : ''}`} 
                      onClick={() => setType(MOVIE_TABS.SHOWING)}
                    >{UI_MESSAGES.NOW_SHOWING_MOVIES}</button>
                    <button 
                      className={`date-btn ${type === MOVIE_TABS.COMING ? 'active' : ''}`} 
                      onClick={() => setType(MOVIE_TABS.COMING)}
                    >{UI_MESSAGES.COMING_SOON_MOVIES}</button>
                </div>
            </div>

            <div className="movie-grid mt-40">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>{UI_MESSAGES.LOADING_MOVIE_LIST}</p>
                ) : filteredMovies.length > 0 ? (
                    filteredMovies.map(movie => (
                        <div className="movie-card" key={movie.id}>
                            <div className="movie-poster">
                                <img src={movie.posterUrl || 'https://placehold.co/300x450'} alt={movie.title} />
                                <div className="age-rating">{movie.ageLimit || AGE_LIMITS.P}</div>
                                <div className="movie-overlay">
                                    <Link href={`/pos2/movies/${movie.id}`} className="btn btn-primary" style={{ marginBottom: '10px', width: '80%', textAlign: 'center' }}>{UI_MESSAGES.BUY_TICKET}</Link>
                                    <Link href={`/pos2/movies/${movie.id}`} className="btn btn-outline" style={{ width: '80%', textAlign: 'center' }}>{UI_MESSAGES.DETAIL}</Link>
                                </div>
                            </div>
                            <div className="movie-info">
                                <h3 className="movie-title">{movie.title}</h3>
                                <p className="movie-genre">{movie.genre}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>{UI_MESSAGES.MOVIE_NOT_MATCH}</p>
                )}
            </div>
        </div>
    </main>
  );
}
