'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FestivalDetail() {
  const { id } = useParams();
  const [festival, setFestival] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/festivals/${id}`)
      .then(res => res.json())
      .then(data => { setFestival(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center  py-20">Đang tải...</div>;
  if (!festival) return <div className="text-center  py-20">Không tìm thấy LHP.</div>;

  return (
    <div className="container mx-auto px-4 py-16  min-h-screen max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-[#ff4d4f]">{festival.title}</h1>
      <div className="flex items-center space-x-4 mb-8 text-[color:var(--text-secondary)]">
        <span className="bg-gray-800 px-3 py-1 rounded">
          Từ: {new Date(festival.start_time).toLocaleDateString('vi-VN')}
        </span>
        <span className="bg-gray-800 px-3 py-1 rounded">
          Đến: {new Date(festival.end_time).toLocaleDateString('vi-VN')}
        </span>
      </div>
      {festival.image && <img src={festival.image} alt={festival.title} className="w-full h-auto rounded-lg mb-8" />}
      <div className="text-lg leading-relaxed text-gray-200">
        {festival.content ? festival.content.split('\n').map((paragraph: string, i: number) => (
          <p key={i} className="mb-4">{paragraph}</p>
        )) : <p className="mb-4">Không có nội dung</p>}
      </div>
    </div>
  );
}
