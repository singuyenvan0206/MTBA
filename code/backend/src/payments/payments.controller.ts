import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @Roles('admin')
  findAll() { return this.service.findAll(); }

  @Get('config')
  @Roles('admin', 'user', 'staff')
  getConfig() {
    return this.service.getPaymentConfig();
  }

  @Get('status/:bookingId')
  @Roles('admin', 'user', 'staff')
  checkStatus(@Param('bookingId') bookingId: string) {
    return this.service.checkPaymentStatus(+bookingId);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles('admin', 'user', 'staff')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(+id, data); }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
