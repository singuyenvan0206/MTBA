import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles('admin')
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== +id) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin của người dùng khác!');
    }
    return this.service.findOne(+id);
  }

  @Post()
  @Roles('admin')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('admin', 'user')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== +id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa thông tin của người dùng khác!');
    }
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}

