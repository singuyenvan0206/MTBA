'use client';

import { useState } from 'react';
import Link from 'next/link';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { APP_ROUTES } from '@/constants/routes';
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
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): { isValid: boolean; error: string } => {
    if (password.length < 6) {
      return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Mật khẩu phải có ít nhất 1 số' };
    }
    return { isValid: true, error: '' };
  };

  const validateFullName = (name: string): { isValid: boolean; error: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'Họ và tên không được để trống' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Họ và tên không được quá 50 ký tự' };
    }
    if (!/^[\p{L}\s]+$/u.test(name)) {
      return { isValid: false, error: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng' };
    }
    return { isValid: true, error: '' };
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

    // Validate full name
    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, fullName: nameValidation.error }));
      return;
    }

    // Validate email
    if (!formData.email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Email không đúng định dạng' }));
      return;
    }

    // Validate phone
    if (!formData.phone) {
      setFieldErrors(prev => ({ ...prev, phone: 'Số điện thoại không được để trống' }));
      return;
    }
    if (!validatePhone(formData.phone)) {
      setFieldErrors(prev => ({ ...prev, phone: 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)' }));
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, password: passwordValidation.error }));
      return;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Vui lòng nhập lại mật khẩu' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu nhập lại không khớp' }));
      return;
    }

    setStep(2);
  };

  const handleSendEmailOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_SENDEMAILOTP, {
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
      const res = await fetch(API_ENDPOINTS.AUTH_VERIFYEMAILOTP, {
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

      alert(UI_MESSAGES.__NG_K__T_I_KHO_N_TH_NH_C_NG);
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
                  onChange={(e) => {
                    setFormData({...formData, fullName: e.target.value});
                    if (fieldErrors.fullName) {
                      setFieldErrors(prev => ({ ...prev, fullName: '' }));
                    }
                  }}
                  placeholder="Nhập họ và tên"
                  className={`auth-input-custom ${fieldErrors.fullName ? 'border-red-500' : ''}`}
                  style={{ borderColor: fieldErrors.fullName ? '#ff4d4f' : undefined }}
                  required 
                />
                {fieldErrors.fullName && <p className="text-[#ff4d4f] text-xs mt-1">{fieldErrors.fullName}</p>}
              </div>

              <div className="auth-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="Nhập email"
                  className={`auth-input-custom ${fieldErrors.email ? 'border-red-500' : ''}`}
                  style={{ borderColor: fieldErrors.email ? '#ff4d4f' : undefined }}
                  required 
                />
                {fieldErrors.email && <p className="text-[#ff4d4f] text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="auth-form-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (fieldErrors.phone) {
                      setFieldErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholder="Nhập số điện thoại"
                  className={`auth-input-custom ${fieldErrors.phone ? 'border-red-500' : ''}`}
                  style={{ borderColor: fieldErrors.phone ? '#ff4d4f' : undefined }}
                  required 
                />
                {fieldErrors.phone && <p className="text-[#ff4d4f] text-xs mt-1">{fieldErrors.phone}</p>}
              </div>
              
              <div className="auth-form-group">
                <label>Mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="Nhập mật khẩu"
                    className={`auth-input-custom pr-[45px] ${fieldErrors.password ? 'border-red-500' : ''}`}
                    style={{ borderColor: fieldErrors.password ? '#ff4d4f' : undefined }}
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
                {fieldErrors.password && <p className="text-[#ff4d4f] text-xs mt-1">{fieldErrors.password}</p>}
              </div>

              <div className="auth-form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({...formData, confirmPassword: e.target.value});
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Nhập lại mật khẩu"
                    className={`auth-input-custom pr-[45px] ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                    style={{ borderColor: fieldErrors.confirmPassword ? '#ff4d4f' : undefined }}
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
                {fieldErrors.confirmPassword && <p className="text-[#ff4d4f] text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Tiếp tục
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                Đã có tài khoản? <Link href={APP_ROUTES.LOGIN} style={{ color: '#ff4d4f', textDecoration: 'none' }}>Đăng nhập</Link>
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
