import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleTemplateDto {
  @IsOptional()
  @IsArray({ message: 'Данные должны быть массивом' })
  arrayConnect?: string[];

  @IsOptional()
  @IsArray({ message: 'Данные должны быть массивом' })
  arrayDisconnect?: string[];

  @IsOptional()
  @IsString()
  name?: string;
}
