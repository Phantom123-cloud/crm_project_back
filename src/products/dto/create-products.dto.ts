import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProductsDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(5, 150, { message: 'Длина от 5 до 150 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;
}
