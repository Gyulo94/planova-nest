import { Body, Controller, Post } from '@nestjs/common';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { LabelService } from '../service/label.service';
import { LabelRequest } from '../request/label.request';

@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Message(ResponseMessage.CREATE_LABEL_SUCCESS)
  @Post('create')
  async createLabel(@Body() request: LabelRequest) {
    return this.labelService.createLabel(request);
  }
}
