import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoomtypeDto } from './dto/create-roomtype.dto';
import { UpdateRoomtypeDto } from './dto/update-roomtype.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomtypesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomtypeDto: CreateRoomtypeDto) {
    const existing = await this.prisma.roomtype.findUnique({
      where: { name: createRoomtypeDto.name },
    });
    if (existing) {
      throw new ConflictException('Tên loại phòng đã tồn tại');
    }
    return this.prisma.roomtype.create({
      data: createRoomtypeDto,
    });
  }

  findAll() {
    return this.prisma.roomtype.findMany();
  }

  async findOne(id: number) {
    const roomtype = await this.prisma.roomtype.findUnique({
      where: { id },
    });
    if (!roomtype) {
      throw new NotFoundException('Không tìm thấy loại phòng');
    }
    return roomtype;
  }

  async update(id: number, updateRoomtypeDto: UpdateRoomtypeDto) {
    await this.findOne(id);
    if (updateRoomtypeDto.name) {
      const existing = await this.prisma.roomtype.findFirst({
        where: { name: updateRoomtypeDto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Tên loại phòng đã tồn tại');
      }
    }
    return this.prisma.roomtype.update({
      where: { id },
      data: updateRoomtypeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.roomtype.delete({
      where: { id },
    });
  }
}
