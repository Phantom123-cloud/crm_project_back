import { PartialType } from '@nestjs/swagger';
import { CreateTripTypesDto } from './create-trip-types.dto';

export class UpdateTripTypesDto extends PartialType(CreateTripTypesDto) {}
