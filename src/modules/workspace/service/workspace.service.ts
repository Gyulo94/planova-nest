import { Injectable } from '@nestjs/common';
import { WorkspaceRequest } from '../request/workspace.request';
import { WorkspaceRepository } from '../repository/workspace.repository';
import { WorkspaceResponse } from '../response/workspace.response';
import { WorkspaceWithImage } from 'src/global/types';
import { ImageService } from 'src/modules/image/service/image.service';
import { ImageRequest } from 'src/modules/image/request/image.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ImageResponse } from 'src/modules/image/response/image.response';
import { WorkspaceMemberService } from 'src/modules/workspace-member/service/workspace-member.service';
import { generateInviteCode } from 'src/global/utils';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { ActivityService } from 'src/modules/activity/service/activity.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly imageService: ImageService,
    private readonly activityService: ActivityService,
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

    await this.activityService.createActivity({
      action: 'WORKSPACE_CREATE',
      description: `워크스페이스 '${newWorkspace.name}'을(를) 생성했습니다.`,
      workspaceId: newWorkspace.id,
      userId,
    });

    const response: WorkspaceResponse =
      WorkspaceResponse.fromModel(newWorkspace);
    return response;
  }

  async findWorkspacesByUserId(userId: string) {
    const workspaces =
      await this.workspaceRepository.findWorkspacesByUserId(userId);

    const response: WorkspaceResponse[] = workspaces.map((workspace) =>
      WorkspaceResponse.fromModel(workspace),
    );
    return response;
  }
  async findWorkspaceById(workspaceId: string): Promise<WorkspaceResponse> {
    const workspace: WorkspaceWithImage | null =
      await this.workspaceRepository.findWorkspaceById(workspaceId);
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
      if (!request.image && workspace.image) {
        await this.imageService.deleteImages([workspaceId], 'workspace');
      } else {
        const imageRequest: ImageRequest = {
          id: workspaceId,
          existingImages: [],
          urls: request.image ? [request.image] : [],
          entity: 'workspace',
        };
        image = await this.imageService.updateImages(imageRequest);
      }
    }

    const newWorkspace = await this.workspaceRepository.update(
      WorkspaceRequest.toModel(request, userId),
      workspaceId,
    );

    await this.activityService.createActivity({
      action: 'WORKSPACE_UPDATE',
      description: `워크스페이스 정보를 수정했습니다.`,
      workspaceId,
      userId,
    });

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

    if (isDeleted) {
      await this.activityService.createActivity({
        action: 'WORKSPACE_DELETE',
        description: `워크스페이스 '${workspace.name}'을(를) 삭제했습니다.`,
        userId,
      });

      if (workspace.image) {
        await this.imageService.deleteImages([workspaceId], 'workspace');
      }
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

  async findWorkspaceStats(workspaceId: string) {
    return this.workspaceRepository.getWorkspaceStats(workspaceId);
  }
}
