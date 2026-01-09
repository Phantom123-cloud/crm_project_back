import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

export class PaginationUsersDto extends PaginationBasic {
  @ToBoolean()
  @IsOptional()
  isActive?: boolean;

  @ToBoolean()
  @IsOptional()
  isOnline?: boolean;

  @ToBoolean()
  @IsBoolean()
  isFullData?: boolean;
}
