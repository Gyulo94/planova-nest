import { Controller } from '@nestjs/common';
import { LabelService } from '../service/label.service';

@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}
}
