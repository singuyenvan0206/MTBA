"use client";
import { DISCOUNT_CODES, AGE_LIMITS, MOVIE_STATUS, USER_STATUS } from '@/constants/enums';
import { STORAGE_KEYS } from '@/constants/storage';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosSync } from '@/hooks/usePosSync';
import { QRCodeSVG } from 'qrcode.react';
import { AppMessage } from '@/types/messages';
import { PaymentMethod, PaymentStatus, MovieType, SeatType } from '@/types/enums';
import { UI_MESSAGES } from '@/constants/messages';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { ROLES, PAYMENT_METHODS, SEAT_TYPES, MOVIE_TABS } from '@/constants/enums';
import { APP_ROUTES } from '@/constants/routes';
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
  const [user, setUser] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    bankId: 'TPB',
    accountNo: '00000003137',
    accountName: 'NGUYEN VAN SI'
  });
  const { pushState, syncState } = usePosSync(true);

  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'error', onConfirm?: () => void) => {
    setStatusModal({
      show: true,
      type,
      title: type === 'success' ? AppMessage.TITLE_SUCCESS : AppMessage.TITLE_NOTIFICATION,
      message,
      onConfirm
    });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setStatusModal({
      show: true,
      type: 'confirm',
      title: AppMessage.TITLE_CONFIRM,
      message,
      onConfirm
    });
  };

  // Khôi phục trạng thái chờ thanh toán nếu trang được reload
  // trong khi QR đang hiển thị — chỉ áp dụng sau khi booking đã load
  // để tránh khôi phục QR của booking cũ chưa kịp reset
  useEffect(() => {
    if (syncState.showQR && !isWaitingPayment && booking?.id) {
      setIsWaitingPayment(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncState.showQR, booking?.id]);

  const handlePushQR = () => {
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      showAlert(UI_MESSAGES.VUI_L_NG_CH_N_TH__HO_C_V___I_N);
      return;
    }
    if (paymentMethod === PAYMENT_METHODS.TRANSFER || paymentMethod === PAYMENT_METHODS.EWALLET) {
      setIsWaitingPayment(true);
    }
    pushState({ showQR: true, paymentAmount: calculateSeatPrices().finalTotal, paymentMethod: paymentMethod });
  };

  useEffect(() => {
    if (!params?.id) return;

    // Reset QR state khi vào trang payment mới để xóa sạch QR của booking cũ
    // (syncStore phía server chỉ merge, không tự clear)
    pushState({ showQR: false, isPrinting: false, paymentAmount: 0 });
    setIsWaitingPayment(false);
    
    const storedUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    let token = '';
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      token = u.accessToken || '';
    } else {
      showAlert(UI_MESSAGES.VUI_L_NG___NG_NH_P____S__D_NG, 'error', () => {
        router.push(`${APP_ROUTES.POS2}/login`);
      });
      return;
    }

    // fetch booking details
    fetch(`${API_ENDPOINTS.BOOKINGS_}${params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 401) {
            showAlert(UI_MESSAGES.PHI_N___NG_NH_P____H_T_H_N__VU, 'error', () => {
                localStorage.removeItem(STORAGE_KEYS.STAFF_USER);
                router.push(`${APP_ROUTES.POS2}/login`);
            });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, router]);

  // Polling for payment status from Seapay/backend
  useEffect(() => {
    if (!isWaitingPayment || !booking?.id) return;

    const storedUser = localStorage.getItem(STORAGE_KEYS.STAFF_USER);
    const token = storedUser ? JSON.parse(storedUser).accessToken : '';

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.PAYMENTS_STATUS_}${booking.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            setIsWaitingPayment(false);
            pushState({ showQR: false }); // Hide QR on customer screen
            showAlert(UI_MESSAGES.SEAPAY_SUCCESS_PRINT_TICKET, 'success');
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  // Lưu ý: pushState được loại ra khỏi deps để tránh interval bị
  // hủy và tạo lại mỗi khi pathname thay đổi (pushState phụ thuộc pathname).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitingPayment, booking?.id]);

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const methodMap: Record<PaymentMethod, PaymentMethod> = {
        [PaymentMethod.CASH]: PaymentMethod.CASH,
        [PaymentMethod.CARD]: PaymentMethod.CARD,
        [PaymentMethod.EWALLET]: PaymentMethod.EWALLET,
        [PaymentMethod.TRANSFER]: PaymentMethod.TRANSFER,
      };
      
      const amountToPay = calculateSeatPrices().finalTotal;
      const token = user?.accessToken || '';

      // Gán khách hàng vào booking (nếu có)
      if (customer) {
        await fetch(`${API_ENDPOINTS.BOOKINGS_}${booking.id}/user`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: customer.id })
        });
      }

      // Kiểm tra xem booking đã được SePay thanh toán tự động chưa
      // (tránh gọi POST /payments khi bản ghi COMPLETED đã tồn tại trong DB)
      const statusRes = await fetch(`${API_ENDPOINTS.PAYMENTS_STATUS_}${booking.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusData = statusRes.ok ? await statusRes.json() : null;
      const alreadyPaidBySepay = statusData?.isPaid === true;

      if (!alreadyPaidBySepay) {
        // Chưa có giao dịch COMPLETED → tạo mới bình thường
        const res = await fetch(`${API_ENDPOINTS.PAYMENTS}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            booking_id: booking.id,
            payment_method: methodMap[paymentMethod] || PaymentMethod.CASH,
            payment_status: PaymentStatus.COMPLETED,
            amount: amountToPay,
            payment_time: new Date().toISOString()
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // Nếu backend báo đã thanh toán rồi (race condition) → coi như thành công
          const isAlreadyPaid = errData?.message?.includes('đã được thanh toán');
          if (!isAlreadyPaid) {
            showAlert(AppMessage.POS_PAYMENT_FAILED);
            return;
          }
        }
      }

      // Tiến hành in vé (dù trả tiền thủ công hay SePay đã xử lý)
      setIsPrinting(true);
      pushState({ isPrinting: true, showQR: false, paymentMethod: paymentMethod, finalTotal: amountToPay });
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (err) {
      showAlert(AppMessage.POS_PAYMENT_CONNECTION_ERROR);
    }
  };

  const handleCancelBooking = () => {
    if (!booking) return;
    showConfirm(AppMessage.CANCEL_CONFIRM, async () => {
      setStatusModal(null);
      try {
        const token = user?.accessToken || '';
        const res = await fetch(`${API_ENDPOINTS.BOOKINGS_}${booking.id}/cancel`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          pushState({ showQR: false, showtimeId: null, selectedSeats: [] });
          const movieId = booking?.showtime?.movie?.id || booking?.showtime?.movie_id;
          router.push(`${APP_ROUTES.POS2}/movies/${movieId}`);
        } else {
          const errData = await res.json().catch(() => ({}));
          showAlert(errData.message || AppMessage.CANCEL_FAILED);
        }
      } catch (err) {
        showAlert(AppMessage.CANCEL_CONNECTION_ERROR);
      }
    });
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
      const showtimeRoomtypeId = screen?.roomtype_id;
      
      const priceConfig = prices.find(p => 
        p.roomtype_id === showtimeRoomtypeId && 
        p.type_seat === seatType && 
        p.day_type === dayType
      );
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
              showAlert(AppMessage.POS_CUSTOMER_NOT_FOUND);
          }
      } catch (err) {
          setCustomer(null);
          showAlert(AppMessage.POS_CUSTOMER_SEARCH_ERROR);
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
                                if (discount === DISCOUNT_CODES.U22) finalPrice = 55000;
                                else if (discount === DISCOUNT_CODES.MINUS_20) finalPrice = basePrice * 0.8;
                                else if (discount === DISCOUNT_CODES.MINUS_50) finalPrice = basePrice * 0.5;
                                else if (discount === DISCOUNT_CODES.MINUS_100) finalPrice = 0;

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
                            <label className={`method-option ${paymentMethod === PAYMENT_METHODS.CASH ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PAYMENT_METHODS.CASH ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PAYMENT_METHODS.CASH} checked={paymentMethod === PAYMENT_METHODS.CASH} onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethod); pushState({ paymentMethod: e.target.value }); }} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/28a745/FFF?text=Cash" alt="Cash" />
                                <span>Tiền mặt</span>
                            </label>
                            <label className={`method-option ${paymentMethod === PAYMENT_METHODS.CARD ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PAYMENT_METHODS.CARD ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PAYMENT_METHODS.CARD} checked={paymentMethod === PAYMENT_METHODS.CARD} onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethod); pushState({ paymentMethod: e.target.value }); }} style={{ display: 'none' }} />
                                <img src="https://placehold.co/40x20/ffc107/000?text=Card" alt="Card" />
                                <span>Quẹt thẻ POS / Chuyển khoản</span>
                            </label>
                            <label className={`method-option ${paymentMethod === PAYMENT_METHODS.EWALLET ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid', borderColor: paymentMethod === PAYMENT_METHODS.EWALLET ? '#ff4d4f' : '#333', borderRadius: '5px', cursor: 'pointer' }}>
                                <input type="radio" name="payment_method" value={PAYMENT_METHODS.EWALLET} checked={paymentMethod === PAYMENT_METHODS.EWALLET} onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethod); pushState({ paymentMethod: e.target.value }); }} style={{ display: 'none' }} />
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
                            {(paymentMethod === PAYMENT_METHODS.EWALLET || paymentMethod === PAYMENT_METHODS.CARD) && (
                                <button 
                                    className="btn btn-success w-100" 
                                    onClick={handlePushQR} 
                                    style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
                                >
                                    ĐẨY MÃ QR SANG MÀN HÌNH KHÁCH
                                </button>
                            )}
                            <button className="btn btn-primary w-100" id="btn-pay" onClick={handlePayment} style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Thanh toán ngay</button>
                            <button 
                                onClick={handleCancelBooking} 
                                className="back-link" 
                                style={{ display: 'block', width: '100%', textAlign: 'center', color: '#888', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}
                            >
                                Hủy đặt vé & Quay lại
                            </button>
                        </div>
                        
                        <p className="age-warning mt-40" style={{ fontSize: '12px', marginBottom: 0, marginTop: '20px', color: '#f0a500' }}>Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.</p>
                    </div>
            </div>
        </div>

        {isPrinting && (
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
                
                <div className="no-print" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.print()} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>In lại</button>
                    <button onClick={() => { setIsPrinting(false); pushState({ showQR: false, currentPath: '/pos2' }); router.push(APP_ROUTES.POS2); }} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Hoàn tất & Về trang chủ</button>
                </div>
            </div>
        )}

        {/* Status Modal (Success, Error, Confirm) */}
        {statusModal && statusModal.show && (
            <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)', padding: '40px 30px', borderRadius: '15px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {statusModal.type === 'success' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                    )}
                    {statusModal.type === 'error' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                    )}
                    {statusModal.type === 'confirm' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                    )}
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>{statusModal.title}</h3>
                    <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>{statusModal.message}</p>
                    
                    {statusModal.type === 'confirm' ? (
                        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                            <button onClick={() => setStatusModal(null)} className="btn btn-outline" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #444', borderRadius: '8px', background: 'transparent', color: '#aaa' }}>
                                Đóng
                            </button>
                            <button onClick={statusModal.onConfirm} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                                Xác nhận
                            </button>
                        </div>
                    ) : (
                        <button onClick={statusModal.onConfirm || (() => setStatusModal(null))} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        )}
    </main>
  );
}
