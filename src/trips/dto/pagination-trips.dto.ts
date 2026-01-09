import { IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

export class PaginationTripsDto extends PaginationBasic {
  @ToBoolean()
  @IsOptional()
  isActive?: boolean;
}
