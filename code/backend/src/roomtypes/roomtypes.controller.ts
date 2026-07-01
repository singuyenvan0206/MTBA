import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { RoomtypesService } from './roomtypes.service';
import { CreateRoomtypeDto } from './dto/create-roomtype.dto';
import { UpdateRoomtypeDto } from './dto/update-roomtype.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('roomtypes')
export class RoomtypesController {
  constructor(private readonly roomtypesService: RoomtypesService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createRoomtypeDto: CreateRoomtypeDto) {
    return this.roomtypesService.create(createRoomtypeDto);
  }

  @Get()
  findAll() {
    return this.roomtypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomtypesService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoomtypeDto: UpdateRoomtypeDto) {
    return this.roomtypesService.update(+id, updateRoomtypeDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomtypesService.remove(+id);
  }
}
