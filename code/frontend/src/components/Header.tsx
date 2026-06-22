'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
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
                    <img src="https://placehold.co/100x40/ff4d4f/FFF?text=LOGO" alt="Logo" />
                </Link>
            </div>
            <nav className="nav-links">
                <Link href="/" className={pathname === '/' ? 'active' : ''}>Trang chủ</Link>
                <Link href="/calendar" className={pathname === '/calendar' ? 'active' : ''}>Lịch chiếu</Link>
                <Link href="/news" className={pathname === '/news' ? 'active' : ''}>Tin tức</Link>
                <Link href="/promotions" className={pathname === '/promotions' ? 'active' : ''}>Khuyến mãi</Link>
                <Link href="/prices" className={pathname === '/prices' ? 'active' : ''}>Giá vé</Link>
                <Link href="/festivals" className={pathname === '/festivals' ? 'active' : ''}>Liên hoan phim</Link>
            </nav>
            <div className="nav-auth">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <button className="btn btn-primary" style={{marginRight: '10px', background: '#dc3545'}} onClick={() => window.location.href='/admin'}>Admin Panel</button>
                        )}
                        <Link href="/profile" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '15px'}}>
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=ff4d4f&color=fff`} alt="Avatar" style={{width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff4d4f'}} />
                            <span style={{color: 'var(--text-color)', fontWeight: 500}}>Hi, {user.fullName}</span>
                        </Link>
                        <button className="btn btn-outline" onClick={() => { localStorage.removeItem('user'); sessionStorage.removeItem('user'); window.location.href='/'; }}>Đăng xuất</button>
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
