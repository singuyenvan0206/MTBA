"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosSync } from '../../../../hooks/usePosSync';
import { QRCodeSVG } from 'qrcode.react';

import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { APP_ROUTES } from '@/constants/routes';
export default function PosPayment() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [prices, setPrices] = useState<any[]>([]);
  const [seatDiscounts, setSeatDiscounts] = useState<Record<string, string>>({});
  const [searchPhone, setSearchPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState({
    bankId: 'TPB',
    accountNo: '00000003137',
    accountName: 'NGUYEN VAN SI'
  });
  const { syncState, pushState } = usePosSync(false);

  useEffect(() => {
    if (syncState.seatDiscounts) setSeatDiscounts(syncState.seatDiscounts);
    if (syncState.paymentMethod) setPaymentMethod(syncState.paymentMethod);
    if (syncState.showQR !== undefined) {
        // We can just rely on syncState.showQR to show the modal in JSX
    }
  }, [syncState.seatDiscounts, syncState.paymentMethod, syncState.showQR]);

  useEffect(() => {
    if (!params?.id) return;
    
    const storedUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    let token = '';
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      token = u.accessToken || '';
    } else {
      alert(UI_MESSAGES.VUI_L_NG___NG_NH_P____S__D_NG);
      router.push(`${APP_ROUTES.POS2}/login`);
      return;
    }

    // fetch booking details
    fetch(`${API_ENDPOINTS.BOOKINGS_}${params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 401) {
            alert(UI_MESSAGES.PHI_N___NG_NH_P____H_T_H_N__VU);
            localStorage.removeItem(STORAGE_KEYS.STAFF_USER);
            router.push(`${APP_ROUTES.POS2}/login`);
            return;
        }
        setBooking(data);
        setLoading(false);

        // Fetch payment config
        fetch(API_ENDPOINTS.PAYMENTS_CONFIG, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(configData => {
            if (configData && configData.bankId) {
              setPaymentConfig(configData);
            }
          })
          .catch(err => console.error('Lỗi khi tải cấu hình thanh toán:', err));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    fetch(API_ENDPOINTS.PRICES)
      .then(res => res.json())
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [params.id]);

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const methodMap: any = {
        'CASH': PAYMENT_METHODS.CASH,
        'CARD': PAYMENT_METHODS.CARD, 
        'EWALLET': PAYMENT_METHODS.EWALLET
      };
      
      // finalTotal is available in scope
      const amountToPay = calculateSeatPrices().finalTotal;
      
      if (customer) {
        await fetch(`${API_ENDPOINTS.BOOKINGS_}${booking.id}/user`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken || ''}`
          },
          body: JSON.stringify({ userId: customer.id })
        });
      }

      const res = await fetch(`${API_ENDPOINTS.PAYMENTS}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken || ''}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: methodMap[paymentMethod] || PAYMENT_METHODS.CASH,
          payment_status: 'COMPLETED',
          amount: amountToPay,
          payment_time: new Date().toISOString()
        })
      });

      if (res.ok) {
        alert(UI_MESSAGES.THANH_TO_N_TH_NH_C_NG__IN_V);
        pushState({ showQR: false, currentPath: '/pos2' }); // Close QR on customer screen
        router.push(APP_ROUTES.POS2);
      } else {
        alert(UI_MESSAGES.THANH_TO_N_TH_T_B_I);
      }
    } catch (err) {
      alert(UI_MESSAGES.L_I_K_T_N_I_SERVER_KHI_THANH_T);
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
      const movieType = movie?.type || 'TYPE_2D';
      
      const priceConfig = prices.find(p => 
        (p.type_movie === movieType || p.type_movie?.replace(/^TYPE_/, '') === movieType?.replace(/^TYPE_/, '')) && 
        p.type_seat === seatType && 
        p.day_type === dayType
      );
      return priceConfig ? priceConfig.price : (seatType === SEAT_TYPES.VIP ? 100000 : seatType === SEAT_TYPES.SWEETBOX ? 150000 : 80000);
  };

  const calculateSeatPrices = () => {
      if (!booking || !booking.bookingseat) return { finalTotal: 0, discountAmount: 0 };
      
      let finalTotal = 0;
      booking.bookingseat.forEach((bs: any) => {
          const seat = bs.seat;
          const basePrice = getSeatBasePrice(seat.type || SEAT_TYPES.STANDARD);
          const discount = seatDiscounts[seat.seat_number] || 'NONE';
          
          let finalPrice = basePrice;
          if (discount === DISCOUNT_CODES.U22) {
              finalPrice = 55000;
          } else if (discount === DISCOUNT_CODES.MINUS_20) {
              finalPrice = basePrice * 0.8;
          } else if (discount === DISCOUNT_CODES.MINUS_50) {
              finalPrice = basePrice * 0.5;
          } else if (discount === DISCOUNT_CODES.MINUS_100) {
              finalPrice = 0;
          }
          finalTotal += finalPrice;
      });
      
      const discountAmount = Math.max(0, booking.total_price_movie - finalTotal);
      return { finalTotal, discountAmount };
  };

  const { finalTotal, discountAmount } = calculateSeatPrices();

  const handleSeatDiscountChange = (seatNumber: string, value: string) => {
      const newDiscounts = { ...seatDiscounts, [seatNumber]: value };
      setSeatDiscounts(newDiscounts);
      pushState({ seatDiscounts: newDiscounts });
  };

  const handleSearchCustomer = async () => {
      if (!searchPhone) return;
      try {
          const res = await fetch(`${API_ENDPOINTS.USERS_SEARCH_PHONE}?q=${searchPhone}`, {
            headers: { 'Authorization': `Bearer ${user?.accessToken || ''}` }
          });
          const data = await res.json();
          if (data && data.id) {
              setCustomer(data);
          } else {
              setCustomer(null);
              alert(UI_MESSAGES.KH_NG_T_M_TH_Y_KH_CH_H_NG_V_I);
          }
      } catch (err) {
          setCustomer(null);
          alert(UI_MESSAGES.KH_NG_T_M_TH_Y_KH_CH_H_NG_HO_C);
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

                <div className="payment-card mt-40" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', marginTop: '30px', pointerEvents: 'none' }}>
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
                                const basePrice = getSeatBasePrice(seat.type || SEAT_TYPES.STANDARD);
                                const discount = seatDiscounts[seat.seat_number] || 'NONE';
                                
                                let finalPrice = basePrice;
                                if (discount === DISCOUNT_CODES.U22) finalPrice = 55000;
                                else if (discount === DISCOUNT_CODES.MINUS_20) finalPrice = basePrice * 0.8;
                                else if (discount === DISCOUNT_CODES.MINUS_50) finalPrice = basePrice * 0.5;
                                else if (discount === DISCOUNT_CODES.MINUS_100) finalPrice = 0;

                                return (
                                    <tr key={seat.id}>
                                        <td style={{ padding: '15px 0', borderBottom: '1px solid #222' }}>
                                            <div>Ghế {seat.seat_number} ({seat.type || SEAT_TYPES.STANDARD})</div>
                                            <div style={{ color: '#888', fontSize: '13px' }}>Giá gốc: {basePrice.toLocaleString()}đ</div>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '15px 0', borderBottom: '1px solid #222' }}>
                                            <select 
                                                value={discount} 
                                                onChange={(e) => {}}
                                                disabled
                                                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #444', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                                            >
                                                <option value="NONE">Người lớn (Không ưu đãi)</option>
                                                <option value={DISCOUNT_CODES.U22}>Học sinh, Sinh viên (55k)</option>
                                                <option value={DISCOUNT_CODES.MINUS_20}>Trẻ em, Người cao tuổi (-20%)</option>
                                                <option value={DISCOUNT_CODES.MINUS_50}>Khuyết tật nặng (-50%)</option>
                                                <option value={DISCOUNT_CODES.MINUS_100}>Trẻ em dưới 0.7m (-100%)</option>
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
            <div className="right-column" style={{ pointerEvents: 'none' }}>
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
                            <div 
                                className={`payment-method-item ${paymentMethod === PAYMENT_METHODS.CASH ? 'active' : ''}`}
                                onClick={() => { setPaymentMethod(PAYMENT_METHODS.CASH); pushState({ paymentMethod: PAYMENT_METHODS.CASH, showQR: false }); }}
                                style={{ padding: '15px', border: '1px solid #444', borderRadius: '5px', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: paymentMethod === PAYMENT_METHODS.CASH ? 'rgba(255,77,79,0.1)' : 'transparent', borderColor: paymentMethod === PAYMENT_METHODS.CASH ? '#ff4d4f' : '#444' }}
                            >
                                <span style={{ backgroundColor: '#28a745', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Cash</span>
                                <strong>Tiền mặt</strong>
                            </div>

                            <div 
                                className={`payment-method-item ${paymentMethod === PAYMENT_METHODS.CARD ? 'active' : ''}`}
                                onClick={() => { setPaymentMethod(PAYMENT_METHODS.CARD); pushState({ paymentMethod: PAYMENT_METHODS.CARD, showQR: false }); }}
                                style={{ padding: '15px', border: '1px solid #444', borderRadius: '5px', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: paymentMethod === PAYMENT_METHODS.CARD ? 'rgba(255,77,79,0.1)' : 'transparent', borderColor: paymentMethod === PAYMENT_METHODS.CARD ? '#ff4d4f' : '#444' }}
                            >
                                <span style={{ backgroundColor: '#ffc107', color: '#000', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Card</span>
                                <strong>Quẹt thẻ POS / Chuyển khoản</strong>
                            </div>

                            <div 
                                className={`payment-method-item ${paymentMethod === PAYMENT_METHODS.EWALLET ? 'active' : ''}`}
                                onClick={() => { setPaymentMethod(PAYMENT_METHODS.EWALLET); pushState({ paymentMethod: PAYMENT_METHODS.EWALLET, showQR: false }); }}
                                style={{ padding: '15px', border: '1px solid #444', borderRadius: '5px', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: paymentMethod === PAYMENT_METHODS.EWALLET ? 'rgba(255,77,79,0.1)' : 'transparent', borderColor: paymentMethod === PAYMENT_METHODS.EWALLET ? '#ff4d4f' : '#444' }}
                            >
                                <span style={{ backgroundColor: '#17a2b8', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Wallet</span>
                                <strong>Ví thanh toán (MoMo / ZaloPay)</strong>
                            </div>
                        </div>
                        
                        {(paymentMethod === PAYMENT_METHODS.EWALLET || paymentMethod === PAYMENT_METHODS.CARD) && (
                            <div style={{ marginTop: '15px' }}>
                                <button className="btn w-100" style={{ visibility: 'hidden', backgroundColor: '#28a745', color: 'white', padding: '15px', fontWeight: 'bold' }}>
                                    ĐẨY MÃ QR SANG MÀN HÌNH KHÁCH
                                </button>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '20px' }}>
                            <button className="btn w-100" style={{ visibility: 'hidden', backgroundColor: '#ff4d4f', color: 'white', padding: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                                TIẾN HÀNH THANH TOÁN
                            </button>
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

        {syncState.showQR && !syncState.isPrinting && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', color: 'black' }}>
                    <h2 style={{ marginBottom: '20px', color: '#333' }}>Quét mã để thanh toán</h2>
                    {(syncState.paymentMethod === PAYMENT_METHODS.CARD || syncState.paymentMethod === PAYMENT_METHODS.EWALLET || syncState.paymentMethod === PAYMENT_METHODS.TRANSFER) ? (
                        <img 
                            src={`https://img.vietqr.io/image/${paymentConfig.bankId}-${paymentConfig.accountNo}-compact.png?amount=${syncState.paymentAmount || 0}&addInfo=MTBA${booking?.id}&accountName=${encodeURIComponent(paymentConfig.accountName)}`} 
                            alt="VietQR Code" 
                            width={256} 
                            height={256} 
                            style={{ display: 'inline-block' }}
                        />
                    ) : (
                        <QRCodeSVG 
                            value={(booking?.id?.toString() || '0')} 
                            size={256} 
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={false}
                        />
                    )}
                    <p style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>
                        Tổng tiền: {(syncState.paymentAmount || 0).toLocaleString('vi-VN')}đ
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Vui lòng kiểm tra lại số tiền trước khi chuyển khoản</p>
                </div>
            </div>
        )}

        {syncState.isPrinting && (
            <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', overflowY: 'auto' }}>
                <div id="printable-ticket" style={{ width: '80mm', backgroundColor: 'white', color: 'black', padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '16px', margin: 0 }}>RẠP CHIẾU PHIM</h2>
                        <p style={{ margin: '5px 0' }}>Hóa đơn thanh toán / Vé xem phim</p>
                        <p style={{ margin: '5px 0' }}>--------------------------------</p>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '3px 0' }}><strong>Phim:</strong> {movie?.title}</p>
                        <p style={{ margin: '3px 0' }}><strong>Suất chiếu:</strong> {showtime?.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : ''}</p>
                        <p style={{ margin: '3px 0' }}><strong>Phòng chiếu:</strong> {screen?.name}</p>
                        <p style={{ margin: '3px 0' }}><strong>Ghế:</strong> {bookedSeats.join(', ')}</p>
                        <p style={{ margin: '3px 0' }}><strong>Ngày in:</strong> {new Date().toLocaleString('vi-VN')}</p>
                    </div>

                    <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '10px 0', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Thành tiền:</span>
                            <span>{booking?.total_price_movie?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Ưu đãi:</span>
                            <span>-{calculateSeatPrices().discountAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
                            <span>Tổng cộng:</span>
                            <span>{calculateSeatPrices().finalTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <QRCodeSVG 
                            value={(booking?.id?.toString() || '0')} 
                            size={100} level="L" includeMargin={false} 
                        />
                        <p style={{ margin: '5px 0', fontSize: '10px' }}>Mã vé: {booking?.id}</p>
                        <p style={{ margin: '15px 0 5px 0', fontSize: '10px' }}>Cảm ơn quý khách!</p>
                    </div>
                </div>
            </div>
        )}
    </main>
  );
}
