import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RolesDataBuilder } from './roles-data.builder';
import { PrismaService } from 'src/prisma/prisma.service';
import { createRolesData } from '../helpers/create-roles-data.helper';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class MeRolesBuilder {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rolesDataBuilder: RolesDataBuilder,
    private readonly usersRepository: UsersRepository,
  ) {}

  // async meRoles(id: string) {
  //   const user = await this.usersRepository.findByUserId(id);

  //   if (!user) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }
  //   if (!user.employee || !user.token) {
  //     throw new ConflictException(
  //       'Аккаунт не владеет всеми необходимыми возможностями',
  //     );
  //   }
  //   const meIds = await this.rolesDataBuilder.getRolesIdsByUserId(id);

  //   const [rolesData, types] = await this.prismaService.$transaction([
  //     this.prismaService.role.findMany({
  //       where: {
  //         id: {
  //           in: meIds,
  //         },
  //       },
  //       select: {
  //         name: true,
  //         id: true,
  //         descriptions: true,
  //         type: {
  //           select: {
  //             id: true,
  //             name: true,
  //           },
  //         },
  //       },

  //       orderBy: {
  //         type: {
  //           name: 'asc',
  //         },
  //       },
  //     }),
  //     this.prismaService.roleTypes.findMany({
  //       where: {
  //         roles: {
  //           some: {
  //             id: {
  //               in: meIds,
  //             },
  //           },
  //         },
  //       },
  //       select: {
  //         name: true,
  //         descriptions: true,
  //         id: true,
  //       },

  //       orderBy: {
  //         name: 'asc',
  //       },
  //     }),
  //   ]);

  //   const roles = createRolesData({ types, rolesData });

  //   return roles;
  // }
}
