import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgeLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.agelimit.findMany({ orderBy: { id: 'asc' } });
    } catch(e) { throw e; }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.agelimit.findUnique({ where: { id } });
    } catch(e) { throw e; }
  }

  async create(data: any) {
    try {
      return await this.prisma.agelimit.create({ data });
    } catch(e) { throw e; }
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.agelimit.update({ where: { id }, data });
    } catch(e) { throw e; }
  }

  async remove(id: number) {
    try {
      return await this.prisma.agelimit.delete({ where: { id } });
    } catch(e) { throw e; }
  }
}
