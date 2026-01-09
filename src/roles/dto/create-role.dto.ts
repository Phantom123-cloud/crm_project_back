import { IsOptional, Length } from 'class-validator';

export class CreateRoleDto {
  @IsOptional()
  @Length(4, 30, { message: 'Длина названия от 4 до 30 символов' })
  name: string;

  @IsOptional()
  @Length(5, 35, { message: 'Длина описания от 5 до 35 символов' })
  descriptions: string;
}
