'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then(res => res.json())
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center  py-20">Đang tải...</div>;
  if (!news) return <div className="text-center  py-20">Không tìm thấy bài viết.</div>;

  return (
    <div className="container mx-auto px-4 py-16  min-h-screen max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-[#ff4d4f]">{news.title}</h1>
      <p className="text-[color:var(--text-secondary)] mb-8 text-sm">Đăng ngày: {new Date(news.created_at).toLocaleDateString('vi-VN')}</p>
      {news.image && <img src={news.image} alt={news.title} className="w-full h-auto rounded-lg mb-8" />}
      <div className="text-lg leading-relaxed text-gray-200">
        {(news.content || '').split('\n').map((paragraph: string, i: number) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
