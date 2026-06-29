'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { API_ENDPOINTS } from '@/constants/endpoints';
export default function PromotionDetail() {
  const { id } = useParams();
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.VOUCHERS_}${id}`)
      .then(res => res.json())
      .then(data => { setPromo(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center  py-20">Đang tải...</div>;
  if (!promo) return <div className="text-center  py-20">Không tìm thấy khuyến mãi.</div>;

  return (
    <div className="container mx-auto px-4 py-16  min-h-screen max-w-3xl text-center">
      <div className=" p-10 rounded-xl border border-[#ff4d4f]" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h1 className="text-3xl font-bold mb-6 text-[#ff4d4f]">MÃ GIẢM GIÁ: {promo.code}</h1>
        <div className="text-xl mb-4">
          Mức giảm: <span className="font-bold text-green-400">{promo.discount_amount ? promo.discount_amount + ' VNĐ' : promo.discount_percent + '%'}</span>
        </div>
        {promo.min_order_value && (
          <p className="text-[color:var(--text-secondary)] mb-2">Đơn tối thiểu: {promo.min_order_value} VNĐ</p>
        )}
        {promo.max_discount && (
          <p className="text-[color:var(--text-secondary)] mb-6">Giảm tối đa: {promo.max_discount} VNĐ</p>
        )}
        <div className="text-sm text-[color:var(--text-secondary)] mt-8 border-t border-gray-800 pt-6">
          Thời gian áp dụng: {new Date(promo.start_time).toLocaleDateString('vi-VN')} - {new Date(promo.end_time).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </div>
  );
}
