import { IsArray, IsString } from 'class-validator';

export class ChangingRolesTemplateDto {
  @IsString()
  key: 'connect' | 'disconnect';
  @IsArray({ message: 'Данные должны быть массивом' })
  array: string[];
}
