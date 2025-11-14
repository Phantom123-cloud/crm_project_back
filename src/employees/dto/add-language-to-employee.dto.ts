import { LanguageLevel } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class AddLanguageToEmployeeDto {
  @IsNotEmpty({ message: 'Обязательное поле' })
  level: LanguageLevel;
  @IsNotEmpty({ message: 'Обязательное поле' })
  languageId: string;
}
