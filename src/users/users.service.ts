import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import type { Request, Response } from 'express';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import { PaginationDto } from './dto/pagination.dto';
import { TokenService } from 'src/token/token.service';
import { RolesService } from 'src/roles/roles.service';
import { RoleTemplatesService } from 'src/role-templates/role-templates.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly roleTemplatesService: RoleTemplatesService,
  ) {}

  async findUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        password: true,
        isActive: true,
        email: true,

        token: {
          select: {
            id: true,
            exp: true,
            hash: true,
          },
        },

        individualRules: {
          select: {
            type: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        roleTemplate: {
          select: {
            id: true,
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return user;
  }
  async allUsers(dto: PaginationDto) {
    const { page, limit, isActive, isOnline, isFullData } = dto;

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(typeof isOnline === 'boolean' && { isOnline }),
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          isActive: true,
          isOnline: true,
          ...(isFullData && {
            employee: {
              select: {
                fullName: true,
                tradingСode: true,
                citizenships: {
                  select: {
                    localeRu: true,
                    localeEn: true,
                  },
                },
                registrationAddress: true,
                actualAddress: true,
                birthDate: true,
                phones: {
                  select: {
                    number: true,
                    option: true,
                  },
                },
                dateFirstTrip: true,
                isInMarriage: true,
                isHaveChildren: true,
                isHaveDriverLicense: true,
                drivingExperience: true,
                isHaveInterPassport: true,
                foreignLanguages: {
                  select: {
                    level: true,
                    language: {
                      select: {
                        localeRu: true,
                        localeEn: true,
                      },
                    },
                  },
                },
              },
            },
          }),
        },
      }),
      this.prismaService.user.count({
        where: {
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(typeof isOnline === 'boolean' && { isOnline }),
        },
      }),
    ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { users, total, countPages, page, limit },
    });
  }

  async userById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        isActive: true,
        isOnline: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            tradingСode: true,
            notes: true,
            registrationAddress: true,
            actualAddress: true,
            citizenships: {
              select: {
                id: true,
                localeRu: true,
                localeEn: true,
              },
            },
            birthDate: true,
            phones: {
              select: {
                id: true,
                number: true,
                option: true,
              },
            },
            dateFirstTrip: true,
            isInMarriage: true,
            isHaveChildren: true,
            isHaveDriverLicense: true,
            drivingExperience: true,
            isHaveInterPassport: true,
            foreignLanguages: {
              select: {
                id: true,
                level: true,
                language: {
                  select: { id: true, localeRu: true, localeEn: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const filesName = await this.prismaService.files.findMany({
      where: {
        employeesId: user?.employee?.id,
        type: 'PASSPORT',
      },

      select: {
        fileName: true,
      },
    });

    const passports = filesName.map((file) => file.fileName);

    return buildResponse('Данные', {
      data: { user, passports },
    });
  }
  async meRoles(id: string) {
    const meIds = await this.rolesService.getRolesByUserId(id);

    const [rolesData, types] = await this.prismaService.$transaction([
      this.prismaService.role.findMany({
        where: {
          id: {
            in: meIds,
          },
        },
        select: {
          name: true,
          id: true,
          descriptions: true,
          type: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          type: {
            name: 'asc',
          },
        },
      }),
      this.prismaService.roleTypes.findMany({
        where: {
          roles: {
            some: {
              id: {
                in: meIds,
              },
            },
          },
        },
        select: {
          name: true,
          descriptions: true,
          id: true,
        },

        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const roles = this.roleTemplatesService.roleData({ types, rolesData });

    return roles;
  }
  async logoutByUserId(id: string, req: Request) {
    const { id: meId } = req.user as JwtPayload;
    if (meId === id) {
      throw new ConflictException('Вы не можете вылогинить сами себя');
    }

    return await this.tokenService.logoutById(id);
  }
  async isActiveUser(id: string, req: Request) {
    const { id: meId } = req.user as JwtPayload;
    if (meId === id) {
      throw new ConflictException('Вы не можете заблокировать сами себя');
    }
    const user = await this.findUser(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isActive) {
      await this.prismaService.user.update({
        where: { id },
        data: {
          isActive: false,
          isOnline: false,

          token: {
            update: {
              hash: null,
              exp: 0,
            },
          },
        },
      });
    } else {
      await this.prismaService.user.update({
        where: { id },
        data: {
          isActive: true,
        },
      });
    }

    return buildResponse(
      `Пользователь - ${user.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
  async me(req: Request, res: Response) {
    const user = req.user as JwtPayload;
    await this.tokenService.validateToken(req, res);
    const roles = await this.meRoles(user.id);

    return buildResponse('Данные', { data: { roles, meData: user } });
  }
}
