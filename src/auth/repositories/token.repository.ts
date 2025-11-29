import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(id: string, exp: number, hash: string) {
    return this.prismaService.token.update({
      where: { userId: id },
      data: { exp, hash },
    });
  }

  async resetSession(id: string) {
    return this.prismaService.user.update({
      where: {
        id,
      },

      data: {
        // isOnline: false,

        token: {
          update: {
            exp: 0,
            hash: null,
          },
        },
      },
    });
  }
}
