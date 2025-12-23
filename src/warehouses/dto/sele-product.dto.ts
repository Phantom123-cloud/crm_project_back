import { IsEnum, IsNotEmpty } from 'class-validator';

export class SaleProductDto {
  @IsNotEmpty({ message: 'К-во товара - обязательное поле' })
  quantity: number;

  @IsNotEmpty({ message: 'Номер договора обязателен' })
  reason: string;

  @IsEnum(
    { SALE: 'SALE', GIFT: 'GIFT', DELIVERY: 'DELIVERY' },
    { message: 'Некоректно переданные данные для типа' },
  )
  stockMovementType: 'SALE' | 'GIFT' | 'DELIVERY';
}
