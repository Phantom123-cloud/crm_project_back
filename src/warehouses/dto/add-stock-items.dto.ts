import { WhomOrWhere } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddStockItems {
  @IsNotEmpty({ message: 'К-во товара - обязательное поле' })
  quantity: number;

  @IsOptional()
  fromOrTo: WhomOrWhere;
}
