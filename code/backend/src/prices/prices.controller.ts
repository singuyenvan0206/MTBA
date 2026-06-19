import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PricesService } from './prices.service';

@Controller('prices')
export class PricesController {
  constructor(private readonly service: PricesService) {}

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
