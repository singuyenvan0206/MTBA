import { Module } from '@nestjs/common';
import { RoomtypesService } from './roomtypes.service';
import { RoomtypesController } from './roomtypes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RoomtypesController],
  providers: [RoomtypesService, PrismaService],
})
export class RoomtypesModule {}
