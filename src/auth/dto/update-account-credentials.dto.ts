import { IsOptional, Length, Matches } from 'class-validator';

export class UpdateAccountCredentialsDto {
  @IsOptional()
  oldPassword: string;

  @IsOptional()
  @Length(5, 20, { message: 'Длина от 5 до 20 символов' })
  newPassword: string;

  @IsOptional()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Некорректный email' })
  email: string;
}
