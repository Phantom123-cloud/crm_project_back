import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { EmployeesRepository } from '../employees.repositories';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class EmployeeCitizenshipUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly employeesRepository: EmployeesRepository,
  ) {}

  async disconnectCitizenship(citizenshipId: string, userId: string) {
    const user = await this.usersRepository.findUserWithEmployeeAndCitizenship(
      userId,
      citizenshipId,
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    await this.employeesRepository.updateEmployeeCitizenship(
      citizenshipId,
      userId,
    );

    return buildResponse('Данные обновлены');
  }
}
