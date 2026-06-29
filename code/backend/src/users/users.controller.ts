import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get('search/phone')
  findByPhone(@Query('q') phone: string) { return this.service.findByPhone(phone); }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.VIEW_OTHER);
    }
    return this.service.findOne(+id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    if (req.user.role !== Role.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.UPDATE_OTHER);
    }
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
