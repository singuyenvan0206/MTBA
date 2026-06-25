'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TheaterProvider } from './TheaterContext';
import TheaterSelector from './TheaterSelector';
import { usePosSync } from '../../hooks/usePosSync';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Pos2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  usePosSync(false);

  useEffect(() => {
    // POS is for staff_user now
    const staffUser = localStorage.getItem('staff_user');
    if (!staffUser) {
      router.push('/pos2/login');
    }
  }, [router]);

  return (
    <TheaterProvider>
      <header className="navbar">
          <div className="container nav-container">
              <div className="logo">
                  <Link href="/pos"><img src="https://placehold.co/100x40/ff4d4f/FFF?text=LOGO" alt="Logo" /></Link>
              </div>
              <nav className="nav-links">
                  <Link href="/pos" className={pathname === '/pos' ? 'active' : ''} style={pathname === '/pos' ? { color: 'var(--primary-color)' } : {}}>Trang chủ</Link>
                  <Link href="/pos/calendar" className={pathname === '/pos/calendar' ? 'active' : ''} style={pathname === '/pos/calendar' ? { color: 'var(--primary-color)' } : {}}>Lịch chiếu</Link>
                  <Link href="/pos/news" className={pathname === '/pos/news' ? 'active' : ''} style={pathname === '/pos/news' ? { color: 'var(--primary-color)' } : {}}>Tin tức</Link>
                  <Link href="/pos/promotions" className={pathname === '/pos/promotions' ? 'active' : ''} style={pathname === '/pos/promotions' ? { color: 'var(--primary-color)' } : {}}>Khuyến mãi</Link>
                  <Link href="/pos/prices" className={pathname === '/pos/prices' ? 'active' : ''} style={pathname === '/pos/prices' ? { color: 'var(--primary-color)' } : {}}>Giá vé</Link>
                  <Link href="/pos/festivals" className={pathname === '/pos/festivals' ? 'active' : ''} style={pathname === '/pos/festivals' ? { color: 'var(--primary-color)' } : {}}>Liên hoan phim</Link>
              </nav>
              <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <TheaterSelector />
                  <span className="btn" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>HỆ THỐNG POS TẠI QUẦY</span>
              </div>
              <div className="hamburger">
                  <span></span>
                  <span></span>
                  <span></span>
              </div>
          </div>
      </header>

      {children}

      <footer className="footer">
          <div className="container footer-content">
              <div className="footer-col">
                  <img src="https://placehold.co/100x40/ff4d4f/FFF?text=LOGO" alt="Logo" />
                  <p>Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH</p>
                  <p>Bản quyền thuộc Trung tâm Chiếu phim Quốc gia.</p>
              </div>
              <div className="footer-col">
                  <h4>Chính sách</h4>
                  <a href="#">Điều khoản sử dụng</a>
                  <a href="#">Chính sách bảo mật</a>
                  <a href="#">Quy định vé</a>
              </div>
              <div className="footer-col">
                  <h4>Kết nối</h4>
                  <div className="socials">
                      <span>FB</span> <span>YT</span> <span>IG</span>
                  </div>
                  <p>Hotline: 1900 1234</p>
              </div>
          </div>
      </footer>
    </TheaterProvider>
  );
}
