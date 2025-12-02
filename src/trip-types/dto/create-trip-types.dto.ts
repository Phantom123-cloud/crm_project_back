import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTripTypesDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(5, 20, { message: 'Длина от 5 до 20 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;
}
