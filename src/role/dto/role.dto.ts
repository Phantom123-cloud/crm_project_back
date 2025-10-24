import { Length } from 'class-validator';

export class RoleDto {
  @Length(10, 100, { message: 'Длина от 10 до 100 символов' })
  name: string;
}
