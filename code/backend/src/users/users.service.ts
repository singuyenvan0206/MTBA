import { Injectable, BadRequestException } from '@nestjs/common';
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
      const { role, ...createData } = data;
      if (createData.password) {
        const pepper = process.env.PASSWORD_PEPPER || '';
        createData.password = await bcrypt.hash(createData.password + pepper, 10);
      }
      const user = await (this.prisma as any).user.create({ data: createData });
      if (role) {
        const roleObj = await (this.prisma as any).role.findUnique({ where: { role_name: role }});
        if (roleObj) {
          await (this.prisma as any).userrole.create({ data: { user_id: user.id, role_id: roleObj.id } });
        }
      }
      return user;
    } catch(e: any) { 
      console.error(e); 
      if (e.code === 'P2002') {
        throw new BadRequestException('Email hoặc số điện thoại đã tồn tại trong hệ thống!');
      }
      throw new BadRequestException('Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin.');
    }
  }

  async update(id: number, data: any) {
    try {
      const { role, ...updateData } = data;
      if (updateData.password) {
        const pepper = process.env.PASSWORD_PEPPER || '';
        updateData.password = await bcrypt.hash(updateData.password + pepper, 10);
      } else {
        delete updateData.password;
      }
      const user = await (this.prisma as any).user.update({ where: { id }, data: updateData });
      if (role) {
        const roleObj = await (this.prisma as any).role.findUnique({ where: { role_name: role }});
        if (roleObj) {
          await (this.prisma as any).userrole.deleteMany({ where: { user_id: id } });
          await (this.prisma as any).userrole.create({ data: { user_id: id, role_id: roleObj.id } });
        }
      }
      return user;
    } catch(e: any) { 
      console.error(e); 
      if (e.code === 'P2002') {
        throw new BadRequestException('Email hoặc số điện thoại đã tồn tại trong hệ thống!');
      }
      throw new BadRequestException('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    }
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

