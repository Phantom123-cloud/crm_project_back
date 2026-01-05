import { StockMovementsStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

export class PaginationStockMovementsDto extends PaginationBasic {
  @ToBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsEnum({ StockMovementsStatus })
  status?: StockMovementsStatus;
}
