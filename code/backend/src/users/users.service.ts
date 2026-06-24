import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await (this.prisma as any).user.findMany({ 
        orderBy: { id: 'desc' },
        include: { userrole: { include: { role: true } } }
      });
    } catch(e) { return []; }
  }

  async findOne(id: number) {
    try {
      return await (this.prisma as any).user.findUnique({ where: { id } });
    } catch(e) { return null; }
  }

  async create(data: any) {
    try {
      return await (this.prisma as any).user.create({ data });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      return await (this.prisma as any).user.update({ where: { id }, data });
    } catch(e) { return null; }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).user.delete({ where: { id } });
    } catch(e) { return null; }
  }

  async findByPhone(phone: string) {
    try {
      return await (this.prisma as any).user.findUnique({ where: { phone } });
    } catch(e) { return null; }
  }
}
