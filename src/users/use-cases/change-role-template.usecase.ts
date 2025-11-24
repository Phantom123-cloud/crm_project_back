import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildResponse } from 'src/utils/build-response';
import { UsersRepository } from '../users.repository';
import { RoleTemplatesRepository } from 'src/role-templates/role-templates.repository';

@Injectable()
export class ChangeRoleTemplateUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleTemplatesRepository: RoleTemplatesRepository,
  ) {}
  async changeRoleTemplate(userId: string, roleTemplatesId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    if (user.roleTemplate?.id === roleTemplatesId) {
      throw new ConflictException(
        'Вы отправили текущий шаблон, измените выбор',
      );
    }

    const roleTemplate =
      await this.roleTemplatesRepository.roleTemplatesById(roleTemplatesId);

    if (!roleTemplate) {
      throw new NotFoundException('Шаблон не найден');
    }
    const currentIndivIds = user.individualRules.map((i) => i.id);

    await this.usersRepository.changeRoleTemplate(
      userId,
      roleTemplatesId,
      currentIndivIds,
    );

    return buildResponse('Данные обновлены');
  }
}
