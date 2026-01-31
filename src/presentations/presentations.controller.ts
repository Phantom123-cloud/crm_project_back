import { Controller } from '@nestjs/common';
import { PresentationsService } from './presentations.service';

@Controller('presentations')
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}
}
