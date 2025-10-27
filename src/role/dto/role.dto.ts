import { IsOptional, Length } from 'class-validator';

export class RoleDto {
  @IsOptional()
  // @Length(5, 20, { message: 'Длина от 5 до 20 символов' })
  name?: string;

  @IsOptional()
  // @Length(5, 35, { message: 'Длина от 3 до 35 символов' })
  descriptions?: string;
}
