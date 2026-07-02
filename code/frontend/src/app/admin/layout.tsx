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

// ─── Nav group definitions ──────────────────────────────────────────────────
type NavItem = { label: string; href: string; match: (p: string) => boolean };
type NavGroup = { id: string; label: string; icon: string; items: NavItem[]; matchGroup: (p: string) => boolean };

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'movies',
    label: 'Phim & Nội dung',
    icon: '🎬',
    matchGroup: (p) => ['/admin/movies', '/admin/festivals', '/admin/genres', '/admin/age-limits'].some(r => p.startsWith(r)),
    items: [
      { label: 'Quản lý Phim', href: `${APP_ROUTES.ADMIN}/movies`, match: (p) => p.startsWith('/admin/movies') },
      { label: 'Liên hoan phim', href: `${APP_ROUTES.ADMIN}/festivals`, match: (p) => p.startsWith('/admin/festivals') },
      { label: 'Quản lý Thể loại', href: `${APP_ROUTES.ADMIN}/genres`, match: (p) => p.startsWith('/admin/genres') },
      { label: 'Quản lý Độ tuổi', href: `${APP_ROUTES.ADMIN}/age-limits`, match: (p) => p.startsWith('/admin/age-limits') },
    ],
  },
  {
    id: 'cinema',
    label: 'Rạp & Cơ sở vật chất',
    icon: '🏢',
    matchGroup: (p) => ['/admin/cinemas', '/admin/screens', '/admin/roomtypes', '/admin/seats'].some(r => p.startsWith(r)),
    items: [
      { label: 'Quản lý Cụm Rạp', href: `${APP_ROUTES.ADMIN}/cinemas`, match: (p) => p.startsWith('/admin/cinemas') },
      { label: 'Quản lý Phòng chiếu', href: `${APP_ROUTES.ADMIN}/screens`, match: (p) => p.startsWith('/admin/screens') },
      { label: 'Quản lý Loại phòng', href: `${APP_ROUTES.ADMIN}/roomtypes`, match: (p) => p.startsWith('/admin/roomtypes') },
      { label: 'Quản lý Ghế', href: `${APP_ROUTES.ADMIN}/seats`, match: (p) => p.startsWith('/admin/seats') },
    ],
  },
  {
    id: 'schedule',
    label: 'Lịch chiếu & Giá',
    icon: '🎟️',
    matchGroup: (p) => ['/admin/showtimes', '/admin/prices'].some(r => p.startsWith(r)),
    items: [
      { label: 'Quản lý Lịch chiếu', href: `${APP_ROUTES.ADMIN}/showtimes`, match: (p) => p.startsWith('/admin/showtimes') },
      { label: 'Quản lý Giá vé', href: `${APP_ROUTES.ADMIN}/prices`, match: (p) => p.startsWith('/admin/prices') },
    ],
  },
  {
    id: 'users',
    label: 'Người dùng & Giao dịch',
    icon: '👤',
    matchGroup: (p) => ['/admin/bookings', '/admin/users'].some(r => p.startsWith(r)),
    items: [
      { label: 'Quản lý Đặt Vé', href: `${APP_ROUTES.ADMIN}/bookings`, match: (p) => p.startsWith('/admin/bookings') },
      { label: 'Quản lý Người dùng', href: `${APP_ROUTES.ADMIN}/users`, match: (p) => p.startsWith('/admin/users') },
    ],
  },
];

// ─── NavGroup accordion component ───────────────────────────────────────────
function SidebarGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(() => group.matchGroup(pathname));

  const hasActive = group.matchGroup(pathname);

  return (
    <div>
      {/* Group header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: hasActive ? 'var(--primary)' : 'var(--text-muted)',
          fontWeight: 600,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          transition: 'color 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{group.icon}</span>
          <span>{group.label}</span>
        </span>
        <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Group items */}
      <div style={{ overflow: 'hidden', maxHeight: open ? '500px' : '0px', transition: 'max-height 0.25s ease' }}>
        {group.items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 20px 10px 44px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: active ? 'rgba(255, 77, 79, 0.1)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                borderRight: active ? '3px solid var(--primary)' : 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main layout ─────────────────────────────────────────────────────────────
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
      <aside className={`flex-shrink-0 h-screen relative z-20 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-[260px]' : 'w-[0px] overflow-hidden'}`} style={{ backgroundColor: 'var(--card-bg)', borderRight: isSidebarOpen ? '1px solid var(--card-border)' : 'none' }}>
        {/* Sidebar Header: Logo + Toggle Button */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href={APP_ROUTES.ADMIN}>
            <img src="/chatgpt_logo.png" alt="Logo" style={{ maxHeight: '40px' }} />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
          >
            ☰
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {/* Dashboard – standalone link */}
          <div style={{ padding: '8px 0 4px' }}>
            <Link
              href={APP_ROUTES.ADMIN}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'all 0.2s',
                backgroundColor: pathname === APP_ROUTES.ADMIN ? 'rgba(255, 77, 79, 0.1)' : 'transparent',
                color: pathname === APP_ROUTES.ADMIN ? 'var(--primary)' : 'var(--text-muted)',
                borderRight: pathname === APP_ROUTES.ADMIN ? '3px solid var(--primary)' : 'none',
              }}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--card-border)', margin: '4px 16px 4px' }} />

          {/* Accordion groups */}
          <div style={{ paddingTop: '4px' }}>
            {NAV_GROUPS.map((group) => (
              <SidebarGroup key={group.id} group={group} pathname={pathname} />
            ))}
          </div>
        </nav>

        {/* Sidebar Footer: fixed at bottom */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--card-border)', flexShrink: 0 }}>
          <Link href={APP_ROUTES.POS2} target="_blank" style={{ display: 'block', padding: '12px 20px', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'center', border: '2px solid var(--primary)', borderRadius: '4px', textDecoration: 'none', marginBottom: '12px' }}>
            💻 Quầy Bán Vé (POS)
          </Link>
          <Link href="/" style={{ display: 'block', color: 'var(--text-muted)', textAlign: 'center', textDecoration: 'none' }}>
            ← Về trang khách
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Top Bar */}
        <div style={{ padding: '15px 30px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0 }}>
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', marginRight: 'auto' }}
            >
              ☰
            </button>
          )}
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
        {/* Page Content */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {children}
        </main>
      </div>
    </div>
  );
}
