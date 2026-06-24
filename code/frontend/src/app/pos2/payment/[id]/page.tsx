'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentMethod, PaymentStatus, SeatType, MovieType } from '@/types/enums';
import { AppMessage } from '@/types/messages';

export default function PosPayment() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [prices, setPrices] = useState<any[]>([]);
  const [seatDiscounts, setSeatDiscounts] = useState<Record<string, string>>({});
  const [searchPhone, setSearchPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (!params?.id) return;
    
    // fetch booking details
    fetch(`/api/bookings/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    fetch('/api/prices')
      .then(res => res.json())
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [params.id]);

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const methodMap: Record<PaymentMethod, PaymentMethod> = {
        [PaymentMethod.CASH]: PaymentMethod.CASH,
        [PaymentMethod.CARD]: PaymentMethod.CARD,
        [PaymentMethod.EWALLET]: PaymentMethod.EWALLET,
        [PaymentMethod.TRANSFER]: PaymentMethod.TRANSFER,
      };
      
      // finalTotal is available in scope
      const amountToPay = calculateSeatPrices().finalTotal;
      
      if (customer) {
        await fetch(`/api/bookings/${booking.id}/user`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: customer.id })
        });
      }

      const res = await fetch(`/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: methodMap[paymentMethod] || PaymentMethod.CASH,
          payment_status: PaymentStatus.COMPLETED,
          amount: amountToPay,
          payment_time: new Date().toISOString()
        })
      });

      if (res.ok) {
        alert(AppMessage.POS_PAYMENT_SUCCESS);
        router.push('/pos2');
      } else {
        alert(AppMessage.POS_PAYMENT_FAILED);
      }
    } catch (err) {
      alert(AppMessage.POS_PAYMENT_CONNECTION_ERROR);
    }
  };

  if (loading) return <div className="text-center py-20 ">Đang tải thông tin thanh toán...</div>;
  if (!booking) return <div className="text-center py-20 ">Không tìm thấy mã đặt vé.</div>;

  const showtime = booking.showtime;
  const movie = showtime?.movie;
  const screen = showtime?.screen;
  const bookedSeats = booking.bookingseat?.map((bs: any) => bs.seat.seat_number) || [];

  const getSeatBasePrice = (seatType: string) => {
      const isWeekend = (dateString: string) => {
          const day = new Date(dateString).getDay();
          return day === 0 || day === 6;
      };
      const dayType = showtime?.start_time ? isWeekend(showtime.start_time) : false;
      const movieType = (movie?.type as MovieType) || MovieType.TYPE_2D;
      
      const priceConfig = prices.find(p => p.type_movie === movieType && p.type_seat === seatType && p.day_type === dayType);
      return priceConfig ? priceConfig.price : (seatType === SeatType.VIP ? 100000 : seatType === SeatType.SWEETBOX ? 150000 : 80000);
  };

  const calculateSeatPrices = () => {
      if (!booking || !booking.bookingseat) return { finalTotal: 0, discountAmount: 0 };
      
      let finalTotal = 0;
      booking.bookingseat.forEach((bs: any) => {
          const seat = bs.seat;
          const basePrice = getSeatBasePrice(seat.type || SeatType.STANDARD);
          const discount = seatDiscounts[seat.seat_number] || 'NONE';
          
          let finalPrice = basePrice;
          if (discount === 'U22') {
              finalPrice = 55000;
          } else if (discount === 'MINUS_20') {
              finalPrice = basePrice * 0.8;
          } else if (discount === 'MINUS_50') {
              finalPrice = basePrice * 0.5;
          } else if (discount === 'MINUS_100') {
              finalPrice = 0;
          }
          finalTotal += finalPrice;
      });
      
      const discountAmount = Math.max(0, booking.total_price_movie - finalTotal);
      return { finalTotal, discountAmount };
  };

  const { finalTotal, discountAmount } = calculateSeatPrices();

  const handleSeatDiscountChange = (seatNumber: string, value: string) => {
      setSeatDiscounts(prev => ({ ...prev, [seatNumber]: value }));
  };

  const handleSearchCustomer = async () => {
      if (!searchPhone) return;
      try {
          const res = await fetch(`/api/users/search/phone?q=${searchPhone}`);
          const data = await res.json();
          if (data && data.id) {
              setCustomer(data);
          } else {
              setCustomer(null);
              alert(AppMessage.POS_CUSTOMER_NOT_FOUND);
          }
      } catch (err) {
          setCustomer(null);
          alert(AppMessage.POS_CUSTOMER_SEARCH_ERROR);
      }
  };

  return (
    <main className="main-content">
        <div className="container layout-grid payment-layout mt-40" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', margin: '40px auto' }}>
            
            {/* Cột trái: Thông tin phim và vé */}
            <div className="left-column">
                <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Thông tin phim</h3>
                    <div className="info-row">
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Phim</p>
                            <p className="value" id="movie-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>{movie?.title}</p>
                        </div>
                    </div>
                    <div className="info-grid mt-40" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ngày giờ chiếu</p>
                            <p className="value" id="showtime-date" style={{ fontWeight: 'bold' }}>
                              {showtime?.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : 'Đang tải...'}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ngày đặt vé</p>
                            <p className="value" id="booking-date" style={{ fontWeight: 'bold' }}>
                              {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Ghế</p>
                            <p className="value" id="selected-seats" style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                              {bookedSeats.join(', ')}
                            </p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Định dạng</p>
                            <p className="value" id="movie-format" style={{ fontWeight: 'bold' }}>{movie?.type || '2D'}</p>
                        </div>
                        <div className="info-col">
                            <p className="label" style={{ color: '#888', fontSize: '14px' }}>Phòng chiếu</p>
                            <p className="value" id="screen-name" style={{ fontWeight: 'bold' }}>{screen?.name}</p>
                        </div>
                    </div>
                </div>

                <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Thông tin thanh toán</h3>
                    <table className="payment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <th style={{ textAlign: 'left', padding: '10px 0', color: '#888' }}>Danh mục</th>
                                <th style={{ textAlign: 'center', padding: '10px 0', color: '#888' }}>Số lượng</th>
                                <th className="text-right" style={{ textAlign: 'right', padding: '10px 0', color: '#888' }}>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody id="ticket-list-body">
                            {booking.bookingseat?.map((bs: any) => {
                                const seat = bs.seat;
                                const basePrice = getSeatBasePrice(seat.type || SeatType.STANDARD);
                                const discount = seatDiscounts[seat.seat_number] || 'NONE';
                                
                                let finalPrice = basePrice;
                                if (discount === 'U22') finalPrice = 55000;
                                else if (discount === 'MINUS_20') finalPrice = basePrice * 0.8;
                                else if (discount === 'MINUS_50') finalPrice = basePrice * 0.5;
                                else if (discount === 'MINUS_100') finalPrice = 0;

                                return (
                                    <tr key={seat.id}>
                                        <td style={{ padding: '15px 0', borderBottom: '1px solid #222' }}>
                                            <div>Ghế {seat.seat_number} ({seat.type || SeatType.STANDARD})</div>
                                            <div style={{ color: '#888', fontSize: '13px' }}>Giá gốc: {basePrice.toLocaleString()}đ</div>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '15px 0', borderBottom: '1px solid #222' }}>
                                            <select 
                                                value={discount} 
                                                onChange={(e) => handleSeatDiscountChange(seat.seat_number, e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                                            >
                                                <option value="NONE">Người lớn (Không ưu đãi)</option>
                                                <option value="U22">Học sinh, Sinh viên (55k)</option>
                                                <option value="MINUS_20">Trẻ em, Người cao tuổi (-20%)</option>
                                                <option value="MINUS_50">Khuyết tật nặng (-50%)</option>
                                                <option value="MINUS_100">Trẻ em dưới 0.7m (-100%)</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '15px 0', borderBottom: '1px solid #222', fontWeight: 'bold' }}>
                                            {finalPrice.toLocaleString('vi-VN')}đ
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cột phải: Phương thức thanh toán */}
            <div className="right-column">
                    <div className="payment-card" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Tra cứu & Khuyến mãi</h3>
                        <div className="input-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Nhập SĐT khách hàng..." 
                                className="form-control" 
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} 
                            />
                            <button onClick={handleSearchCustomer} className="btn btn-outline" style={{ whiteSpace: 'nowrap', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Tìm khách</button>
                        </div>
                        {customer && (
                            <p id="pos-user-result" style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}>
                                Khách hàng: {customer.first_name} {customer.last_name} ({customer.phone})
                            </p>
                        )}

                        <div className="input-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <input type="text" id="pos-voucher" placeholder="Nhập mã Voucher..." className="form-control" style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} />
                            <button className="btn btn-outline" style={{ whiteSpace: 'nowrap', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Áp dụng</button>
                        </div>
                        <p id="pos-voucher-result" style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}></p>

                    </div>

                    <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Phương thức thanh toán</h3>
                        <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label className={`method-option ${paymentMethod === PaymentMethod.CASH ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PaymentMethod.CASH ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PaymentMethod.CASH} checked={paymentMethod === PaymentMethod.CASH} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/28a745/FFF?text=Cash" alt="Cash" />
                                <span>Tiền mặt</span>
                            </label>
                            <label className={`method-option ${paymentMethod === PaymentMethod.CARD ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PaymentMethod.CARD ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PaymentMethod.CARD} checked={paymentMethod === PaymentMethod.CARD} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/ffc107/000?text=Card" alt="Card" />
                                <span>Quẹt thẻ POS / Chuyển khoản</span>
                            </label>
                            <label className={`method-option ${paymentMethod === PaymentMethod.EWALLET ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PaymentMethod.EWALLET ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PaymentMethod.EWALLET} checked={paymentMethod === PaymentMethod.EWALLET} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/17a2b8/FFF?text=Wallet" alt="EWallet" />
                                <span>Ví thanh toán (MoMo / ZaloPay)</span>
                            </label>
                        </div>
                    </div>

                    <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Chi phí</h3>
                        <div className="cost-summary">
                            <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Thành tiền</span>
                                <span id="summary-total">{booking.total_price_movie?.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="cost-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Ưu đãi đối tượng</span>
                                <span style={{ color: '#28a745' }}>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="cost-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #444', fontWeight: 'bold', fontSize: '18px', color: '#ff4d4f' }}>
                                <span>Tổng cộng</span>
                                <span id="final-total">{finalTotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <div className="payment-actions mt-40" style={{ marginTop: '30px' }}>
                            <button className="btn btn-primary w-100" id="btn-pay" onClick={handlePayment} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Thanh toán ngay</button>
                            <Link href={`/pos2/movies/${movie?.id}`} className="back-link" style={{ display: 'block', textAlign: 'center', color: '#888', textDecoration: 'underline' }}>Quay lại</Link>
                        </div>
                        
                        <p className="age-warning mt-40" style={{ fontSize: '12px', marginBottom: 0, marginTop: '20px', color: '#f0a500' }}>Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.</p>
                    </div>
            </div>
        </div>
    </main>
  );
}
