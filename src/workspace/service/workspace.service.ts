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
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';

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

  async findWorkspaceById(id: string): Promise<WorkspaceResponse> {
    const workspace: WorkspaceWithImage | null =
      await this.workspaceRepository.findWorkspaceById(id);
    if (!workspace) {
      throw new ApiException(ErrorCode.WORKSPACE_NOT_FOUND);
    }
    const response: WorkspaceResponse = WorkspaceResponse.fromModel(workspace);
    return response;
  }

  async updateWorkspace(
    workspaceId: string,
    request: WorkspaceRequest,
    userId: string,
  ): Promise<WorkspaceResponse> {
    await this.workspaceMemberService.validateWorkspaceAdminOrOwner(
      workspaceId,
      userId,
    );
    const workspace: WorkspaceWithImage | null =
      await this.workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw new ApiException(ErrorCode.WORKSPACE_NOT_FOUND);
    }
    let image: ImageResponse[] = [];
    if (request.image !== workspace.image?.url) {
      const imageRequest: ImageRequest = {
        id: workspaceId,
        existingImages: workspace.image ? [workspace.image.id] : [],
        urls: request.image ? [request.image] : [],
        entity: 'workspace',
      };
      image = await this.imageService.updateImages(imageRequest);
    }

    const newWorkspace = await this.workspaceRepository.update(
      WorkspaceRequest.toModel(request, userId),
      workspaceId,
    );
    const response: WorkspaceResponse =
      WorkspaceResponse.fromModel(newWorkspace);
    return response;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    await this.workspaceMemberService.validateWorkspaceAdminOrOwner(
      workspaceId,
      userId,
    );
    const workspace: WorkspaceWithImage | null =
      await this.workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw new ApiException(ErrorCode.WORKSPACE_NOT_FOUND);
    }
    const myWorkspaces =
      await this.workspaceMemberService.findMyOwnWorkspaces(userId);
    if (myWorkspaces.length === 1) {
      throw new ApiException(ErrorCode.CAN_NOT_DELETE_ONLY_MY_OWN_WORKSPACE);
    }

    const isDeleted = await this.workspaceRepository.delete(workspaceId);

    if (isDeleted && workspace.image) {
      await this.imageService.deleteImages([workspaceId], 'workspace');
    }
  }

  async resetInviteCode(workspaceId: string, userId: string): Promise<void> {
    await this.workspaceMemberService.validateWorkspaceAdminOrOwner(
      workspaceId,
      userId,
    );
    const workspace: WorkspaceWithImage | null =
      await this.workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw new ApiException(ErrorCode.WORKSPACE_NOT_FOUND);
    }
    const newInviteCode = generateInviteCode(8);
    await this.workspaceRepository.resetInviteCode(workspaceId, newInviteCode);
  }
}
