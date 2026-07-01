import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

@Injectable()
export class ShowtimesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(movieId?: number) {
    try {
      const whereClause = movieId ? { movie_id: movieId } : {};
      return await this.prisma.showtime.findMany({ 
        where: whereClause,
        orderBy: { id: 'desc' },
        include: { screen: { include: { theater: true, roomtype: true } }, movie: true }
      });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.showtime.findUnique({ 
        where: { id },
        include: { screen: { include: { seat: true, theater: true, roomtype: true } }, movie: true }
      });
    } catch(e) { return null; }
  }

  async checkOverlap(screenId: number, startTime: string | Date, endTime: string | Date, excludeId?: number) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return await this.prisma.showtime.findFirst({
      where: {
        screen_id: screenId,
        start_time: {
          lt: end,
        },
        end_time: {
          gt: start,
        },
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
  }

  async create(data: any) {
    const screenId = parseInt(data.screen_id);
    if (!screenId || !data.start_time || !data.end_time) {
      throw new BadRequestException('Thông tin lịch chiếu không hợp lệ!');
    }

    const overlap = await this.checkOverlap(screenId, data.start_time, data.end_time);
    if (overlap) {
      throw new BadRequestException(ERROR_MESSAGES.SHOWTIME.OVERLAP);
    }

    try {
      return await this.prisma.showtime.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    if (data.screen_id && data.start_time && data.end_time) {
      const screenId = parseInt(data.screen_id);
      const overlap = await this.checkOverlap(screenId, data.start_time, data.end_time, id);
      if (overlap) {
        throw new BadRequestException(ERROR_MESSAGES.SHOWTIME.OVERLAP);
      }
    }

    try {
      return await this.prisma.showtime.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await this.prisma.showtime.delete({ where: { id } });
    } catch(e) { return null; }
  }

  async bulkRemove(ids: number[]) {
    try {
      return await this.prisma.showtime.deleteMany({ where: { id: { in: ids } } });
    } catch(e) { return null; }
  }
}
