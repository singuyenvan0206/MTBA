'use client';

import { useState } from 'react';
import { UserRole } from '@/types/enums';
import { AppMessage } from '@/types/messages';

export default function AdminLogin() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      
      if (user.role !== UserRole.ADMIN) {
        setError(AppMessage.LOGIN_ADMIN_ONLY);
        return;
      }

      localStorage.setItem('admin_user', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('remember', 'true');
      } else {
        localStorage.removeItem('remember');
      }
      window.location.href = '/admin';
    } catch (err) {
      setError(AppMessage.LOGIN_CONNECTION_ERROR);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', fontFamily: 'Arial, sans-serif' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#ff4d4f', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin Login
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: '14px', color: 'var(--foreground)', opacity: 0.8 }}>
            Hệ thống Quản trị Rạp Phim
          </p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <p style={{ color: '#ff4d4f', textAlign: 'center', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              required
              style={{ width: '100%', padding: '12px 15px', border: '1px solid #444', borderRadius: '5px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s', backgroundColor: 'transparent', color: 'var(--foreground)' }}
              placeholder="Email / Số điện thoại"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#ff4d4f'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                style={{ width: '100%', padding: '12px 40px 12px 15px', border: '1px solid #444', borderRadius: '5px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s', backgroundColor: 'transparent', color: 'var(--foreground)' }}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#ff4d4f'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: 'var(--foreground)' }}>
              <input
                type="checkbox"
                style={{ marginRight: '8px', cursor: 'pointer' }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ tôi
            </label>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '14px', backgroundColor: '#ff4d4f', color: 'var(--text-color)', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background-color 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d9363e'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
          >
            Đăng nhập Admin
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <a href="/pos2" style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none' }}>
              &larr; Hệ thống POS tại quầy
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
