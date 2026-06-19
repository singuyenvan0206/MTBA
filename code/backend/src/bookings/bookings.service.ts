import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(data: any) {
    const { userId, showtimeId, seats, totalPrice } = data;

    if (!seats || seats.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 ghế');
    }

    // Tạo booking
    const booking = await this.prisma.booking.create({
      data: {
        user_id: userId,
        showtime_id: showtimeId,
        total_seat: seats.length,
        total_price_movie: totalPrice,
      },
    });

    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId }
    });

    if (!showtime) throw new BadRequestException('Showtime not found');

    // Tạo thông tin ghế (Seat) nếu chưa có, và map vào BookingSeat
    for (const seatNum of seats) {
      let seat = await this.prisma.seat.findFirst({
        where: { screen_id: showtime.screen_id, seat_number: seatNum },
      });

      if (!seat) {
        seat = await this.prisma.seat.create({
          data: {
            screen_id: showtime.screen_id,
            seat_number: seatNum,
            is_booked: true,
            type: 'STANDARD',
          },
        });
      } else {
        await this.prisma.seat.update({
          where: { id: seat.id },
          data: { is_booked: true },
        });
      }

      await this.prisma.bookingseat.create({
        data: {
          booking_id: booking.id,
          seat_id: seat.id,
          quantity: 1,
        },
      });
    }

    return booking;
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        showtime: { include: { movie: true, screen: true } },
        bookingseat: { include: { seat: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        showtime: { include: { movie: true, screen: true } },
        bookingseat: { include: { seat: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getBookedSeats(showtimeId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        showtime_id: showtimeId
      },
      include: {
        bookingseat: {
          include: {
            seat: true
          }
        }
      }
    });

    const bookedSeatNumbers: string[] = [];
    for (const b of bookings) {
      for (const bs of b.bookingseat) {
        bookedSeatNumbers.push(bs.seat.seat_number);
      }
    }
    return bookedSeatNumbers;
  }

  async getBooking(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: { include: { movie: true, screen: true } },
        bookingseat: { include: { seat: true } },
      },
    });
  }
}
