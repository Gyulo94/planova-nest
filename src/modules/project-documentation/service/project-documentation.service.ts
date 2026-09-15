import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiException, ErrorCode, Transactional } from 'src/global';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { ProjectDocumentationRepository } from '../repository/project-documentation.repository';
import { UpdateProjectDocumentationRequest } from '../request/update-project-documentation.request';
import { ProjectDocumentationResponse } from '../response/project-documentation.response';
import { generateProjectDocumentation } from './project-documentation.generator';

@Injectable()
export class ProjectDocumentationService {
  constructor(
    private readonly repository: ProjectDocumentationRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByProjectId(projectId: string) {
    const documentation = await this.repository.findByProjectId(projectId);
    return documentation
      ? ProjectDocumentationResponse.fromModel(documentation)
      : null;
  }

  @Transactional()
  async generate(projectId: string, userId: string) {
    const [project, existing] = await Promise.all([
      this.repository.findGenerationSource(projectId),
      this.repository.findByProjectId(projectId),
    ]);
    if (!project) throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);

    const generated = generateProjectDocumentation(project);
    const documentation = existing
      ? await this.repository.createVersion(existing.id, userId, generated)
      : await this.repository.createDocumentation(projectId, userId, generated);
    const action = existing
      ? 'DOCUMENTATION_REGENERATE'
      : 'DOCUMENTATION_GENERATE';
    await this.recordActivity(
      action,
      existing
        ? '프로젝트 문서를 새 버전으로 재생성했습니다.'
        : '프로젝트 문서를 생성했습니다.',
      project,
      userId,
    );
    return ProjectDocumentationResponse.fromModel(documentation);
  }

  @Transactional()
  async update(
    projectId: string,
    versionId: string,
    userId: string,
    request: UpdateProjectDocumentationRequest,
  ) {
    this.ensureContent(request.title, '문서 제목');
    this.ensureContent(request.content, '문서 내용');
    const documentation = await this.getDocumentation(projectId);
    const current = documentation.versions[0];
    if (current.id !== versionId) {
      throw new ApiException(ErrorCode.DOCUMENT_VERSION_NOT_CURRENT);
    }
    const updated = await this.repository.updateVersion(
      versionId,
      request.title.trim(),
      request.content,
    );
    await this.recordActivity(
      'DOCUMENTATION_UPDATE',
      '프로젝트 문서를 수정했습니다.',
      documentation.project,
      userId,
    );
    return ProjectDocumentationResponse.fromModel(updated);
  }

  @Transactional()
  async restore(projectId: string, versionId: string, userId: string) {
    const documentation = await this.getDocumentation(projectId);
    const version = await this.repository.findVersionById(versionId);
    if (!version || version.documentationId !== documentation.id) {
      throw new ApiException(ErrorCode.DOCUMENT_VERSION_NOT_FOUND);
    }
    const restored = await this.repository.createVersion(
      documentation.id,
      userId,
      {
        title: version.title,
        content: version.content,
        sourceSummary: {
          ...(typeof version.sourceSummary === 'object' &&
          version.sourceSummary !== null
            ? version.sourceSummary
            : {}),
          restoredFromVersion: version.version,
        },
      },
    );
    await this.recordActivity(
      'DOCUMENTATION_RESTORE',
      `프로젝트 문서 v${version.version}을(를) 새 버전으로 복원했습니다.`,
      documentation.project,
      userId,
    );
    return ProjectDocumentationResponse.fromModel(restored);
  }

  private async getDocumentation(projectId: string) {
    const documentation = await this.repository.findByProjectId(projectId);
    if (!documentation) {
      throw new ApiException(ErrorCode.DOCUMENTATION_NOT_FOUND);
    }
    return documentation;
  }

  private ensureContent(value: string, label: string) {
    const plain = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .trim();
    if (!plain) {
      throw new ApiException(
        ErrorCode.BAD_REQUEST,
        `${label}을(를) 입력해주세요.`,
      );
    }
  }

  private async recordActivity(
    action: string,
    description: string,
    project: { id: string; name: string; workspaceId: string },
    userId: string,
  ) {
    await this.activityService.createActivity({
      action,
      description: `[${project.name}] ${description}`,
      workspaceId: project.workspaceId,
      projectId: project.id,
      userId,
    });
    this.eventEmitter.emit('documentation.changed', {
      projectId: project.id,
    });
  }
}
