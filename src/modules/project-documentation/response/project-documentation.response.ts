export class ProjectDocumentationVersionResponse {
  id: string;
  version: number;
  title: string;
  content: string;
  sourceSummary: unknown;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };

  static fromModel(
    model: DocumentationVersionPayload,
  ): ProjectDocumentationVersionResponse {
    return {
      id: model.id,
      version: model.version,
      title: model.title,
      content: model.content,
      sourceSummary: model.sourceSummary ?? null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      createdBy: {
        id: model.createdBy.id,
        name: model.createdBy.name,
        email: model.createdBy.email,
        image: model.createdBy.image,
      },
    };
  }
}

export class ProjectDocumentationResponse {
  id: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  currentVersion: ProjectDocumentationVersionResponse;
  versions: ProjectDocumentationVersionResponse[];

  static fromModel(
    model: ProjectDocumentationPayload,
  ): ProjectDocumentationResponse {
    const versions = model.versions.map((version) =>
      ProjectDocumentationVersionResponse.fromModel(version),
    );
    return {
      id: model.id,
      projectId: model.projectId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      currentVersion: versions[0],
      versions,
    };
  }
}
import type { ProjectDocumentationPayload } from '../repository/project-documentation.repository';

type DocumentationVersionPayload =
  ProjectDocumentationPayload['versions'][number];
