import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SeatsService } from './seats.service';

@Controller('seats')
export class SeatsController {
  constructor(private readonly service: SeatsService) {}

  @Get()
  findAll(@Query('screen_id') screen_id?: string) { 
    return this.service.findAll(screen_id ? parseInt(screen_id) : undefined); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(+id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(+id); }

  @Post('bulk-delete')
  bulkRemove(@Body() data: { ids: number[] }) {
    return this.service.bulkRemove(data.ids);
  }

  @Post('bulk-update-type')
  bulkUpdateType(@Body() data: { ids: number[], type: string }) {
    return this.service.bulkUpdateType(data.ids, data.type);
  }

  @Post('generate')
  generate(@Body() data: { screen_id: number }) {
    return this.service.generateSeats(data.screen_id);
  }
}
