import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { CommentRequest } from '../request/comment.request';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { CommentResponse } from '../response/comment.response';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async create(
    userId: string,
    request: CommentRequest,
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.create({
      ...CommentRequest.toModel(request),
      userId,
    });

    const commentWithTask = await this.commentRepository.findById(comment.id);
    if (!commentWithTask) {
      throw new ApiException(ErrorCode.COMMENT_NOT_FOUND);
    }

    await this.activityService.createActivity({
      action: 'COMMENT_CREATE',
      description: `작업 '${commentWithTask.task.title}'에 댓글을 남겼습니다.`,
      workspaceId: commentWithTask.task.project.workspaceId,
      projectId: commentWithTask.task.projectId,
      taskId: commentWithTask.taskId,
      userId,
    });

    this.eventEmitter.emit('comment.created', {
      projectId: commentWithTask.task.projectId,
      comment,
    });

    const response = CommentResponse.fromModel(comment);

    return response;
  }

  @Transactional()
  async update(
    userId: string,
    id: string,
    request: CommentRequest,
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new ApiException(ErrorCode.COMMENT_NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }

    const updatedComment = await this.commentRepository.update(
      id,
      request.content,
    );

    this.eventEmitter.emit('comment.updated', {
      projectId: comment.task.projectId,
      comment: updatedComment,
    });

    const response = CommentResponse.fromModel(updatedComment);

    return response;
  }

  @Transactional()
  async delete(userId: string, id: string): Promise<{ id: string }> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new ApiException(ErrorCode.COMMENT_NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }

    await this.commentRepository.delete(id);

    this.eventEmitter.emit('comment.deleted', {
      projectId: comment.task.projectId,
      commentId: id,
    });

    return { id };
  }

  async findByTaskId(taskId: string): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.findByTaskId(taskId);

    const response = comments.map((comment) =>
      CommentResponse.fromModel(comment),
    );

    return response;
  }
}
