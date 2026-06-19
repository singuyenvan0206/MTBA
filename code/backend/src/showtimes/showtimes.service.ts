import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShowtimesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(movieId?: number) {
    try {
      const whereClause = movieId ? { movie_id: movieId } : {};
      return await this.prisma.showtime.findMany({ 
        where: whereClause,
        orderBy: { id: 'desc' },
        include: { screen: { include: { theater: true } } }
      });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.showtime.findUnique({ 
        where: { id },
        include: { screen: { include: { seat: true } }, movie: true }
      });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await this.prisma.showtime.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.showtime.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await this.prisma.showtime.delete({ where: { id } });
    } catch(e) { return null; }
  }
}
