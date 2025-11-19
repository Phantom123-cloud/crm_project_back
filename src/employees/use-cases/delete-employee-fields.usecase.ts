import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class DeleteEmployeeFieldsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async deleteContactNumber(userId: string, phoneId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }
    const currentLanguages = user.employee.phones.map((item) => item.id);

    if (!currentLanguages.some((id) => phoneId === id)) {
      throw new ConflictException('Контакт не найден у данного пользователя');
    }

    await this.prismaService.phones.delete({
      where: {
        id: phoneId,
      },
    });
    return buildResponse('Данные удалены');
  }
  async deleteLanguage(userId: string, languageId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }
    const currentLanguages = user.employee.foreignLanguages.map(
      (item) => item.id,
    );

    if (!currentLanguages.some((id) => languageId === id)) {
      throw new ConflictException('Язык не найден у данного пользователя');
    }

    await this.prismaService.foreignLanguages.delete({
      where: {
        id: languageId,
      },
    });

    return buildResponse('Данные удалены');
  }
}
