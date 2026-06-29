import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get('config')
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  getConfig() {
    return this.service.getPaymentConfig();
  }

  @Get('status/:bookingId')
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  checkStatus(@Param('bookingId') bookingId: string) {
    return this.service.checkPaymentStatus(+bookingId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles(Role.ADMIN, Role.USER, Role.STAFF)
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(+id, data); }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
