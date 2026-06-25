'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types/enums';
import { AppMessage } from '@/types/messages';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || AppMessage.LOGIN_FAILED);
        return;
      }

      const user = await res.json();
      
      if (user.role === UserRole.ADMIN) {
        setError(AppMessage.LOGIN_ADMIN_REDIRECT);
        return;
      }

      if (user.role === 'staff') {
        setError('Tài khoản Nhân viên vui lòng đăng nhập tại trang POS.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err) {
      setError(AppMessage.LOGIN_CONNECTION_ERROR);
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }} className="transition-colors duration-300">
      <div className="auth-card-custom relative animate-[fadeIn_0.2s] transition-colors duration-300">
        <h2 className="auth-title-custom">Đăng nhập</h2>
        <p className="auth-subtitle-custom">Hệ thống đặt vé xem phim</p>
        
        <form onSubmit={handleLogin}>
          {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
          
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
            <Link href="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>Quên mật khẩu?</Link>
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
    </main>
  );
}
