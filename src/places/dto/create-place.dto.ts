import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePlaceDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 200, { message: 'Длина должна быть от 2 - 200 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;

  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 100, { message: 'Длина должна быть от 2 - 100 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  city: string;

  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 200, { message: 'Длина должна быть от 2 - 200 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  street: string;

  @IsOptional()
  @IsString({ message: 'Поле должно быть строкой' })
  postcode?: string;
}
