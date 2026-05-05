import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMemberService: ProjectMemberService,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly imageService: ImageService,
    private readonly labelService: LabelService,
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

    const response: ProjectResponse = ProjectResponse.fromModel(newProject);
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
    await this.projectRepository.update(
      projectId,
      ProjectRequest.toModel(request),
    );
    const updatedProject: ProjectWithImage | null =
      await this.projectRepository.findProjectById(projectId);
    if (!updatedProject) {
      throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
    }
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

    if (isDeleted && project.image) {
      await this.imageService.deleteImages([projectId], 'project');
    }
  }
}
