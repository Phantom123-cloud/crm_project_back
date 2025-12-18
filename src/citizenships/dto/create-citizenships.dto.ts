import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCitizenshipsDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 30, { message: 'Длина должна быть от 2 - 50 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  localeRu: string;

  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 30, { message: 'Длина должна быть от 2 - 50 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  localeEn: string;

  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 5, { message: 'Длина должна быть от 2 - 50 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  code: string;
}
