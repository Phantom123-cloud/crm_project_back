import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { buildResponse } from 'src/utils/build-response';
import { AddLanguageToEmployeeDto } from '../dto/add-language-to-employee.dto';
import { AddContactNumberToEmployeeDto } from '../dto/add-contact-number-to-employee.dto';

@Injectable()
export class AddEmployeeFieldsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async addLanguage(userId: string, dto: AddLanguageToEmployeeDto) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }
    const { level, languageId } = dto;
    const currentLanguages = user.employee.foreignLanguages.map(
      (item) => item.languageId,
    );

    if (currentLanguages.some((id) => languageId === id)) {
      throw new ConflictException('Язык ранее уже был добавлен пользователю');
    }

    await this.prismaService.foreignLanguages.create({
      data: {
        employeesId: user.employee.id,
        level,
        languageId,
      },
    });

    return buildResponse('Данные добавдены');
  }
  async addContactNumber(userId: string, dto: AddContactNumberToEmployeeDto) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }
    const { option, number } = dto;

    if (
      user.employee.phones.some(
        (item) => item.number === number && item.option === option,
      )
    ) {
      throw new ConflictException('Контакт ранее был добавлен');
    }

    await this.prismaService.phones.create({
      data: {
        employeesId: user.employee.id,
        option,
        number,
      },
    });
    return buildResponse('Данные добавдены');
  }
}
