import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationBasic {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1, { message: 'Минимум 1 пункт' })
  page: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Max(100, { message: 'Максимум 100 пунктов' })
  limit: number;
}
