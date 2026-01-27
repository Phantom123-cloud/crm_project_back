import { PartialType } from '@nestjs/swagger';
import { TeamCompositionsDto } from './team-compositions.dto';

export class UpdateTeamCompositionsDto extends PartialType(TeamCompositionsDto) {}
