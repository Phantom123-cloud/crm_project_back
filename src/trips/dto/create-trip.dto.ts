import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTripDto {
  // @IsString({ message: 'Название должно быть строкой' })
  // @Length(5, 20, { message: 'Длина название от 5 до 20 символов' })
  // @IsNotEmpty({ message: 'Название - обязательное поле' })
  // name: string;

  @IsString({ message: 'Дата начала выезда должна быть строкой' })
  @IsNotEmpty({ message: 'Дата начала - обязательное поле' })
  dateFrom: string;

  @IsString({ message: 'Дата конца выезда должна быть строкой' })
  @IsNotEmpty({ message: 'Дата конца выезда - обязательное поле' })
  dateTo: string;
}
