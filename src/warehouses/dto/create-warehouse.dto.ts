import { WarehousesTypes } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateWarehouseDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(5, 20, { message: 'Длина от 5 до 20 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;

  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsEnum(WarehousesTypes, { message: 'Некоректно переданные данные для типа' })
  type: WarehousesTypes;
}
