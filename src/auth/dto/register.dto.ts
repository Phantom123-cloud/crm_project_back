import {
  Matches,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsArray,
} from 'class-validator';

export class RegisterDto {
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  email: string;

  @IsString({ message: 'Пароль - это строка' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Length(6, 20, { message: 'Длина пароля от 6 до 20 символов' })
  password: string;

  @IsOptional()
  @IsArray()
  arrayBlockedRoles?: string[];

  @IsOptional()
  @IsArray()
  arrayAddRoles?: string[];

  @IsString({ message: 'Шаблон - это строка' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  roleTemplatesId: string;
}
