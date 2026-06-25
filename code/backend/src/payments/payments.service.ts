import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { payment_payment_status, payment_payment_method } from '@prisma/client';
import { ErrorMessage } from '../common/error-messages.enum';

@Injectable()
export class PaymentsService {
  private cachedTransactions: any[] = [];
  private lastFetchedTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).payment.findMany({ orderBy: { id: 'desc' } });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).payment.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    const { booking_id, amount, payment_status } = data;

    // 1. Kiểm tra đơn đặt vé tồn tại
    const booking = await this.prisma.booking.findUnique({
      where: { id: booking_id },
      include: { payment: true }
    });

    if (!booking) {
      throw new BadRequestException(ErrorMessage.PAYMENT_BOOKING_NOT_FOUND);
    }

    // 2. Chặn thanh toán trùng lặp
    const isAlreadyPaid = booking.payment.some(p => p.payment_status === payment_payment_status.COMPLETED);
    if (isAlreadyPaid) {
      throw new BadRequestException(ErrorMessage.PAYMENT_ALREADY_PAID);
    }

    // 3. Kiểm tra thời hạn thanh toán (tối đa 5 phút + 30 giây trễ mạng)
    const createdTime = new Date(booking.created_at).getTime();
    const elapsedMs = Date.now() - createdTime;
    const isExpired = elapsedMs > (5 * 60 + 30) * 1000; // 5m30s
    if (isExpired && payment_status === payment_payment_status.COMPLETED) {
      throw new BadRequestException(ErrorMessage.PAYMENT_EXPIRED);
    }

    // 4. So khớp số tiền thanh toán
    if (Math.abs(amount - booking.total_price_movie) > 0.01) {
      throw new BadRequestException(`Số tiền thanh toán (${amount}đ) không khớp với giá trị đơn hàng (${booking.total_price_movie}đ)!`);
    }

    // Tiến hành tạo bản ghi thanh toán
    return this.prisma.payment.create({ data });
  }

  async checkPaymentStatus(bookingId: number) {
    // 1. Kiểm tra trong cơ sở dữ liệu của chúng ta trước
    const payments = await this.prisma.payment.findMany({
      where: {
        booking_id: bookingId,
        payment_status: payment_payment_status.COMPLETED
      }
    });

    if (payments.length > 0) {
      return { isPaid: true };
    }

    // 2. Phương án dự phòng (Active Polling): Gọi trực tiếp API SePay để đối soát giao dịch mới nhất.
    // Điều này giúp hệ thống hoạt động tốt trên môi trường localhost mà không bắt buộc có ngrok.
    let apiToken = process.env.SEPAY_API_TOKEN;
    if (!apiToken || apiToken === 'your-sepay-api-access-token') {
      apiToken = process.env.SEPAY_API_KEY;
    }

    if (!apiToken || apiToken === 'your-sepay-webhook-api-key') {
      return { isPaid: false };
    }

    const now = Date.now();
    const cacheDuration = 10 * 1000; // 10s cache
    let transactions = this.cachedTransactions;

    if (now - this.lastFetchedTime > cacheDuration) {
      try {
        console.log(`[SePay Auto-Polling] Đang gọi SePay API thực tế (Hết hạn cache)...`);
        const response = await fetch('https://userapi.sepay.vn/v2/transactions?per_page=20', {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const resData: any = await response.json();
          transactions = resData.data || resData.transactions || [];
          this.cachedTransactions = transactions;
          this.lastFetchedTime = now;
          console.log(`[SePay Auto-Polling] Đã tải về và lưu cache: ${transactions.length} giao dịch mới.`);
        } else {
          const errText = await response.text();
          console.error(`[SePay Auto-Polling] API SePay báo lỗi! HTTP Status: ${response.status}. Chi tiết:`, errText);
        }
      } catch (err) {
        console.error('[SePay Auto-Polling] Lỗi kết nối khi gọi SePay API đối soát:', err);
      }
    } else {
      console.log(`[SePay Auto-Polling] Sử dụng danh sách từ Cache (Thời gian cache còn lại: ${Math.round((cacheDuration - (now - this.lastFetchedTime)) / 1000)}s)`);
    }

    // Tiến hành lọc giao dịch từ danh sách (ở cache hoặc vừa mới fetch)
    for (const tx of transactions) {
      const content = tx.transaction_content || tx.content || '';
      // Nhận diện mã đặt vé qua Regex
      const match = content.match(/MTBA\s*(\d+)/i);
      if (match && parseInt(match[1], 10) === bookingId) {
        console.log(`   => Khớp mã đơn hàng #${bookingId}!`);
        
        // Khớp mã đặt vé! Truy vấn thông tin đơn hàng để kiểm tra chéo
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId }
        });

        if (booking) {
          const amount = Number(tx.amount_in || tx.transferAmount || tx.amount || 0);
          console.log(`   => Kiểm tra số tiền: Nhận được=${amount}đ | Cần thanh toán=${booking.total_price_movie}đ`);

          // Kiểm tra số tiền khớp với giá trị đơn hàng
          if (Math.abs(amount - booking.total_price_movie) <= 0.01) {
            // Kiểm tra trùng lặp ghế nếu đơn hàng đã quá hạn
            const createdTime = new Date(booking.created_at).getTime();
            const elapsedMs = Date.now() - createdTime;
            const isExpired = elapsedMs > (5 * 60 + 30) * 1000; // 5m30s

            if (isExpired) {
              console.warn(`   => Đơn hàng #${bookingId} đã quá hạn thanh toán. Tiến hành kiểm tra trùng ghế...`);

              const bookingSeats = await this.prisma.bookingseat.findMany({
                where: { booking_id: bookingId },
                select: { seat_id: true }
              });
              const seatIds = bookingSeats.map(bs => bs.seat_id);

              const conflictBooking = await this.prisma.booking.findFirst({
                where: {
                  showtime_id: booking.showtime_id,
                  id: { not: bookingId },
                  payment: {
                    some: {
                      payment_status: payment_payment_status.COMPLETED
                    }
                  },
                  bookingseat: {
                    some: {
                      seat_id: { in: seatIds }
                    }
                  }
                }
              });

              if (conflictBooking) {
                console.error(`   => Lỗi trùng ghế: Ghế của đơn #${bookingId} đã bị đơn #${conflictBooking.id} mua trước.`);
                // Lưu vết thanh toán FAILED
                await this.prisma.payment.create({
                  data: {
                    booking_id: bookingId,
                    payment_method: payment_payment_method.VIETQR,
                    payment_status: payment_payment_status.FAILED,
                    amount: booking.total_price_movie,
                    transaction_id: String(tx.code || tx.reference_number || tx.id),
                    payment_time: new Date()
                  }
                });
                return { isPaid: false };
              }
            }

            console.log(`   => Khớp tiền thành công! Tiến hành tạo giao dịch COMPLETED trong DB.`);
            // Tạo bản ghi thanh toán thành công trong DB của mình
            await this.prisma.payment.create({
              data: {
                booking_id: bookingId,
                payment_method: payment_payment_method.VIETQR,
                payment_status: payment_payment_status.COMPLETED,
                amount: booking.total_price_movie,
                transaction_id: String(tx.code || tx.reference_number || tx.id),
                payment_time: new Date()
              }
            });
            return { isPaid: true };
          } else {
            console.warn(`   => Không khớp tiền! Đơn hàng cần ${booking.total_price_movie}đ nhưng nhận được ${amount}đ.`);
          }
        } else {
          console.error(`   => Lỗi: Khớp mã đơn #${bookingId} nhưng không tìm thấy đơn trong DB!`);
        }
      }
    }


    return { isPaid: false };
  }


  getPaymentConfig() {
    return {
      bankId: process.env.SEPAY_BANK_ID,
      accountNo: process.env.SEPAY_ACCOUNT_NO,
      accountName: process.env.SEPAY_ACCOUNT_NAME
    };
  }

  async update(id: number, data: any) {

    try {
      return await (this.prisma as any).payment.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).payment.delete({ where: { id } });
    } catch(e) { return null; }
  }
}

