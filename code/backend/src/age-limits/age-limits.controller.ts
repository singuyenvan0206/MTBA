import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AgeLimitsService } from './age-limits.service';

@Controller('age-limits')
export class AgeLimitsController {
  constructor(private readonly service: AgeLimitsService) {}

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
