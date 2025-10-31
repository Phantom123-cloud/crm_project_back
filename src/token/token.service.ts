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
  private readonly TOKEN_TTL_S: StringValue;
  private readonly TOKEN_TTL_L: StringValue;
  private readonly COOKIE_DOMAIN: string;
  private readonly JWT_SECRET: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    this.TOKEN_TTL_S = configService.getOrThrow<StringValue>('JWT_TOKEN_TTL_S');
    this.TOKEN_TTL_L = configService.getOrThrow<StringValue>('JWT_TOKEN_TTL_L');
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
  }

  async auth(res: Response, payload: JwtPayload, remember: boolean) {
    const { id, email, full_name } = payload;
    const user = await this.usersService.findUser(id);

    if (!user || !user.token) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    const { id: tokenId, isActive } = user.token;

    if (isActive) {
      throw new ConflictException(
        'Ваша сессия активна, вы не можете войти повторно!',
      );
    }

    const ttl = this[remember ? 'TOKEN_TTL_L' : 'TOKEN_TTL_S'];
    const { hash } = this.generateTokens(id, email, full_name, ttl);

    this.setTokenCookie(res, hash, ttl);

    await this.prismaService.token.update({
      where: {
        id: tokenId,
      },
      data: {
        isActive: true,
        hash,
      },
    });

    return buildResponse('Вы вошли в систему');
  }
  private signToken(payload: JwtPayload, ttl: StringValue) {
    return this.jwtService.sign(payload, {
      expiresIn: ttl,
      secret: this.JWT_SECRET,
    });
  }
  private generateTokens(
    id: string,
    email: string,
    full_name: string,
    ttl: StringValue,
  ) {
    const payload: JwtPayload = { id, email, full_name };
    const hash = this.signToken(payload, ttl);

    return { hash };
  }
  private setTokenCookie(res: Response, value: string, ttl: string | 0) {
    const maxAge = typeof ttl === 'string' ? (parse(ttl) as number) : 0;

    return res.cookie('token', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: 'lax',
      maxAge,
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

    const { isActive } = user.token;

    if (!isActive) {
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
            isActive: false,
            hash: 'null',
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

    const { isActive, hash } = user.token;

    if (!isActive) {
      this.setTokenCookie(res, '', 0);
      throw new UnauthorizedException('Сессия просрочена, войдите снова');
    }

    const verifyTokenHash: JwtPayload & { exp: number } =
      await this.jwtService.verifyAsync(tokenHash);
    const exp = verifyTokenHash.exp;
    const now = Math.floor(Date.now() / 1000);
    console.log(exp< now);

    if (tokenHash !== hash || exp < now) {
      await this.deactivateTokens(id);
      throw new UnauthorizedException('Сессия просрочена, войдите снова');
    }
  }
}
