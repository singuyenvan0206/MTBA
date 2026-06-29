"use client";
import { STORAGE_KEYS } from '@/constants/storage';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TheaterProvider } from '../pos/TheaterContext';
import TheaterSelector from '../pos/TheaterSelector';
import { usePosSync } from '../../hooks/usePosSync';

import { useEffect } from 'react';

import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { APP_ROUTES } from '@/constants/routes';
export default function Pos2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  usePosSync(true);

  useEffect(() => {
    if (pathname === '/pos2/login') return;
    const stored = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    if (!stored) {
      window.location.href = '/pos2/login';
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user.role !== ROLES.STAFF) {
        window.location.href = '/pos2/login';
      }
    } catch (e) {
      window.location.href = '/pos2/login';
    }
  }, [pathname]);

  return (
    <TheaterProvider>
      <header className="navbar">
          <div className="container nav-container">
              <div className="logo">
                  <Link href={APP_ROUTES.POS2}><img src="/chatgpt_logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} /></Link>
              </div>
              <nav className="nav-links">
                  <Link href={APP_ROUTES.POS2} className={pathname === APP_ROUTES.POS2 ? 'active' : ''} style={pathname === APP_ROUTES.POS2 ? { color: 'var(--primary-color)' } : {}}>Trang chủ</Link>
                  <Link href={`${APP_ROUTES.POS2}/calendar`} className={pathname === '/pos2/calendar' ? 'active' : ''} style={pathname === '/pos2/calendar' ? { color: 'var(--primary-color)' } : {}}>Lịch chiếu</Link>
                  <Link href={`${APP_ROUTES.POS2}/news`} className={pathname === '/pos2/news' ? 'active' : ''} style={pathname === '/pos2/news' ? { color: 'var(--primary-color)' } : {}}>Tin tức</Link>
                  <Link href={`${APP_ROUTES.POS2}/promotions`} className={pathname === '/pos2/promotions' ? 'active' : ''} style={pathname === '/pos2/promotions' ? { color: 'var(--primary-color)' } : {}}>Khuyến mãi</Link>
                  <Link href={`${APP_ROUTES.POS2}/prices`} className={pathname === '/pos2/prices' ? 'active' : ''} style={pathname === '/pos2/prices' ? { color: 'var(--primary-color)' } : {}}>Giá vé</Link>
                  <Link href={`${APP_ROUTES.POS2}/festivals`} className={pathname === '/pos2/festivals' ? 'active' : ''} style={pathname === '/pos2/festivals' ? { color: 'var(--primary-color)' } : {}}>Liên hoan phim</Link>
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
