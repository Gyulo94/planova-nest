import { Injectable, NotFoundException } from '@nestjs/common';
import { MilestoneRepository } from '../repository/milestone.repository';
import {
  MilestoneRequest,
  UpdateMilestoneRequest,
} from '../request/milestone.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ActivityService } from 'src/activity/service/activity.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ProjectMemberService } from 'src/project-member/service/project-member.service';

@Injectable()
export class MilestoneService {
  constructor(
    private readonly milestoneRepository: MilestoneRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly projectMemberService: ProjectMemberService,
  ) {}

  @Transactional()
  async create(request: MilestoneRequest, userId: string) {
    await this.projectMemberService.validateProjectMember(
      request.projectId,
      userId,
    );

    const milestone = await this.milestoneRepository.create(
      MilestoneRequest.toModel(request),
    );

    const prefix = milestone.project ? `[${milestone.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'MILESTONE_CREATE',
      description: `${prefix} 마일스톤 '${milestone.title}'을(를) 생성했습니다.`,
      workspaceId: milestone.workspaceId,
      projectId: milestone.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('milestone.created', {
      workspaceId: milestone.workspaceId,
      projectId: milestone.projectId,
      milestone,
    });

    return milestone;
  }

  async findAllByProjectId(projectId: string) {
    const milestones =
      await this.milestoneRepository.findAllByProjectId(projectId);

    return milestones.map((milestone) => {
      const totalEpics = milestone.epics.length;
      const progress =
        totalEpics > 0
          ? Math.round(
              milestone.epics.reduce((sum, e) => sum + e.progress, 0) /
                totalEpics,
            )
          : 0;

      return {
        ...milestone,
        progress,
        epicCount: totalEpics,
      };
    });
  }

  async findById(id: string) {
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone) throw new NotFoundException('Milestone not found');

    const totalEpics = milestone.epics.length;
    const progress =
      totalEpics > 0
        ? Math.round(
            milestone.epics.reduce((sum, e) => sum + e.progress, 0) / totalEpics,
          )
        : 0;

    return {
      ...milestone,
      progress,
      epicCount: totalEpics,
    };
  }

  @Transactional()
  async update(id: string, userId: string, request: UpdateMilestoneRequest) {
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone) throw new NotFoundException('Milestone not found');

    const updatedMilestone = await this.milestoneRepository.update(id, {
      title: request.title,
      description: request.description,
      dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
      completed: request.completed,
    });

    const prefix = updatedMilestone.project
      ? `[${updatedMilestone.project.name}] `
      : '';

    await this.activityService.createActivity({
      action: 'MILESTONE_UPDATE',
      description: `${prefix}마일스톤 '${updatedMilestone.title}'을(를) 수정했습니다.`,
      workspaceId: updatedMilestone.workspaceId,
      projectId: updatedMilestone.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('milestone.updated', {
      workspaceId: updatedMilestone.workspaceId,
      projectId: updatedMilestone.projectId,
      milestone: updatedMilestone,
    });

    return updatedMilestone;
  }

  @Transactional()
  async delete(id: string, userId: string) {
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone) throw new NotFoundException('Milestone not found');

    const deletedMilestone = await this.milestoneRepository.delete(id);

    const prefix = milestone.project ? `[${milestone.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'MILESTONE_DELETE',
      description: `${prefix}마일스톤 '${milestone.title}'을(를) 삭제했습니다.`,
      workspaceId: milestone.workspaceId,
      projectId: milestone.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('milestone.deleted', {
      workspaceId: milestone.workspaceId,
      projectId: milestone.projectId,
      milestoneId: id,
    });

    return deletedMilestone;
  }

  @OnEvent(['task.created', 'task.updated', 'task.deleted', 'task.reordered'])
  async handleTaskEvent(payload: any) {
    const { projectId } = payload;
    if (!projectId) return;

    try {
      const milestones = await this.findAllByProjectId(projectId);
      for (const milestone of milestones) {
        await this.eventEmitter.emitAsync('milestone.updated', {
          workspaceId: milestone.workspaceId,
          projectId: milestone.projectId,
          milestone,
        });
      }
    } catch (error) {}
  }
}
