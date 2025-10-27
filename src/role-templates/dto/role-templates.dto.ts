import {
  IsArray,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
export class RoleTemplatesDto {
  @IsArray({ message: 'Данные должны быть массивом' })
  // @Length(1, 10, { message: 'Минимальная длина массив - 1' })
  array: string[];

  @IsString({ message: 'Имя - строка' })
  @MinLength(5, { message: 'Минимальная длина - 5' })
  @MaxLength(20, { message: 'Максимальная длина - 20' })
  name: string;
}
