import { Injectable } from '@nestjs/common';
import { WorkspaceRequest } from '../request/workspace.request';
import { WorkspaceRepository } from '../repository/workspace.repository';
import { WorkspaceResponse } from '../response/workspace.response';
import { WorkspaceWithImage } from 'src/global/types';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async createWorkspace(
    request: WorkspaceRequest,
    userId: string,
  ): Promise<WorkspaceResponse> {
    const newWorkspace: WorkspaceWithImage =
      await this.workspaceRepository.create(
        WorkspaceRequest.toModel(request, userId),
      );
    const response: WorkspaceResponse =
      WorkspaceResponse.fromModel(newWorkspace);
    return response;
  }
}
