import { ArrayMinSize, IsArray, MinLength } from 'class-validator';

export class ArrayCompaniesDto {
  @IsArray({ message: 'Данные должны быть в виде массива' })
  @ArrayMinSize(1, { message: 'Минимальное к-во - 1' })
  companies: string[];
}
