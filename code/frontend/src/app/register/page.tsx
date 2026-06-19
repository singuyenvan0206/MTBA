'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setStep(2);
  };

  const handleSendEmailOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Lỗi gửi mail!');
        setIsLoading(false);
        return;
      }

      setStep(3);
    } catch (err: any) {
      setError('Lỗi kết nối Server: ' + err.message);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode })
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Mã OTP không chính xác!');
        setIsLoading(false);
        return;
      }

      alert('Đăng ký tài khoản thành công! Xin mời đăng nhập.');
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
            <h2 className="auth-title-custom">Đăng ký</h2>
            <p className="auth-subtitle-custom">Hệ thống đặt vé xem phim</p>
            <form onSubmit={handleStep1}>
              {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
              
              <div className="auth-form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Nhập họ và tên"
                  className="auth-input-custom" 
                  required 
                />
              </div>

              <div className="auth-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Nhập email"
                  className="auth-input-custom" 
                  required 
                />
              </div>

              <div className="auth-form-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                  className="auth-input-custom" 
                  required 
                />
              </div>
              
              <div className="auth-form-group">
                <label>Mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Nhập lại mật khẩu"
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Tiếp tục
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                Đã có tài khoản? <Link href="/login" style={{ color: '#ff4d4f', textDecoration: 'none' }}>Đăng nhập</Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="auth-title-custom">Chọn phương thức xác thực</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Vui lòng chọn phương thức nhận mã xác thực OTP để hoàn tất đăng ký.</p>
            
            {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
            
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginBottom: '15px', color: 'var(--text-color)', borderColor: 'var(--text-muted)' }}
              onClick={handleSendEmailOtp}
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi Email...' : 'Gửi mã qua Email'}
            </button>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', backgroundColor: '#555', borderColor: '#555', color: '#fff' }}
              disabled
              title="Chức năng đang phát triển"
            >
              Gửi SMS qua Số Điện Thoại (Bảo trì)
            </button>
            
            <div style={{ marginTop: '20px' }}>
              <button className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline' }} onClick={() => setStep(1)}>
                Quay lại
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="auth-title-custom">Nhập mã Email OTP</h2>
            <form onSubmit={handleVerifyOtp}>
              {error && <p className="text-[#ff4d4f] text-center mb-6 text-sm font-medium bg-[#3a1a1f] border border-[#5c1c22] p-3 rounded-lg">{error}</p>}
              
              <p style={{ marginBottom: '15px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Mã xác thực đã được gửi tới email <strong style={{ color: 'var(--text-color)' }}>{formData.email}</strong>
              </p>
              
              <div className="auth-form-group">
                <label>Mã OTP (6 số)</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  className="auth-input-custom" 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline' }} onClick={() => setStep(2)}>
                  Quay lại
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
