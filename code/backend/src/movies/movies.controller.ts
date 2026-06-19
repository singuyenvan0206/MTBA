import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Post()
  create(@Body() createMovieDto: any) {
    return this.moviesService.create(createMovieDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: any) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}
