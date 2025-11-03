import {
  Matches,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class RegisterDto {
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  email: string;

  @IsString({ message: 'Пароль - это строка' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Length(5, 20, { message: 'Длина пароля от 5 до 20 символов' })
  password: string;

  @IsString({ message: 'Полное имя - это строка' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Length(5, 100, { message: 'Длина имени от 5 до 100 символов' })
  fullName: string;

  @IsOptional()
  @IsArray()
  arrayBlockedRoles?: string[];

  @IsOptional()
  @IsArray()
  arrayAddRoles?: string[];
}
