import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CronService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CronService.name);

  //   @Cron('05 * * * * *')
  //   handleCron() {
  //     this.logger.debug('Called when the current second is 45');
  //   }
  // 2025-11-23 02:00:12.662
  @Cron('*/5 * * * *')
  async handleTimeout() {
    const threshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const users = await this.prismaService.user.updateMany({
      where: {
        lastConnections: { lt: threshold },
        isOnline: true,
      },
      data: { isOnline: false },
    });

    this.logger.debug(
      `Операция по проверке онлайна завершена, смена статуса у - ${users.count} пользователей`,
    );
  }
}
