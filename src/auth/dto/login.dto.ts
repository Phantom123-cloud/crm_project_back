import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  email: string;

  @IsString({ message: 'Пароль - это строка' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Length(5, 20, { message: 'Длина от 5 до 20 символов' })
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'Поле `запомнить меня` - boolean значение' })
  remember: boolean;
}
