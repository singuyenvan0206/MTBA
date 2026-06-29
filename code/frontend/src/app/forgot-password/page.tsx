'use client';

import { useState } from 'react';
import Link from 'next/link';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { APP_ROUTES } from '@/constants/routes';
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH_FORGOTPASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Yêu cầu mã OTP thất bại!');
        setIsLoading(false);
        return;
      }

      setMessage(data.message || 'Mã OTP đã được gửi về email của bạn!');
      setStep(2);
    } catch (err: any) {
      setError('Lỗi kết nối Server: ' + err.message);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.AUTH_RESETPASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Khôi phục mật khẩu thất bại!');
        setIsLoading(false);
        return;
      }

      alert(UI_MESSAGES.KH_I_PH_C_M_T_KH_U_TH_NH_C_NG);
      window.location.href = '/login';
    } catch (err: any) {
      setError('Lỗi kết nối Server: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }} className="transition-colors duration-300">
      <div className="auth-card-custom relative animate-[fadeIn_0.2s] transition-colors duration-300" style={{ maxWidth: '500px', width: '100%' }}>
        
        {step === 1 && (
          <>
            <h2 className="auth-title-custom">Quên mật khẩu</h2>
            <p className="auth-subtitle-custom">Nhập email để nhận mã OTP khôi phục mật khẩu</p>
            <form onSubmit={handleRequestOtp}>
              {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
              
              <div className="auth-form-group">
                <label>Email tài khoản</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email đăng ký của bạn"
                  className="auth-input-custom" 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                Quay lại <Link href={APP_ROUTES.LOGIN} style={{ color: '#ff4d4f', textDecoration: 'none' }}>Đăng nhập</Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="auth-title-custom">Đặt mật khẩu mới</h2>
            <p className="auth-subtitle-custom" style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
              Mã xác thực đã được gửi tới email <strong style={{ color: 'var(--text-color)' }}>{email}</strong>
            </p>
            
            <form onSubmit={handleResetPassword}>
              {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
              {message && <p className="text-[#28a745] text-center mb-6 text-sm font-medium bg-[#1e3a24] border border-[#1c5c2d] p-3 rounded-lg">{message}</p>}

              <div className="auth-form-group">
                <label>Mã OTP xác nhận (6 số)</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập mã 6 số nhận từ Email"
                  className="auth-input-custom" 
                  required 
                />
              </div>

              <div className="auth-form-group">
                <label>Mật khẩu mới</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="auth-input-custom pr-[45px]" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: 'var(--text-muted)' }}
                    className="absolute right-[15px] top-[14px] hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label>Nhập lại mật khẩu mới</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    className="auth-input-custom pr-[45px]" 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: 'var(--text-muted)' }}
                    className="absolute right-[15px] top-[14px] hover:opacity-80 transition-opacity"
                  >
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline' }} onClick={() => setStep(1)}>
                  Quay lại bước trước
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </main>
  );
}
