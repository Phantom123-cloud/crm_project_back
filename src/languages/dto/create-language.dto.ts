import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLanguageDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 50, { message: 'Длина должна быть от 2 - 50 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  localeRu: string;
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 50, { message: 'Длина должна быть от 2 - 50 символов' })
  localeEn: string;
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 10, { message: 'Длина должна быть от 2 - 10 символов' })
  code: string;
}
