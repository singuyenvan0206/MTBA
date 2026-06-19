import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(+id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
