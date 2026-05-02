import { Injectable } from '@nestjs/common';
import { WorkspaceRequest } from '../request/workspace.request';
import { WorkspaceRepository } from '../repository/workspace.repository';
import { WorkspaceResponse } from '../response/workspace.response';
import { WorkspaceWithImage } from 'src/global/types';
import { ImageService } from 'src/image/service/image.service';
import { ImageRequest } from 'src/image/request/image.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ImageResponse } from 'src/image/response/image.response';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly imageService: ImageService,
  ) {}

  @Transactional()
  async createWorkspace(
    request: WorkspaceRequest,
    userId: string,
  ): Promise<WorkspaceResponse> {
    const newWorkspace: WorkspaceWithImage =
      await this.workspaceRepository.create(
        WorkspaceRequest.toModel(request, userId),
      );

    let image: ImageResponse[] = [];
    if (request.image?.trim()) {
      const imageRequest: ImageRequest = {
        id: newWorkspace.id,
        existingImages: [],
        urls: [request.image],
        entity: 'workspace',
      };
      image = await this.imageService.createImages(imageRequest);
    }

    const response: WorkspaceResponse = WorkspaceResponse.fromModel(
      newWorkspace,
      image[0]?.url,
    );
    return response;
  }

  async findAllByUserId(id: string): Promise<WorkspaceResponse[]> {
    const workspaces: WorkspaceWithImage[] =
      await this.workspaceRepository.findAllByUserId(id);
    const response = workspaces.map((workspace) =>
      WorkspaceResponse.fromModel(workspace, workspace.image?.url ?? undefined),
    );
    return response;
  }
}
