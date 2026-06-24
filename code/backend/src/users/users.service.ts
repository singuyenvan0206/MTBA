import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

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
      const createData = { ...data };
      if (createData.password) {
        const pepper = process.env.PASSWORD_PEPPER || '';
        createData.password = await bcrypt.hash(createData.password + pepper, 10);
      }
      return await (this.prisma as any).user.create({ data: createData });
    } catch(e) { return null; }
  }

  async update(id: number, data: any) {
    try {
      const updateData = { ...data };
      if (updateData.password) {
        const pepper = process.env.PASSWORD_PEPPER || '';
        updateData.password = await bcrypt.hash(updateData.password + pepper, 10);
      }
      return await (this.prisma as any).user.update({ where: { id }, data: updateData });
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

