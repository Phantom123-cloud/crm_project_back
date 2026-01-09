import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProductsDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(5, 120, { message: 'Длина от 5 до 120 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;
}
