import { PartialType } from '@nestjs/swagger';
import { CreatePresentationTypesDto } from './create-presentation-types.dto';

export class UpdatePresentationTypesDto extends PartialType(CreatePresentationTypesDto) {}
