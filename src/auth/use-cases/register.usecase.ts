import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { ensureAllExist, ensureNoDuplicates } from 'src/utils/is-exists.utils';
import { UsersRepository } from 'src/users/users.repository';
import { RoleTemplatesRepository } from 'src/role-templates/role-templates.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { buildResponse } from 'src/utils/build-response';
import { RolesRepository } from 'src/roles/roles.repository';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleTemplatesRepository: RoleTemplatesRepository,
    private readonly authRepository: AuthRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async register(dto: RegisterDto) {
    const { email, arrayBlockedRoles, arrayAddRoles, roleTemplatesId } = dto;

    const isUser = await this.usersRepository.findByEmail(email);

    if (isUser) {
      throw new ConflictException('Эта почта уже используется');
    }

    const template =
      await this.roleTemplatesRepository.roleTemplatesById(roleTemplatesId);

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const templateRoleIds = new Set(template.roles.map((r) => r.id));

    if (arrayBlockedRoles?.length) {
      ensureAllExist(
        arrayBlockedRoles,
        templateRoleIds,
        'Не все роли для блокировки переданные вами соответствуют текущим ролям шаблона',
      );
    }
    if (arrayAddRoles?.length) {
      const existingRoles =
        await this.rolesRepository.existingRoles(arrayAddRoles);

      if (!existingRoles.length) {
        throw new NotFoundException('Некоторые указанные роли не найдены');
      }

      ensureNoDuplicates(
        arrayAddRoles,
        templateRoleIds,
        'Некоторые роли переданные вами для добавления дополнительных прав, уже присутствуют в текущем шаблоне',
      );
    }

    await this.authRepository.createUser(dto);
    return buildResponse('Новый пользователь добавлен');
  }
}
