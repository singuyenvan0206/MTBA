import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.ticketprice.findMany({ 
        orderBy: { id: 'desc' },
        include: { roomtype: true }
      });
    } catch(e) { console.error(e); return []; }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.ticketprice.findUnique({ where: { id } });
    } catch(e) { console.error(e); return null; }
  }

  async create(data: any) {
    try {
      return await this.prisma.ticketprice.create({ data });
    } catch(e) { console.error(e); return null; }
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.ticketprice.update({ where: { id }, data });
    } catch(e) { console.error(e); return null; }
  }

  async remove(id: number) {
    try {
      return await this.prisma.ticketprice.delete({ where: { id } });
    } catch(e) { console.error(e); return null; }
  }
}
