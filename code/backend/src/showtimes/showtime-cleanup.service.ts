import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SUCCESS_MESSAGES } from '../common/constants/success-messages.constant';

@Injectable()
export class ShowtimeCleanupService {
  private readonly logger = new Logger(ShowtimeCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Chạy mỗi ngày lúc 02:00 AM
  @Cron('0 0 2 * * *')
  async handleExpiredShowtimesCleanup() {
    const now = new Date();

    const { count } = await this.prisma.showtime.deleteMany({
      where: {
        end_time: { lt: now },
      },
    });

    if (count > 0) {
      this.logger.log(SUCCESS_MESSAGES.SHOWTIME.AUTO_CLEANUP(count));
    } else {
      this.logger.debug('Không có lịch chiếu quá hạn cần xóa.');
    }
  }
}
