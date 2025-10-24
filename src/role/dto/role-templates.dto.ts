import { IsArray, IsString, MaxLength, MinLength } from 'class-validator';
export class RoleTemplatesDto {
  @IsArray({ message: 'Данные должны быть массивом' })
  @MinLength(1, { message: 'Минимальная длина массив - 1' })
  array: string[];

  @IsString({ message: 'Имя - строка' })
  @MinLength(5, { message: 'Минимальная длина - 5' })
  @MaxLength(20, { message: 'Максимальная длина - 20' })
  name: string;
}
