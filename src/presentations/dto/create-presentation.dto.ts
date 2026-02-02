import { IsNotEmpty, IsString } from 'class-validator';
import { TeamCompositionsDto } from 'src/trips/dto/team-compositions.dto';

export class CreatePresentationDto extends TeamCompositionsDto {
  @IsString({ message: 'Дата презентации должно быть строкой' })
  @IsNotEmpty({ message: 'Дата презентации - обязательное поле' })
  date: string;

  @IsString({ message: 'Время презентации должно быть строкой' })
  @IsNotEmpty({ message: 'Время презентации - обязательное поле' })
  time: string;

  @IsString({ message: 'Место проведения презентации должно быть строкой' })
  @IsNotEmpty({ message: 'Место проведения презентации - обязательное поле' })
  placeId: string;
}
