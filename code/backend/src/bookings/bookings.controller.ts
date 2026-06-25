import { Controller, Post, Body, Get, Param, Query, Delete, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { ErrorMessage } from '../common/error-messages.enum';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user', 'staff')
  create(@Body() body: any, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== +body.userId) {
      throw new ForbiddenException('Bạn không thể tạo đặt vé cho người dùng khác!');
    }
    return this.bookingsService.createBooking(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  getUserBookings(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== +id) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách vé của người dùng khác!');
    }
    return this.bookingsService.getUserBookings(+id);
  }

  @Get('booked-seats')
  async getBookedSeats(
    @Query('showtimeId') showtimeId: string,
    @Query('userId') userId?: string,
  ) {
    return this.bookingsService.getBookedSeats(+showtimeId, userId ? +userId : undefined);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user', 'staff')
  async getBooking(@Param('id') id: string, @Req() req: any) {
    const booking = await this.bookingsService.getBooking(+id);
    if (!booking) {
      return null;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== booking.user_id) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin đặt vé này!');
    }
    return booking;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.bookingsService.removeBooking(+id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  cancelBooking(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancelBooking(+id, req.user.id, req.user.role);
  }

  @Put(':id/user')
  updateUser(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.bookingsService.updateUser(+id, body.userId);
  }
}
