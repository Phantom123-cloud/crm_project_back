import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { UpdateEmployeeFormDto } from '../dto/update-employee-form.dto';
import { EmployeesRepository } from '../employees.repositories';
import { buildResponse } from 'src/utils/build-response';
import { UpdateEmployeePassportDto } from '../dto/update-employee-passport.dto';
import { ImportedFildsUseCase } from './imported-fields.usecase';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly employeesRepository: EmployeesRepository,
    private readonly importedFildsUseCase: ImportedFildsUseCase,
    private readonly prismaService: PrismaService,
  ) {}

  async updateEmployeeForm(
    dto: Partial<UpdateEmployeeFormDto>,
    userId: string,
  ) {
    const user = await this.usersRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    if (dto?.tradingСode) {
      const checkUnique = await this.employeesRepository.findByTradingCode(
        dto?.tradingСode,
      );

      if (checkUnique) {
        throw new ConflictException('Код торгового занят');
      }
    }

    await this.employeesRepository.updateEmployeeForm(dto, userId);

    return buildResponse('Данные обновлены');
  }

  async updateEmployeePassport(
    dto: Partial<UpdateEmployeePassportDto>,
    userId: string,
  ) {
    const {
      citizenships,
      fullName,
      birthDate,
      registrationAddress,
      actualAddress,
    } = dto;

    const user = await this.usersRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    if (citizenships?.length) {
      const existing = user.employee.citizenships.map((c) => c.id);
      this.importedFildsUseCase.validateImportedField('citizen', {
        existing,
        incoming: citizenships,
      });

      const isExistCitizenshipsDb =
        await this.prismaService.citizenships.findMany({
          where: {
            id: {
              in: citizenships,
            },
          },
        });
      if (isExistCitizenshipsDb.length !== citizenships?.length) {
        throw new NotFoundException(
          'Некоторые указанные вами страны не найдены',
        );
      }
    }

    await this.employeesRepository.updateEmployeePassport(dto, userId);

    return buildResponse('Данные обновлены');
  }
}
