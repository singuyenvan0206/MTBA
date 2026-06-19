import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).ticketPrice.findMany({ orderBy: { id: 'desc' } });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).ticketPrice.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await (this.prisma as any).ticketPrice.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await (this.prisma as any).ticketPrice.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).ticketPrice.delete({ where: { id } });
    } catch(e) { return null; }
  }
}
