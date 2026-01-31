import { IsNotEmpty, IsString } from 'class-validator';
import { TeamCompositionsDto } from 'src/trips/dto/team-compositions.dto';

export class CreatePresentationDto {
  @IsString({ message: 'Дата презентации должно быть строкой' })
  @IsNotEmpty({ message: 'Дата презентации - обязательное поле' })
  date: string;

  @IsString({ message: 'Время презентации должно быть строкой' })
  @IsNotEmpty({ message: 'Время презентации - обязательное поле' })
  time: string;

  teams: TeamCompositionsDto;
}
