'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrailerPage() {
  const { movieId } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState<string>('');

  useEffect(() => {
    fetch(`/api/movies/${movieId}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
        
        // Convert YouTube URL to embed URL if provided
        if (data.trailer) {
          const embedUrl = getYouTubeEmbedUrl(data.trailer);
          setTrailerUrl(embedUrl);
        }
      })
      .catch(() => setLoading(false));
  }, [movieId]);

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return '';
  };

  if (loading) return (
    <div className="text-center py-20" style={{ color: 'var(--text-color)' }}>
      Đang tải trailer...
    </div>
  );

  if (!movie) return (
    <div className="text-center py-20" style={{ color: 'var(--text-color)' }}>
      Không tìm thấy phim.
    </div>
  );

  return (
    <main className="main-content">
      <div className="container mt-40" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Link 
          href={`/movies/${movieId}`}
          style={{ 
            display: 'inline-block', 
            marginBottom: '20px', 
            color: '#ff4d4f', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          ← Quay lại chi tiết phim
        </Link>

        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '20px', 
          color: 'var(--text-color)' 
        }}>
          Trailer: {movie.title}
        </h1>

        <div style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          {trailerUrl ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                src={trailerUrl}
                title={`Trailer ${movie.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                Chưa có trailer cho phim này
              </p>
              <p style={{ fontSize: '14px' }}>
                Vui lòng quay lại sau hoặc liên hệ với chúng tôi
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link 
            href={`/movies/${movieId}`}
            className="btn btn-primary"
            style={{ 
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Đặt vé ngay
          </Link>
        </div>
      </div>
    </main>
  );
}
