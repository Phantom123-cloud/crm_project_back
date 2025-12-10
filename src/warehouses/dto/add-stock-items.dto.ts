import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddStockItems {
  @IsNotEmpty({ message: 'К-во товара - обязательное поле' })
  quantity: number;
}
