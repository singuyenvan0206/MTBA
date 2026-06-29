import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { payment_payment_status, user_status, seat_type, movie_type } from '@prisma/client';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { CONFIG_DEFAULTS } from '../common/constants/config.constant';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(data: any) {
    const { userId, showtimeId, seats } = data;

    if (!seats || seats.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.BOOKING.SEAT_REQUIRED);
    }

    if (seats.length > CONFIG_DEFAULTS.BOOKING.MAX_SEATS_PER_ORDER) {
      throw new BadRequestException(ERROR_MESSAGES.BOOKING.SEAT_LIMIT_EXCEEDED);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Khóa dòng (Row Lock) suất chiếu để tuần tự hóa các lượt đặt vé đồng thời
      await tx.$executeRaw`SELECT * FROM showtime WHERE id = ${showtimeId} FOR UPDATE`;

      const showtime = await tx.showtime.findUnique({
        where: { id: showtimeId },
        include: { movie: true, screen: true }
      });
      if (!showtime) throw new BadRequestException(ERROR_MESSAGES.BOOKING.SHOWTIME_NOT_FOUND);

      // 1.1. Kiểm tra thời gian chiếu (phải trước giờ chiếu ít nhất X phút)
      const minBookingTime = new Date(Date.now() + CONFIG_DEFAULTS.BOOKING.CLOSE_MINUTES_BEFORE_SHOW * 60 * 1000);
      if (new Date(showtime.start_time) < minBookingTime) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.SHOWTIME_CLOSED);
      }

      // 1.2. Kiểm tra trạng thái tài khoản người dùng
      const userRecord = await tx.user.findUnique({
        where: { id: userId }
      });
      if (!userRecord || userRecord.status === user_status.BLOCKED) {
        throw new BadRequestException(ERROR_MESSAGES.USER.BLOCKED);
      }

      // 2. Kiểm tra xem người dùng đã có đơn chờ thanh toán chưa
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existingPendingBooking = await tx.booking.findFirst({
        where: {
          user_id: userId,
          showtime_id: showtimeId,
          payment: {
            none: {
              payment_status: payment_payment_status.COMPLETED
            }
          },
          created_at: {
            gte: fiveMinutesAgo
          }
        }
      });

      // 3. Tính toán lại tổng tiền ở backend dựa trên bảng giá (ticketprice) để bảo mật
      const prices = await tx.ticketprice.findMany();
      let calculatedTotalPrice = 0;
      const movieType = showtime.movie.type || movie_type.TYPE_2D;
      const showtimeDate = new Date(showtime.start_time);
      const isWeekend = showtimeDate.getDay() === 0 || showtimeDate.getDay() === 6;

      // 4. Lấy danh sách ghế đang bị khóa bởi người khác (loại trừ chính booking hiện tại của mình nếu đang cập nhật)
      const bookedSeatsObj = await this.getBookedSeatsTx(tx, showtimeId, userId);
      const bookedSeats = bookedSeatsObj.bookedSeats;

      // Kiểm tra trùng ghế trong bộ nhớ trước để tránh truy vấn thừa
      for (const seatNum of seats) {
        if (bookedSeats.includes(seatNum)) {
          throw new BadRequestException(ERROR_MESSAGES.BOOKING.SEAT_ALREADY_BOOKED(seatNum));
        }
      }

      // Lấy tất cả thông tin ghế cần thiết từ database trong 1 truy vấn duy nhất
      const seatRecords = await tx.seat.findMany({
        where: {
          screen_id: showtime.screen_id,
          seat_number: { in: seats }
        }
      });

      if (seatRecords.length !== seats.length) {
        const foundSeatNums = seatRecords.map(s => s.seat_number);
        const missingSeat = seats.find(s => !foundSeatNums.includes(s));
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.SEAT_NOT_FOUND(missingSeat));
      }

      // Tính tổng tiền cho tất cả ghế
      for (const seat of seatRecords) {
        const seatType = seat.type;
        const priceConfig = prices.find(p => 
          p.type_movie === movieType && 
          p.type_seat === seatType && 
          p.day_type === isWeekend
        );

        let price = 0;
        if (priceConfig) {
          price = priceConfig.price;
        } else {
          if (seatType === seat_type.STANDARD) price = 80000;
          else if (seatType === seat_type.VIP) price = 100000;
          else if (seatType === seat_type.SWEETBOX) price = 150000;
        }
        calculatedTotalPrice += price;
      }

      const finalPrice = calculatedTotalPrice;

      let booking: any;

      if (existingPendingBooking) {
        // Giải phóng các ghế cũ không còn được chọn
        const oldBookingSeats = await tx.bookingseat.findMany({
          where: { booking_id: existingPendingBooking.id },
          include: { seat: true }
        });

        const seatIdsToRelease = oldBookingSeats
          .filter(obs => !seats.includes(obs.seat.seat_number))
          .map(obs => obs.seat_id);

        if (seatIdsToRelease.length > 0) {
          await tx.seat.updateMany({
            where: { id: { in: seatIdsToRelease } },
            data: { is_booked: false }
          });
        }

        // Xóa mapping bookingseat cũ
        await tx.bookingseat.deleteMany({
          where: { booking_id: existingPendingBooking.id }
        });

        // Cập nhật booking (giữ nguyên created_at)
        booking = await tx.booking.update({
          where: { id: existingPendingBooking.id },
          data: {
            total_seat: seats.length,
            total_price_movie: finalPrice,
          }
        });
      } else {
        // Tạo booking mới
        booking = await tx.booking.create({
          data: {
            user_id: userId,
            showtime_id: showtimeId,
            total_seat: seats.length,
            total_price_movie: finalPrice,
          },
        });
      }

      // Cập nhật trạng thái is_booked của tất cả các ghế được chọn trong 1 truy vấn duy nhất
      await tx.seat.updateMany({
        where: { id: { in: seatRecords.map(s => s.id) } },
        data: { is_booked: true }
      });

      // Tạo mapping bookingseat mới bằng createMany (tối ưu hóa số lượng truy vấn)
      await tx.bookingseat.createMany({
        data: seatRecords.map(seat => ({
          booking_id: booking.id,
          seat_id: seat.id,
          quantity: 1,
        }))
      });

      return booking;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        showtime: { include: { movie: true, screen: { include: { theater: true } } } },
        bookingseat: { include: { seat: true } },
        payment: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        showtime: { include: { movie: true, screen: { include: { theater: true } } } },
        bookingseat: { include: { seat: true } },
        payment: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getBookedSeats(showtimeId: number, excludeUserId?: number) {
    return this.getBookedSeatsTx(this.prisma, showtimeId, excludeUserId);
  }

  async getBookedSeatsTx(tx: any, showtimeId: number, excludeUserId?: number) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Tự động dọn dẹp các đơn đặt vé quá hạn 5 phút chưa thanh toán
    try {
      const expiredBookings = await tx.booking.findMany({
        where: {
          showtime_id: showtimeId,
          created_at: {
            lt: fiveMinutesAgo
          },
          payment: {
            none: {
              payment_status: payment_payment_status.COMPLETED
            }
          }
        },
        include: {
          bookingseat: true
        }
      });

      if (expiredBookings.length > 0) {
        const expiredSeatIds = expiredBookings.flatMap((b: any) => b.bookingseat.map((bs: any) => bs.seat_id));

        // Tìm các ghế vẫn đang được giữ bởi các đơn đặt vé hợp lệ khác (đã thanh toán hoặc còn hạn 5 phút)
        const activeBookings = await tx.booking.findMany({
          where: {
            showtime_id: showtimeId,
            id: { notIn: expiredBookings.map((b: any) => b.id) },
            OR: [
              {
                payment: {
                  some: {
                    payment_status: payment_payment_status.COMPLETED
                  }
                }
              },
              {
                created_at: {
                  gte: fiveMinutesAgo
                }
              }
            ]
          },
          include: {
            bookingseat: true
          }
        });
        const activeSeatIds = new Set(activeBookings.flatMap((b: any) => b.bookingseat.map((bs: any) => bs.seat_id)));

        // Chỉ giải phóng các ghế thực sự không còn bị ai khóa nữa
        const seatsToRelease = expiredSeatIds.filter((id: number) => !activeSeatIds.has(id));
        if (seatsToRelease.length > 0) {
          await tx.seat.updateMany({
            where: { id: { in: seatsToRelease } },
            data: { is_booked: false }
          });
        }

        // Xóa các bản ghi booking quá hạn (bookingseat sẽ tự động cascade delete)
        await tx.booking.deleteMany({
          where: { id: { in: expiredBookings.map((b: any) => b.id) } }
        });

        console.log(`[Self-Cleaning] Đã giải phóng ${seatsToRelease.length} ghế và xóa ${expiredBookings.length} đơn đặt vé quá hạn.`);
      }
    } catch (err) {
      console.error('[Self-Cleaning] Lỗi khi dọn dẹp các đơn đặt vé quá hạn:', err);
    }

    const bookings = await tx.booking.findMany({
      where: {
        showtime_id: showtimeId,
        OR: [
          {
            payment: {
              some: {
                payment_status: payment_payment_status.COMPLETED
              }
            }
          },
          {
            created_at: {
              gte: fiveMinutesAgo
            }
          }
        ]
      },
      include: {
        bookingseat: {
          include: {
            seat: true
          }
        },
        payment: true
      }
    });

    const bookedSeatNumbers: string[] = [];
    let myPendingBooking: any = null;

    for (const b of bookings) {
      const isMyPending = excludeUserId && b.user_id === excludeUserId && !b.payment.some((p: any) => p.payment_status === payment_payment_status.COMPLETED);
      
      if (isMyPending) {
        myPendingBooking = {
          id: b.id,
          created_at: b.created_at,
          seats: b.bookingseat.map((bs: any) => bs.seat.seat_number)
        };
      } else {
        for (const bs of b.bookingseat) {
          bookedSeatNumbers.push(bs.seat.seat_number);
        }
      }
    }

    return {
      bookedSeats: bookedSeatNumbers,
      myPendingBooking
    } as any;
  }

  async getBooking(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: { include: { movie: true, screen: { include: { theater: true } } } },
        bookingseat: { include: { seat: true } },
      },
    });
  }

  async removeBooking(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { payment: true }
      });

      if (!booking) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.NOT_FOUND);
      }

      // Chặn Admin xóa đơn hàng đã thanh toán thành công trực tiếp (tránh mất dữ liệu kế toán)
      const isAlreadyPaid = booking.payment.some((p: any) => p.payment_status === payment_payment_status.COMPLETED);
      if (isAlreadyPaid) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.PAID_CANNOT_DELETE);
      }

      const bookingSeats = await tx.bookingseat.findMany({
        where: { booking_id: id }
      });

      const seatIds = bookingSeats.map(bs => bs.seat_id);
      if (seatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { is_booked: false }
        });
      }

      return tx.booking.delete({
        where: { id }
      });
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  }


  async cancelBooking(id: number, userId: number, role: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { payment: true }
      });

      if (!booking) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.NOT_FOUND);
      }

      // Kiểm tra quyền sở hữu
      if (role !== Role.ADMIN && booking.user_id !== userId) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.NO_CANCEL_PERMISSION);
      }

      // Kiểm tra xem đã thanh toán chưa
      const isAlreadyPaid = booking.payment.some((p: any) => p.payment_status === payment_payment_status.COMPLETED);
      if (isAlreadyPaid) {
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.PAID_CANNOT_CANCEL);
      }

      // Giải phóng ghế
      const bookingSeats = await tx.bookingseat.findMany({
        where: { booking_id: id }
      });

      const seatIds = bookingSeats.map(bs => bs.seat_id);
      if (seatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { is_booked: false }
        });
      }

      // Xóa đơn đặt vé
      return tx.booking.delete({
        where: { id }
      });
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  }

  async updateUser(id: number, userId: number) {
    return (this.prisma as any).booking.update({
      where: { id },
      data: { user_id: userId }
    });
  }
}

