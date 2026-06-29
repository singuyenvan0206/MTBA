"use client";
import { STORAGE_KEYS } from '@/constants/storage';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TheaterProvider } from './TheaterContext';
import TheaterSelector from './TheaterSelector';
import { usePosSync } from '../../hooks/usePosSync';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/constants/routes';
export default function Pos2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  usePosSync(false);

  useEffect(() => {
    // POS is for staff_user now
    const staffUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    if (!staffUser) {
      router.push(`${APP_ROUTES.POS2}/login`);
    }
  }, [router]);

  return (
    <TheaterProvider>
      <header className="navbar">
          <div className="container nav-container">
              <div className="logo">
                  <Link href={APP_ROUTES.POS}><img src="/chatgpt_logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} /></Link>
              </div>
              <nav className="nav-links">
                  <Link href={APP_ROUTES.POS} className={pathname === APP_ROUTES.POS ? 'active' : ''} style={pathname === APP_ROUTES.POS ? { color: 'var(--primary-color)' } : {}}>Trang chủ</Link>
                  <Link href={`${APP_ROUTES.POS}/calendar`} className={pathname === '/pos/calendar' ? 'active' : ''} style={pathname === '/pos/calendar' ? { color: 'var(--primary-color)' } : {}}>Lịch chiếu</Link>
                  <Link href={`${APP_ROUTES.POS}/news`} className={pathname === '/pos/news' ? 'active' : ''} style={pathname === '/pos/news' ? { color: 'var(--primary-color)' } : {}}>Tin tức</Link>
                  <Link href={`${APP_ROUTES.POS}/promotions`} className={pathname === '/pos/promotions' ? 'active' : ''} style={pathname === '/pos/promotions' ? { color: 'var(--primary-color)' } : {}}>Khuyến mãi</Link>
                  <Link href={`${APP_ROUTES.POS}/prices`} className={pathname === '/pos/prices' ? 'active' : ''} style={pathname === '/pos/prices' ? { color: 'var(--primary-color)' } : {}}>Giá vé</Link>
                  <Link href={`${APP_ROUTES.POS}/festivals`} className={pathname === '/pos/festivals' ? 'active' : ''} style={pathname === '/pos/festivals' ? { color: 'var(--primary-color)' } : {}}>Liên hoan phim</Link>
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
