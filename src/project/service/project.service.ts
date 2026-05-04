import { Injectable } from '@nestjs/common';
import { ProjectRequest } from '../request/project.request';
import { ProjectRepository } from '../repository/project.repository';
import { ProjectWithImage } from 'src/global/types';
import { ImageResponse } from 'src/image/response/image.response';
import { ImageRequest } from 'src/image/request/image.request';
import { ImageService } from 'src/image/service/image.service';
import { ProjectResponse } from '../response/project.response';
import { ProjectMemberService } from 'src/project-member/service/project-member.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMemberService: ProjectMemberService,
    private readonly imageService: ImageService,
  ) {}

  async createProject(
    request: ProjectRequest,
    userId: string,
  ): Promise<ProjectResponse> {
    const newProject: ProjectWithImage = await this.projectRepository.create(
      ProjectRequest.toModel(request),
    );

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

    const response: ProjectResponse = ProjectResponse.fromModel(
      newProject,
      image[0]?.url,
    );
    return response;
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<ProjectResponse[]> {
    const projects: ProjectWithImage[] =
      await this.projectRepository.findAllByWorkspaceId(workspaceId);
    const response: ProjectResponse[] = projects.map((project) =>
      ProjectResponse.fromModel(project, project.image?.url ?? undefined),
    );
    return response;
  }
}
