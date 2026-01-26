import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Поле должно быть строкой' })
  @Length(2, 150, { message: 'Длина должна быть от 2 - 150 символов' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  name: string;
}
