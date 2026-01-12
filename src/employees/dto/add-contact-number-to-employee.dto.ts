import { PhoneSelection } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class AddContactNumberToEmployeeDto {
  @IsNotEmpty({ message: 'Обязательное поле' })
  option: PhoneSelection;
  @IsNotEmpty({ message: 'Обязательное поле' })
  number: string;
}
