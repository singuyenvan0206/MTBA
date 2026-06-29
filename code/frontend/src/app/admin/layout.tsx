"use client";
import { STORAGE_KEYS } from '@/constants/storage';

import { Roboto } from "next/font/google";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import "../globals.css";
import { UserRole } from '@/types/enums';

import { APP_ROUTES } from '@/constants/routes';
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAdminUser(true); // Bypass check for login page
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.role === UserRole.ADMIN) {
          setAdminUser(user);
        } else {
          window.location.href = '/admin/login';
        }
      } catch (e) {
        window.location.href = '/admin/login';
      }
    } else {
      window.location.href = '/admin/login';
    }
  }, [pathname]);

  if (!adminUser) return null;

  // If we are on the login page, don't render the sidebar/header
  if (pathname === '/admin/login') {
    return <div className={`min-h-screen antialiased ${roboto.className}`}>{children}</div>;
  }

  return (
    <div className={`min-h-screen flex antialiased ${roboto.className} overflow-hidden`}>
      {/* Classic Sidebar */}
      <aside className={`flex-shrink-0 min-h-screen relative z-20 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[260px]' : 'w-[0px] overflow-hidden'}`} style={{ backgroundColor: 'var(--card-bg)', borderRight: isSidebarOpen ? '1px solid var(--card-border)' : 'none' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', textAlign: 'center' }}>
          <Link href={APP_ROUTES.ADMIN}>
            <img src="https://placehold.co/150x40/ff4d4f/FFF?text=ADMIN+PANEL" alt="Logo" style={{ maxHeight: '40px', margin: '0 auto' }} />
          </Link>
        </div>
        <nav className="flex-1 py-[20px] flex flex-col overflow-y-auto overflow-x-hidden">
          <Link href={APP_ROUTES.ADMIN} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname === APP_ROUTES.ADMIN ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname === APP_ROUTES.ADMIN ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname === APP_ROUTES.ADMIN ? '3px solid var(--primary)' : 'none' }}>
            Dashboard
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/movies`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/movies') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/movies') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/movies') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Phim
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/cinemas`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/cinemas') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/cinemas') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/cinemas') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Cụm Rạp
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/screens`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/screens') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/screens') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/screens') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Phòng chiếu
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/showtimes`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/showtimes') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/showtimes') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/showtimes') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Lịch chiếu
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/seats`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/seats') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/seats') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/seats') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Ghế
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/prices`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/prices') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/prices') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/prices') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Giá vé
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/festivals`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/festivals') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/festivals') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/festivals') ? '3px solid var(--primary)' : 'none' }}>
            Liên hoan phim
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/bookings`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/bookings') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/bookings') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/bookings') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Đặt Vé
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/users`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/users') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/users') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/users') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Người dùng
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/genres`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/genres') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/genres') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/genres') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Thể loại
          </Link>
          <Link href={`${APP_ROUTES.ADMIN}/age-limits`} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', fontWeight: 500, transition: 'all 0.3s', backgroundColor: pathname.startsWith('/admin/age-limits') ? 'rgba(255, 77, 79, 0.1)' : 'transparent', color: pathname.startsWith('/admin/age-limits') ? 'var(--primary)' : 'var(--text-muted)', borderRight: pathname.startsWith('/admin/age-limits') ? '3px solid var(--primary)' : 'none' }}>
            Quản lý Độ tuổi
          </Link>
          
          <div style={{ marginTop: 'auto', padding: '20px' }}>
            <Link href={APP_ROUTES.POS2} target="_blank" style={{ display: 'block', padding: '15px 20px', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'center', border: '2px solid var(--primary)', borderRadius: '4px', textDecoration: 'none', marginBottom: '15px' }}>
              💻 Quầy Bán Vé (POS)
            </Link>
            <Link href="/" style={{ display: 'block', color: 'var(--text-muted)', textAlign: 'center', textDecoration: 'none' }}>
              ← Về trang khách
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Page Content */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', marginRight: '15px' }}
              >
                ☰
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginRight: '15px' }}>Xin chào, {adminUser.fullName}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
                  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                  window.location.href = '/admin/login';
                }}
                style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'var(--text-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
