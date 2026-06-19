'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/pos'))) return null;

  return (
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
  );
}
