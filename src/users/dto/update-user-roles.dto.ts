import { IsArray, IsOptional } from 'class-validator';

export class UpdateUserRolesDto {
  @IsOptional()
  @IsArray()
  unlock?: string[];
  @IsOptional()
  @IsArray()
  removeIndividual?: string[];
  @IsOptional()
  @IsArray()
  blockCurrent?: string[];
  @IsOptional()
  @IsArray()
  addUnused?: string[];
}
