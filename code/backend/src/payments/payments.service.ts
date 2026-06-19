import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).payment.findMany({ orderBy: { id: 'desc' } });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).payment.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await (this.prisma as any).payment.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await (this.prisma as any).payment.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).payment.delete({ where: { id } });
    } catch(e) { return null; }
  }
}
