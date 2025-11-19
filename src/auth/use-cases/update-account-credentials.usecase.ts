import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from 'src/users/users.repository';
import { buildResponse } from 'src/utils/build-response';
import { UpdateAccountCredentialsDto } from '../dto/update-account-credentials.dto';

@Injectable()
export class UpdateAccountCredentialsUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async updateAccountCredentials(
    dto: Partial<UpdateAccountCredentialsDto>,
    userId: string,
  ) {
    const user = await this.usersRepository.findByUserId(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { oldPassword, newPassword, email } = dto;
    if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
      throw new BadRequestException(
        'Некорректно переданные данные для смены пароля',
      );
    }

    let hashNewPassword: string | undefined = undefined;
    if (oldPassword && newPassword) {
      const isMatch = await argon2.verify(user.password, oldPassword);

      if (!isMatch) {
        throw new ConflictException('Не верный пароль');
      }

      hashNewPassword = await argon2.hash(newPassword);
    }

    await this.usersRepository.updateUserAccount(
      userId,
      email,
      hashNewPassword,
    );

    return buildResponse('Данные обновлены');
  }
}
