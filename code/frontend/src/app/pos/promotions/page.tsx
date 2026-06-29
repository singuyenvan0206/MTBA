'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { API_ENDPOINTS } from '@/constants/endpoints';
export default function Promotions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.VOUCHERS)
      .then(res => res.json())
      .then(resData => { setData(resData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="main-content">
        <div className="container mt-40">
            <h2 className="text-center mb-40" style={{ fontSize: '28px', marginBottom: '40px', color: 'var(--text-color)', textTransform: 'uppercase' }}>Khuyến Mãi & Sự Kiện</h2>

            <div className="news-grid">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Đang tải khuyến mãi...</p>
                ) : data.length > 0 ? (
                    data.map((item, i) => (
                        <Link href={`/pos/promotions/${item.id}`} key={i} style={{ textDecoration: 'none' }}>
                            <div className="news-card">
                                <div className="news-thumb">
                                    <img src={`https://placehold.co/400x250?text=Promo+${item.code}`} alt={item.code} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div className="news-date">{new Date(item.expiration_date || Date.now()).toLocaleDateString('vi-VN')}</div>
                                    <h3 className="news-title">Mã Voucher: {item.code}</h3>
                                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.6 }}>Giảm giá: {item.discount_amount ? item.discount_amount + ' VNĐ' : item.discount_percent + '%'}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>Chưa có khuyến mãi nào.</p>
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
