import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seat_type } from '@prisma/client';

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(screen_id?: number) {
    try {
      const whereClause = screen_id ? { screen_id: Number(screen_id) } : {};
      return await this.prisma.seat.findMany({ 
        where: whereClause,
        orderBy: [{ seat_number: 'asc' }],
        include: { screen: { include: { theater: true } } }
      });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.seat.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await this.prisma.seat.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.seat.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await this.prisma.seat.delete({ where: { id } });
    } catch(e) { return null; }
  }

  async bulkRemove(ids: number[]) {
    try {
      await this.prisma.seat.deleteMany({
        where: { id: { in: ids } }
      });
      return { success: true };
    } catch (e) {
      return null;
    }
  }

  async bulkUpdateType(ids: number[], type: string) {
    try {
      await this.prisma.seat.updateMany({
        where: { id: { in: ids } },
        data: { type: type as any }
      });
      return { success: true };
    } catch (e) {
      return null;
    }
  }

  async generateSeats(screen_id: number) {
    try {
      const screen = await this.prisma.screen.findUnique({ where: { id: screen_id } });
      if (!screen) return { error: 'Screen not found' };
      const capacity = screen.seat_capacity || 50;

      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
      const seatsPerRow = 10;
      
      const existingSeats = await this.prisma.seat.findMany({ where: { screen_id } });
      const existingSeatNames = new Set(existingSeats.map(s => s.seat_number));

      let count = 0;
      let created = 0;
      const seatsToCreate: any[] = [];

      const totalRows = Math.ceil(capacity / seatsPerRow);

      for (let r = 0; r < rows.length; r++) {
        for (let c = 1; c <= seatsPerRow; c++) {
          if (count >= capacity) break;
          
          const seatNum = `${rows[r]}${c}`;
          if (!existingSeatNames.has(seatNum)) {
            let seatType: seat_type = seat_type.STANDARD;
            if (r >= totalRows - 1) seatType = seat_type.SWEETBOX;
            else if (r >= totalRows - 3) seatType = seat_type.VIP;

            seatsToCreate.push({
              screen_id,
              seat_number: seatNum,
              type: seatType,
              is_booked: false
            });
            created++;
          }
          count++;
        }
        if (count >= capacity) break;
      }

      if (seatsToCreate.length > 0) {
        await this.prisma.seat.createMany({ data: seatsToCreate });
      }

      return { success: true, created };
    } catch (e) {
      return null;
    }
  }
}
