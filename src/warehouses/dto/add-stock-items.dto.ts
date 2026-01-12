import { WhomOrWhere } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddStockItems {
  @IsNotEmpty({ message: 'К-во товара - обязательное поле' })
  quantity: number;

  @IsOptional()
  fromOrTo: WhomOrWhere;
}
