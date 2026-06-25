import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { ErrorMessage } from '../common/error-messages.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get('search/phone')
  findByPhone(@Query('q') phone: string) { return this.service.findByPhone(phone); }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException(ErrorMessage.USER_VIEW_OTHER);
    }
    return this.service.findOne(+id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== +id) {
      throw new ForbiddenException(ErrorMessage.USER_UPDATE_OTHER);
    }
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
