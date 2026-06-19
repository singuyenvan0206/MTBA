import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TheatersService } from './theaters.service';

@Controller('theaters')
export class TheatersController {
  constructor(private readonly service: TheatersService) {}

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
