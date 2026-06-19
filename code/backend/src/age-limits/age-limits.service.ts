import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgeLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).ageLimit.findMany({ orderBy: { id: 'asc' } });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).ageLimit.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await (this.prisma as any).ageLimit.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await (this.prisma as any).ageLimit.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).ageLimit.delete({ where: { id } });
    } catch(e) { return null; }
  }
}
