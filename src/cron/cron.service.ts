import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoggerService } from 'src/common/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CronService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  @Cron('*/15 * * * *')
  async handleTimeout() {
    const threshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();

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
