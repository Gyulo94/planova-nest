import { Injectable } from '@nestjs/common';
import { WorkspaceRequest } from '../request/workspace.request';
import { WorkspaceRepository } from '../repository/workspace.repository';
import { WorkspaceResponse } from '../response/workspace.response';
import { WorkspaceWithImage } from 'src/global/types';
import { ImageService } from 'src/image/service/image.service';
import { ImageRequest } from 'src/image/request/image.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ImageResponse } from 'src/image/response/image.response';
import { WorkspaceMemberService } from 'src/workspace-member/service/workspace-member.service';
import { generateInviteCode } from 'src/global/utils';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly imageService: ImageService,
  ) {}

  @Transactional()
  async createWorkspace(
    request: WorkspaceRequest,
    userId: string,
  ): Promise<WorkspaceResponse> {
    const inviteCode: string = generateInviteCode(8);
    const newWorkspace: WorkspaceWithImage =
      await this.workspaceRepository.create(
        WorkspaceRequest.toModel(request, userId, inviteCode),
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

    await this.workspaceMemberService.createWorkspaceMember(
      newWorkspace.id,
      userId,
    );
    const response: WorkspaceResponse =
      WorkspaceResponse.fromModel(newWorkspace);
    return response;
  }
}
