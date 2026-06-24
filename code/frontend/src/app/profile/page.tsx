'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatar: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      fullName: parsedUser.fullName || parsedUser.first_name + ' ' + parsedUser.last_name || '',
      phone: parsedUser.phone || '',
      address: parsedUser.address || '',
      avatar: parsedUser.avatar || '',
      password: ''
    });

    // Lấy lịch sử đặt vé
    fetch(`/api/bookings/user/${parsedUser.id}`, {
      headers: {
        'Authorization': `Bearer ${parsedUser.accessToken || ''}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error('Dữ liệu đặt vé không hợp lệ:', data);
          setBookings([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải lịch sử:', err);
        setBookings([]);
        setLoading(false);
      });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const first_name = nameParts.length > 1 ? nameParts[0] : formData.fullName;
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const payload: any = {
        first_name,
        last_name,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }

      const updatedUserFromDb = await res.json();
      
      const newUserSession = {
        ...user,
        fullName: `${updatedUserFromDb.first_name} ${updatedUserFromDb.last_name}`.trim(),
        first_name: updatedUserFromDb.first_name,
        last_name: updatedUserFromDb.last_name,
        phone: updatedUserFromDb.phone,
        address: updatedUserFromDb.address,
        avatar: updatedUserFromDb.avatar,
      };

      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(newUserSession));
      } else {
        sessionStorage.setItem('user', JSON.stringify(newUserSession));
      }

      setUser(newUserSession);
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
      setMessage('Cập nhật thông tin thành công!');
      
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Lỗi kết nối server khi cập nhật');
    }
  };

  if (!user) return <div className="text-center py-20 text-[color:var(--text-secondary)]">Đang tải...</div>;

  return (
    <main className="main-content">
        <div className="container auth-layout" style={{ alignItems: 'flex-start', paddingTop: '50px', maxWidth: '1400px', width: '95%' }}>
            <div className="auth-card" style={{ flex: 1, minWidth: '300px', maxWidth: '350px', padding: '40px', margin: '10px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img 
                      src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=ff4d4f&color=fff`} 
                      alt="Avatar" 
                      style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-color)', marginBottom: '15px', boxShadow: '0 0 15px rgba(255, 77, 79, 0.3)' }} 
                    />
                    <h2>{formData.fullName}</h2>
                    <p style={{ color: '#aaa' }}>{user.email}</p>
                </div>
                
                <form className="auth-form" onSubmit={handleUpdate}>
                    {message && <p style={{ color: '#4caf50', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
                    
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input 
                          type="text" 
                          placeholder="Nhập họ và tên" 
                          required 
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input 
                          type="tel" 
                          placeholder="Nhập số điện thoại" 
                          required 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Địa chỉ</label>
                        <input 
                          type="text" 
                          placeholder="Nhập địa chỉ của bạn" 
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Đường dẫn ảnh đại diện (URL)</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com/avatar.jpg" 
                          value={formData.avatar}
                          onChange={e => setFormData({...formData, avatar: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Đổi Mật khẩu (Bỏ trống nếu không muốn đổi)</label>
                        <input 
                          type="password" 
                          placeholder="Nhập mật khẩu mới" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <div className="auth-actions" style={{ marginTop: '30px' }}>
                        <button type="submit" className="btn btn-primary w-100">Cập nhật thông tin</button>
                    </div>
                </form>
            </div>
            
            {/* Booking History */}
            <div className="auth-card" style={{ flex: 3, minWidth: '600px', padding: '40px', margin: '10px', overflow: 'hidden' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', fontSize: '24px' }}>Lịch sử đặt vé</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <th style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 500 }}>Phim</th>
                                <th style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 500 }}>Suất chiếu</th>
                                <th style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 500 }}>Rạp/Phòng</th>
                                <th style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 500 }}>Số ghế</th>
                                <th style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontWeight: 500 }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải dữ liệu...</td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Bạn chưa có lịch sử đặt vé nào.</td>
                                </tr>
                            ) : (
                                bookings.map(booking => {
                                  const movieTitle = booking.showtime?.movie?.title || 'Phim';
                                  const showDate = new Date(booking.showtime?.start_time).toLocaleString('vi-VN');
                                  const screenName = booking.showtime?.screen?.name || 'RAP 1';
                                  const seats = booking.bookingseat?.map((bs: any) => bs.seat.seat_number).join(', ') || '';
                                  const statusStr = 'Thành công';

                                  return (
                                    <tr key={booking.id}>
                                      <td style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}><strong>{movieTitle}</strong></td>
                                      <td style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ccc' }}>{showDate}</td>
                                      <td style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{screenName}</td>
                                      <td style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary-color)', fontWeight: 'bold' }}>{seats}</td>
                                      <td style={{ padding: '15px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                          <span style={{ padding: '5px 10px', background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50', borderRadius: '4px', fontSize: '12px' }}>{statusStr}</span>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
  );
}
