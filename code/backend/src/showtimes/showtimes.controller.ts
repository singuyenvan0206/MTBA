import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly service: ShowtimesService) {}

  @Get()
  findAll(@Query('movieId') movieId?: string) {
    return this.service.findAll(movieId ? +movieId : undefined);
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
}
