import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import parse from 'parse-duration';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { isDev } from 'src/utils/is-dev.utils';
import type { StringValue } from 'ms';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TokenService {
  private readonly TOKEN_TTL_S: number;
  private readonly TOKEN_TTL_L: number;
  private readonly COOKIE_DOMAIN: string;
  private readonly JWT_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    // секунды, а не миллисекунды!
    this.TOKEN_TTL_S = 1 * 24 * 60 * 60; // 1 день
    this.TOKEN_TTL_L = 7 * 24 * 60 * 60; // 7 дней
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
  }

  async auth(res: Response, payload: JwtPayload, remember: boolean) {
    const { id, email, fullName } = payload;
    const user = await this.usersService.findUser(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    const { id: tokenId, exp: currentExp } = user.token;
    const now = Math.floor(Date.now() / 1000);

    if (user.token.hash && now < currentExp) {
      throw new ConflictException(
        'Ваша сессия активна, вы не можете войти повторно!',
      );
    }

    const ttl = this[remember ? 'TOKEN_TTL_L' : 'TOKEN_TTL_S'];
    const exp = now + ttl;

    const { hash } = this.generateTokens(id, email, fullName, ttl);
    this.setTokenCookie(res, hash, ttl * 1000);
    await this.prismaService.token.update({
      where: { id: tokenId },
      data: { exp, hash },
    });

    return buildResponse('Вы вошли в систему');
  }

  private signToken(payload: JwtPayload, ttl: number) {
    return this.jwtService.sign(payload, {
      expiresIn: ttl,
      secret: this.JWT_SECRET,
    });
  }

  private generateTokens(
    id: string,
    email: string,
    fullName: string,
    ttl: number,
  ) {
    const payload: JwtPayload = { id, email, fullName };
    const hash = this.signToken(payload, ttl);
    return { hash };
  }
  private setTokenCookie(res: Response, value: string, maxAgeMs: number) {
    res.cookie('token', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: 'lax',
      maxAge: maxAgeMs,
    });
  }
  async logout(res: Response, req: Request) {
    const token = req.cookies['token'];
    const payload: JwtPayload = await this.jwtService.verifyAsync(token);
    await this.deactivateTokens(payload.id);
    this.setTokenCookie(res, '', 0);

    return buildResponse('Выполнен выход из системы');
  }
  async logoutById(id: string) {
    await this.deactivateTokens(id);
    return buildResponse('Выполнен выход из системы');
  }
  async deactivateTokens(id: string) {
    const user = await this.usersService.findUser(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }
    const now = Math.floor(Date.now() / 1000);
    const { exp } = user.token;

    if (!user.token.hash && now > exp) {
      throw new BadRequestException('Пользователь не имеет активной сессии');
    }

    await this.prismaService.user.update({
      where: {
        id,
      },

      data: {
        isOnline: false,

        token: {
          update: {
            exp: 0,
            hash: null,
          },
        },
      },
    });

    return true;
  }
  async validateToken(req: Request, res: Response) {
    const tokenHash = req.cookies['token'];
    const { id } = req.user as JwtPayload;
    const user = await this.usersService.findUser(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    const now = Math.floor(Date.now() / 1000);
    const { exp, hash } = user.token;

    if (now > exp || tokenHash !== hash) {
      this.setTokenCookie(res, '', 0);
      throw new UnauthorizedException('Сессия просрочена, войдите снова');
    }
  }
}
