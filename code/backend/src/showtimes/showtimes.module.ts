import { Module } from '@nestjs/common';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { ShowtimeCleanupService } from './showtime-cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShowtimesController],
  providers: [ShowtimesService, ShowtimeCleanupService]
})
export class ShowtimesModule {}
