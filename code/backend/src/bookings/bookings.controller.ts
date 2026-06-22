import { Controller, Post, Body, Get, Param, Query, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: any) {
    return this.bookingsService.createBooking(body);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('user/:id')
  getUserBookings(@Param('id') id: string) {
    return this.bookingsService.getUserBookings(+id);
  }

  @Get('booked-seats')
  async getBookedSeats(
    @Query('showtimeId') showtimeId: string,
  ) {
    return this.bookingsService.getBookedSeats(+showtimeId);
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.getBooking(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.removeBooking(+id);
  }
}
