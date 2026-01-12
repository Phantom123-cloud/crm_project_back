import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';

export class UpdateRoleTypeDto extends PartialType(CreateRoleDto) {}
