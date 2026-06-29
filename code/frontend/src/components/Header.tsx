"use client";
import { STORAGE_KEYS } from '@/constants/storage';
import { APP_ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRole } from '@/types/enums';

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/pos'))) return null;

  return (
    <header className="navbar">
        <div className="container nav-container">
            <div className="logo">
                <Link href="/">
                    <img src="/chatgpt_logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                </Link>
            </div>
            <nav className="nav-links">
                <Link href="/" className={pathname === '/' ? 'active' : ''}>Trang chủ</Link>
                <Link href={APP_ROUTES.CALENDAR} className={pathname === APP_ROUTES.CALENDAR ? 'active' : ''}>Lịch chiếu</Link>
                <Link href={APP_ROUTES.NEWS} className={pathname === APP_ROUTES.NEWS ? 'active' : ''}>Tin tức</Link>
                <Link href={APP_ROUTES.PROMOTIONS} className={pathname === APP_ROUTES.PROMOTIONS ? 'active' : ''}>Khuyến mãi</Link>
                <Link href={APP_ROUTES.PRICES} className={pathname === APP_ROUTES.PRICES ? 'active' : ''}>Giá vé</Link>
                <Link href={APP_ROUTES.FESTIVALS} className={pathname === APP_ROUTES.FESTIVALS ? 'active' : ''}>Liên hoan phim</Link>
            </nav>
            <div className="nav-auth">
                {user ? (
                    <>
                        {user.role === UserRole.ADMIN && (
                            <button className="btn btn-primary" style={{marginRight: '10px', background: '#dc3545'}} onClick={() => window.location.href='/admin'}>Admin Panel</button>
                        )}
                        <Link href={APP_ROUTES.PROFILE} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '15px'}}>
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=ff4d4f&color=fff`} alt="Avatar" style={{width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff4d4f'}} />
                            <span style={{color: 'var(--text-color)', fontWeight: 500}}>Hi, {user.fullName}</span>
                        </Link>
                        <button className="btn btn-outline" onClick={() => { localStorage.removeItem(STORAGE_KEYS.USER); sessionStorage.removeItem(STORAGE_KEYS.USER); window.location.href=APP_ROUTES.HOME; }}>Đăng xuất</button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-outline" onClick={() => window.location.href='/register'}>Đăng ký</button>
                        <button className="btn btn-primary" onClick={() => window.location.href='/login'}>Đăng nhập</button>
                    </>
                )}
            </div>
            <div className="hamburger" onClick={(e) => {
                const navLinks = document.querySelector('.nav-links');
                const navAuth = document.querySelector('.nav-auth');
                navLinks?.classList.toggle('active');
                navAuth?.classList.toggle('active');
            }}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>
  );
}
