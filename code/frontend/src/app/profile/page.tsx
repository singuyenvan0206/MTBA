'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentStatus, PaymentMethod } from '@/types/enums';

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
          <style jsx global>{`
            .profile-layout {
              display: flex;
              align-items: flex-start;
              padding-top: 50px;
              max-width: 1400px;
              width: 95%;
              margin: 0 auto;
              flex-wrap: wrap;
            }
            .profile-left {
              flex: 1;
              min-width: 300px;
              padding: 40px;
              margin: 10px;
            }
            .profile-right {
              flex: 3;
              min-width: 300px;
              max-width: 100%;
              padding: 40px;
              margin: 10px;
              overflow: hidden;
              background: transparent;
              border: none;
              box-shadow: none;
            }
            .ticket-card {
              display: flex;
              flex-direction: row;
            }
            .ticket-image {
              width: 150px;
            }
            .ticket-info-grid {
              grid-template-columns: repeat(4, 1fr);
            }
            .ticket-header {
               display: flex;
               justify-content: space-between;
               align-items: flex-start;
            }
            .ticket-header-right {
               text-align: right;
            }
            
            @media (max-width: 768px) {
              .profile-layout {
                padding-top: 20px;
                width: 100%;
              }
              .profile-left, .profile-right {
                padding: 20px;
                margin: 0;
                width: 100%;
                flex: none;
              }
              .ticket-card {
                flex-direction: column;
              }
              .ticket-image {
                width: 100%;
                height: 200px;
              }
              .ticket-info-grid {
                grid-template-columns: 1fr 1fr !important;
              }
              .ticket-header {
                 flex-direction: column;
                 gap: 15px;
              }
              .ticket-header-right {
                 text-align: left;
              }
            }
          `}</style>
          <div className="profile-layout">
              <div className="auth-card profile-left">
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
            <div className="auth-card profile-right">
                <h2 style={{ marginBottom: '30px', color: '#fff', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '30px', height: '30px', color: 'var(--primary-color)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                    </svg>
                    Lịch sử đặt vé
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải dữ liệu...</div>
                    ) : bookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#888', background: 'var(--card-bg)', borderRadius: '15px', border: '1px dashed #444' }}>Bạn chưa có lịch sử đặt vé nào.</div>
                    ) : (
                        bookings.map(booking => {
                          const pm = booking.payment?.[0];
                          const isPaid = pm?.payment_status === PaymentStatus.COMPLETED;
                          
                          let statusStr = '';
                          let statusBg = '';
                          let statusColor = '';
                          let showPayButton = false;

                          if (isPaid) {
                            statusStr = 'Đã thanh toán';
                            statusBg = 'rgba(52, 211, 153, 0.15)';
                            statusColor = '#34d399';
                          } else {
                            const createdTime = new Date(booking.created_at).getTime();
                            const elapsedMs = Date.now() - createdTime;
                            const isBookingExpired = elapsedMs > 5 * 60 * 1000;
                            
                            if (isBookingExpired) {
                              statusStr = 'Đã hết hạn / Đã hủy';
                              statusBg = 'rgba(239, 68, 68, 0.15)';
                              statusColor = '#ef4444';
                            } else {
                              const minutesLeft = Math.ceil((5 * 60 * 1000 - elapsedMs) / 60000);
                              statusStr = `Chờ thanh toán (Còn ${minutesLeft} phút)`;
                              statusBg = 'rgba(251, 191, 36, 0.15)';
                              statusColor = '#fbbf24';
                              showPayButton = true;
                            }
                          }

                          const movieTitle = booking.showtime?.movie?.title || 'Phim đã xóa';
                          const movieImage = booking.showtime?.movie?.image || 'https://placehold.co/200x300?text=No+Image';
                          const showDate = new Date(booking.showtime?.start_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                          const bookingDate = new Date(booking.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                          
                          const theaterName = booking.showtime?.screen?.theater?.name || '';
                          const screenName = booking.showtime?.screen?.name || 'Phòng chiếu';
                          const seats = booking.bookingseat?.map((bs: any) => bs.seat?.seat_number).join(', ') || 'N/A';
                          const method = pm?.payment_method || PaymentMethod.CASH;

                          return (
                            <div key={booking.id} className="ticket-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                               <div className="ticket-image" style={{ flexShrink: 0, position: 'relative' }}>
                                  <img src={movieImage} alt="Movie Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, var(--card-bg))' }}></div>
                               </div>
                               <div className="ticket-info" style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  
                                  <div className="ticket-header">
                                     <div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#fff', fontWeight: 'bold' }}>{movieTitle}</h3>
                                        <p style={{ margin: 0, color: '#888', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            Thời gian đặt vé: {bookingDate}
                                        </p>
                                     </div>
                                     <div className="ticket-header-right">
                                        <span style={{ padding: '6px 12px', background: statusBg, color: statusColor, borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>{statusStr}</span>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#888' }}>Mã đơn: <strong style={{color: '#fff', fontSize: '16px'}}>#{booking.id}</strong></p>
                                     </div>
                                  </div>
                                  
                                  <div className="ticket-info-grid" style={{ display: 'grid', gap: '20px', marginTop: '25px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                     <div>
                                        <p style={{margin:'0 0 5px 0', color:'#888', fontSize:'13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Suất chiếu</p>
                                        <strong style={{color:'#fff', fontSize: '15px'}}>{showDate}</strong>
                                     </div>
                                     <div>
                                        <p style={{margin:'0 0 5px 0', color:'#888', fontSize:'13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Rạp / Phòng</p>
                                        <strong style={{color:'#fff', fontSize: '15px'}}>{theaterName} - {screenName}</strong>
                                     </div>
                                     <div>
                                        <p style={{margin:'0 0 5px 0', color:'#888', fontSize:'13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Số ghế</p>
                                        <strong style={{color:'var(--primary-color)', fontSize: '16px'}}>{seats}</strong>
                                     </div>
                                     <div>
                                        <p style={{margin:'0 0 5px 0', color:'#888', fontSize:'13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Tổng tiền</p>
                                        <strong style={{color:'#34d399', fontSize: '16px'}}>{booking.total_price_movie?.toLocaleString()} ₫ <span style={{fontSize: '12px', fontWeight: 'normal', color: '#888'}}>({method})</span></strong>
                                     </div>
                                  </div>
                                  
                                  <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px', flexWrap: 'wrap' }}>
                                     {showPayButton && (
                                       <button 
                                         onClick={() => router.push(`/payment/${booking.id}`)}
                                         className="btn btn-primary" 
                                         style={{ 
                                           fontSize: '13px', 
                                           padding: '10px 20px', 
                                           backgroundColor: 'var(--primary-color)', 
                                           color: '#fff', 
                                           borderRadius: '8px', 
                                           cursor: 'pointer', 
                                           display: 'flex', 
                                           alignItems: 'center', 
                                           gap: '8px',
                                           border: 'none',
                                           fontWeight: 'bold',
                                           boxShadow: '0 0 10px rgba(255, 77, 79, 0.4)'
                                         }}
                                       >
                                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                           </svg>
                                           Thanh toán ngay
                                       </button>
                                     )}
                                     <button className="btn" style={{ fontSize: '13px', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '8px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }} disabled title="Tính năng sẽ sớm ra mắt">
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                                           <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                           <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h1.5v-1.5H18v1.5h1.5v-1.5H21v-1.5h-1.5v-1.5h-1.5v1.5h-1.5v1.5h-1.5v-1.5H15v-1.5h-1.5v1.5h-1.5v1.5h1.5v1.5Z" />
                                         </svg>
                                         QR Đối chiếu
                                     </button>
                                     <button className="btn" style={{ fontSize: '13px', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '8px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }} disabled title="Tính năng sẽ sớm ra mắt">
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                                           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                         </svg>
                                         Xuất Hóa Đơn
                                     </button>
                                  </div>
                               </div>
                            </div>
                          );
                        })
                    )}
                </div>
            </div>
        </div>
    </main>
  );
}
