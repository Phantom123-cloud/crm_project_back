import { IsArray } from 'class-validator';

export class ValidateImportedDto {
  @IsArray({ message: 'Данные должны быть массивом' })
  existing: any[];
  @IsArray({ message: 'Данные должны быть массивом' })
  incoming: any[];
}
