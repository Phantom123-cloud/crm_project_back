import { PartialType } from '@nestjs/swagger';
import { CreateCitizenshipsDto } from './create-citizenships.dto';

export class UpdateCitizenshipsDto extends PartialType(CreateCitizenshipsDto) {}
