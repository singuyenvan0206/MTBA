import { Controller, Post, Body, Get, Param, Query, Delete, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  create(@Body() body: any, @Req() req: any) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.STAFF && req.user.id !== +body.userId) {
      throw new ForbiddenException(ERROR_MESSAGES.BOOKING.CREATE_FOR_OTHER_USER);
    }
    return this.bookingsService.createBooking(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  getUserBookings(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException(ERROR_MESSAGES.BOOKING.VIEW_OTHER_USER_BOOKINGS);
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
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  async getBooking(@Param('id') id: string, @Req() req: any) {
    const booking = await this.bookingsService.getBooking(+id);
    if (!booking) {
      return null;
    }
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.STAFF && req.user.id !== booking.user_id) {
      throw new ForbiddenException(ERROR_MESSAGES.BOOKING.VIEW_OTHER_USER_BOOKING_DETAIL);
    }
    return booking;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.bookingsService.removeBooking(+id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  cancelBooking(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancelBooking(+id, req.user.id, req.user.role);
  }

  @Put(':id/user')
  updateUser(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.bookingsService.updateUser(+id, body.userId);
  }
}
