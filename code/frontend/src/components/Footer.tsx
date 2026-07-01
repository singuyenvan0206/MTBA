'use client';
import { APP_ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/pos'))) return null;

  return (
    <footer className="footer">
        <div className="container footer-content">
            <div className="footer-col">
                <Link href="/">
                    <img src="/chatgpt_logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                </Link>
                <p>Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH</p>
                <p>Bản quyền thuộc Trung tâm Chiếu phim Quốc gia.</p>
            </div>
            <div className="footer-col">
                <h4>Chính sách</h4>
                <Link href={APP_ROUTES.TERMS}>Điều khoản sử dụng</Link>
                <Link href={APP_ROUTES.PRIVACY}>Chính sách bảo mật</Link>
                <Link href={APP_ROUTES.TICKET_POLICY}>Quy định vé</Link>
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
  );
}
