import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectRequest } from '../request/project.request';
import { ProjectRepository } from '../repository/project.repository';
import { ProjectWithImage } from 'src/global/types';
import { ImageResponse } from 'src/image/response/image.response';
import { ImageRequest } from 'src/image/request/image.request';
import { ImageService } from 'src/image/service/image.service';
import { ProjectResponse } from '../response/project.response';
import { ProjectMemberService } from 'src/project-member/service/project-member.service';
import { WorkspaceMemberService } from 'src/workspace-member/service/workspace-member.service';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { LabelService } from 'src/label/service/label.service';
import { ActivityService } from 'src/activity/service/activity.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMemberService: ProjectMemberService,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly imageService: ImageService,
    private readonly labelService: LabelService,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createProject(
    request: ProjectRequest,
    userId: string,
  ): Promise<ProjectResponse> {
    await this.workspaceMemberService.validateWorkspaceAdminOrOwner(
      request.workspaceId,
      userId,
    );
    const newProject: ProjectWithImage = await this.projectRepository.create(
      ProjectRequest.toModel(request),
    );

    await this.labelService.createDefaultLabels(newProject.id);

    let image: ImageResponse[] = [];
    if (request.image?.trim()) {
      const imageRequest: ImageRequest = {
        id: newProject.id,
        existingImages: [],
        urls: [request.image],
        entity: 'project',
      };
      image = await this.imageService.createImages(imageRequest);
    }

    await this.projectMemberService.createProjectMember(newProject.id, userId);

    await this.activityService.createActivity({
      action: 'PROJECT_CREATE',
      description: `프로젝트 '${newProject.name}'을(를) 생성했습니다.`,
      workspaceId: request.workspaceId,
      projectId: newProject.id,
      userId,
    });

    const response: ProjectResponse = ProjectResponse.fromModel(newProject);

    this.eventEmitter.emit('project.created', {
      workspaceId: request.workspaceId,
      project: response,
    });

    return response;
  }

  async findProjectById(projectId: string): Promise<ProjectResponse> {
    const project: ProjectWithImage | null =
      await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
    }
    const response: ProjectResponse = ProjectResponse.fromModel(project);
    return response;
  }

  async findLabelsByProjectId(projectId: string) {
    return this.labelService.findLabelsByProjectId(projectId);
  }

  async updateProject(
    projectId: string,
    request: ProjectRequest,
    userId: string,
  ): Promise<ProjectResponse> {
    await this.projectMemberService.validateProjectOwner(projectId, userId);
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
    }

    if (request.image !== project.image?.url) {
      if (!request.image && project.image) {
        await this.imageService.deleteImages([projectId], 'project');
      } else {
        const imageRequest: ImageRequest = {
          id: projectId,
          existingImages: [],
          urls: request.image ? [request.image] : [],
          entity: 'project',
        };
        await this.imageService.updateImages(imageRequest);
      }
    }

    await this.projectRepository.update(
      projectId,
      ProjectRequest.toModel(request),
    );

    const updatedProject: ProjectWithImage | null =
      await this.projectRepository.findProjectById(projectId);
    if (!updatedProject) {
      throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
    }

    await this.activityService.createActivity({
      action: 'PROJECT_UPDATE',
      description: `프로젝트 정보를 수정했습니다.`,
      workspaceId: updatedProject.workspaceId,
      projectId,
      userId,
    });

    const response: ProjectResponse = ProjectResponse.fromModel(updatedProject);
    return response;
  }

  async deleteProject(projectId: string, userId: string) {
    await this.projectMemberService.validateProjectOwner(projectId, userId);
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
    }
    const isDeleted = await this.projectRepository.delete(projectId);

    if (isDeleted) {
      await this.activityService.createActivity({
        action: 'PROJECT_DELETE',
        description: `프로젝트 '${project.name}'을(를) 삭제했습니다.`,
        workspaceId: project.workspaceId,
        userId,
      });

      if (project.image) {
        await this.imageService.deleteImages([projectId], 'project');
      }
    }
  }

  async getTaskStatusCounts(projectId: string) {
    return this.projectRepository.getTaskStatusCounts(projectId);
  }
}
