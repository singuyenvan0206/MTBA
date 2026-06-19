'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function QuickLoginModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const dismissed = sessionStorage.getItem('loginPopupDismissed');

    if (!userStr && !isAuthPage && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isVisible) return null;

  const handleClose = () => {
    sessionStorage.setItem('loginPopupDismissed', 'true');
    setIsVisible(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });

      if (res.ok) {
        const user = await res.json();
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          sessionStorage.setItem('user', JSON.stringify(user));
        }
        window.location.reload();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.message || 'Sai tài khoản hoặc mật khẩu!'));
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={handleOverlayClick}
      style={{ padding: '20px' }}
    >
      <div className="auth-card-custom relative animate-[fadeIn_0.2s]">
        <span 
          onClick={handleClose} 
          style={{ color: 'var(--text-muted)' }}
          className="absolute top-[15px] right-[20px] text-[28px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          &times;
        </span>

        <h2 className="auth-title-custom">Đăng nhập</h2>
        <p className="auth-subtitle-custom">Hệ thống đặt vé xem phim</p>
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email hoặc Số điện thoại</label>
            <input 
              type="text" 
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="Nhập email hoặc số điện thoại"
              className="auth-input-custom" 
              required 
            />
          </div>
          
          <div className="auth-form-group">
            <label>Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="auth-input-custom pr-[45px]" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--text-muted)' }}
                className="absolute right-[15px] top-[14px] hover:opacity-80 transition-opacity"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[20px] h-[20px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[20px] h-[20px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="cursor-pointer w-[16px] h-[16px] accent-[#ff4d4f]" 
              />
              Ghi nhớ tôi
            </label>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>Quên mật khẩu?</a>
          </div>

          <div className="auth-actions-custom">
            <button type="submit" className="auth-btn-custom">
              ĐĂNG NHẬP
            </button>
          </div>
        </form>

        <div className="auth-links-custom">
          Chưa có tài khoản? <a href="/register" style={{ color: '#ff4d4f', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay</a>
        </div>
      </div>
    </div>
  );
}
