import { PartialType } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';

export class RenameTripDto extends PartialType(CreateTripDto) {}
