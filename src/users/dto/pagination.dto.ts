import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  isOnline?: boolean;

  @IsBoolean()
  isFullData?: boolean;
}
