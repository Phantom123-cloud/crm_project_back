import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { buildResponse } from 'src/utils/build-response';
import { isDev } from 'src/utils/is-dev.utils';
import { UsersRepository } from 'src/users/users.repository';
import { TokenRepository } from '../repositories/token.repository';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreateSessionBuilder {
  private readonly TOKEN_TTL_S: number;
  private readonly TOKEN_TTL_L: number;
  private readonly COOKIE_DOMAIN: string;
  private readonly JWT_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
    private readonly usersRepository: UsersRepository,
    private readonly prismaService: PrismaService,
  ) {
    this.TOKEN_TTL_S = 1 * 24 * 60 * 60;
    this.TOKEN_TTL_L = 7 * 24 * 60 * 60;
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
  }

  async tokenAuth(res: Response, payload: JwtPayload, remember: boolean) {
    const { id, email } = payload;
    const user = await this.usersRepository.findByUserId(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    const { exp: currentExp } = user.token;
    const now = Math.floor(Date.now() / 1000);

    if (user.token.hash && now < currentExp) {
      throw new ConflictException(
        'Ваша сессия активна, вы не можете войти повторно!',
      );
    }

    const ttl = this[remember ? 'TOKEN_TTL_L' : 'TOKEN_TTL_S'];
    const exp = now + ttl;

    const { hash } = this.generateTokens(id, email, ttl);
    this.setTokenCookie(res, hash, ttl * 1000);

    await this.tokenRepository.createSession(id, exp, hash);
    // await this.prismaService.user.update({
    //   where: {
    //     id,
    //   },
    //   data: {
    //     isOnline: true,
    //   },
    // });
    return buildResponse('Вы вошли в систему');
  }

  async deactivateTokens(id: string) {
    const user = await this.usersRepository.findByUserId(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }
    const now = Math.floor(Date.now() / 1000);
    const { exp } = user.token;

    if (!user.token.hash && now > exp) {
      throw new BadRequestException('Пользователь не имеет активной сессии');
    }

    await this.tokenRepository.resetSession(id);

    return true;
  }
  async validateToken(req: Request, res: Response) {
    const tokenHash = req.cookies['token'];
    const { id } = req.user as JwtPayload;
    const user = await this.usersRepository.findByUserId(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    const now = Math.floor(Date.now() / 1000);
    const { exp, hash } = user.token;

    if (now > exp || tokenHash !== hash) {
      this.setTokenCookie(res, '', 0);
      throw new UnauthorizedException('Сессия просрочена, войдите снова');
    }

    // if (!user.isOnline) {
    //   await this.prismaService.user.update({
    //     where: {
    //       id: user.id,
    //     },

    //     data: {
    //       isOnline: true,
    //     },
    //   });
    // }
  }

  signToken(payload: JwtPayload, ttl: number) {
    return this.jwtService.sign(payload, {
      expiresIn: ttl,
      secret: this.JWT_SECRET,
    });
  }
  generateTokens(userId: string, email: string, ttl: number) {
    const payload: JwtPayload = { id: userId, email };
    const hash = this.signToken(payload, ttl);
    return { hash };
  }
  setTokenCookie(res: Response, value: string, maxAgeMs: number) {
    res.cookie('token', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: 'lax',
      maxAge: maxAgeMs,
    });
  }
}
