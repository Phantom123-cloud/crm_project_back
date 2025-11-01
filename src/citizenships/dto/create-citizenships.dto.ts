import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCitizenshipsDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  localeRu: string;
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsString({ message: 'Поле должно быть строкой' })
  localeEn: string;
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsString({ message: 'Поле должно быть строкой' })
  code: string;
}
