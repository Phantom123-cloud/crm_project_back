import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { RolesRepository } from 'src/roles/roles.repository';

@Injectable()
export class RolesByUserIdBuilder {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async userRoleIds(userId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    const templateRoles = await this.rolesRepository.effectiveRoles(userId);

    const individualRoles = user.individualRules
      .filter((rule) => rule.type === 'ADD')
      .map((rule) => rule.role.id);

    const allRoles = [...templateRoles.map((r) => r.id), ...individualRoles];
    const data = [...new Set(allRoles)];
    return data;
  }
}
