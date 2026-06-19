import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).voucher.findMany({ orderBy: { id: 'desc' } });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).voucher.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await (this.prisma as any).voucher.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await (this.prisma as any).voucher.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).voucher.delete({ where: { id } });
    } catch(e) { return null; }
  }
}
