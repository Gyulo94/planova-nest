import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
} from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CommentRequest } from '../request/comment.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { CommentResponse } from '../response/comment.response';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Message(ResponseMessage.CREATE_COMMENT_SUCCESS)
  @Post()
  async create(
    @Session() session: UserSession,
    @Body() request: CommentRequest,
  ): Promise<CommentResponse> {
    return this.commentService.create(session.user.id, request);
  }

  @Get('task/:taskId')
  async findByTaskId(
    @Param('taskId') taskId: string,
  ): Promise<CommentResponse[]> {
    return this.commentService.findByTaskId(taskId);
  }

  @Message(ResponseMessage.UPDATE_COMMENT_SUCCESS)
  @Put(':id')
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() request: CommentRequest,
  ): Promise<CommentResponse> {
    return this.commentService.update(session.user.id, id, request);
  }

  @Message(ResponseMessage.DELETE_COMMENT_SUCCESS)
  @Delete(':id')
  async delete(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<{ id: string }> {
    return this.commentService.delete(session.user.id, id);
  }
}
