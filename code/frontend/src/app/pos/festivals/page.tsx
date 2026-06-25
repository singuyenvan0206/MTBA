'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Festivals() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/festivals')
      .then(res => res.json())
      .then(resData => { setData(resData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="main-content">
        <div className="container mt-40">
            <h2 className="text-center mb-40" style={{ fontSize: '28px', marginBottom: '40px', color: 'var(--text-color)', textTransform: 'uppercase' }}>Liên Hoan Phim</h2>

            <div className="news-grid">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Đang tải...</p>
                ) : data.length > 0 ? (
                    data.map((item, i) => (
                        <Link href={`/pos/festivals/${item.id}`} key={i} style={{ textDecoration: 'none' }}>
                            <div className="news-card">
                                <div className="news-thumb">
                                    <img src={`https://placehold.co/400x250?text=Festival+${item.id}`} alt={item.title} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 className="news-title">{item.title}</h3>
                                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{item.content}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Chưa có thông tin liên hoan phim nào.</p>
                )}
            </div>
            
            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '40px' }}>
                <a href="#" className="page-link active">1</a>
                <a href="#" className="page-link">2</a>
                <a href="#" className="page-link">3</a>
                <span className="page-dots">...</span>
                <a href="#" className="page-link">Tiếp theo</a>
            </div>
        </div>
    </main>
  );
}
