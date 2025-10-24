import { IndividualRulesType } from '@prisma/client';
import { IsArray, MinLength } from 'class-validator';

export class IndividualRulesDto {
  @IsArray({ message: 'Данные должны быть массивом' })
  @MinLength(1, { message: 'Минимальная длина массив - 1' })
  array: string[];
  type: IndividualRulesType;
}
