import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleTemplateDto {
  @IsString()
  @IsOptional()
  key?: 'connect' | 'disconnect';
  
  @IsArray({ message: 'Данные должны быть массивом' })
  @IsOptional()
  array?: string[];

  @IsString()
  @IsOptional()
  name?: string;
}
