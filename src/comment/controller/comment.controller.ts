import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentRequest } from '../request/create-comment.request';
import { UpdateCommentRequest } from '../request/update-comment.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { Payload } from 'src/global/types';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Message(ResponseMessage.CREATE_COMMENT_SUCCESS)
  @Post()
  async create(
    @CurrentUser() user: Payload,
    @Body() request: CreateCommentRequest,
  ) {
    return this.commentService.create(user.id, request);
  }

  @Get('task/:taskId')
  async findByTaskId(@Param('taskId') taskId: string) {
    return this.commentService.findByTaskId(taskId);
  }

  @Message(ResponseMessage.UPDATE_COMMENT_SUCCESS)
  @Put(':id')
  async update(
    @CurrentUser() user: Payload,
    @Param('id') id: string,
    @Body() request: UpdateCommentRequest,
  ) {
    return this.commentService.update(user.id, id, request);
  }

  @Message(ResponseMessage.DELETE_COMMENT_SUCCESS)
  @Delete(':id')
  async delete(@CurrentUser() user: Payload, @Param('id') id: string) {
    return this.commentService.delete(user.id, id);
  }
}
