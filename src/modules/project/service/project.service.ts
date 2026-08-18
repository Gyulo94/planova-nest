import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectRepository } from '../repository/project.repository';
import { ProjectMemberService } from 'src/modules/project-member/service/project-member.service';
import { ImageService } from 'src/modules/image/service/image.service';
import { LabelService } from 'src/modules/label/service/label.service';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { ProjectRequest } from '../request/project.request';
import { ProjectResponse } from '../response/project.response';
import { ApiException, ErrorCode, ProjectWithImage } from 'src/global';
import { ImageResponse } from 'src/modules/image/response/image.response';
import { ImageRequest } from 'src/modules/image/request/image.request';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMemberService: ProjectMemberService,
    private readonly imageService: ImageService,
    private readonly labelService: LabelService,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createProject(
    request: ProjectRequest,
    userId: string,
  ): Promise<ProjectResponse> {
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

  async findProjects(
    workspaceId: string,
    userId: string,
  ): Promise<ProjectResponse[]> {
    const myProjects =
      await this.projectRepository.findProjectsByUserIdAndWorkspaceId(
        userId,
        workspaceId,
      );
    const response = myProjects.map((project) =>
      ProjectResponse.fromModel(project),
    );
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
