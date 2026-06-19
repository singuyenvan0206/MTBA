import { Module } from '@nestjs/common';
import { AgeLimitsService } from './age-limits.service';
import { AgeLimitsController } from './age-limits.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgeLimitsController],
  providers: [AgeLimitsService],
  exports: [AgeLimitsService],
})
export class AgeLimitsModule {}
