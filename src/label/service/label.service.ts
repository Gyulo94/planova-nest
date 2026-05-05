import { Injectable } from '@nestjs/common';
import { DEFAULT_TASK_LABELS } from 'src/global/constants';
import { LabelRepository } from '../repository/label.repository';
import { LabelRequest } from '../request/label.request';

@Injectable()
export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async createLabel(request: LabelRequest) {
    const projectLabels = await this.labelRepository.findByProjectId(
      request.projectId,
    );
    const palette =
      DEFAULT_TASK_LABELS[projectLabels.length % DEFAULT_TASK_LABELS.length];

    return this.labelRepository.create(LabelRequest.toModel(request, palette));
  }

  async createDefaultLabels(projectId: string) {
    return this.labelRepository.createMany(projectId);
  }

  async findLabelsByProjectId(projectId: string) {
    return this.labelRepository.findByProjectId(projectId);
  }

  async resolveLabelId(projectId: string, labelName?: string) {
    const normalizedLabelName = labelName?.trim();

    if (!normalizedLabelName) {
      return undefined;
    }

    const existingLabel = await this.labelRepository.findByProjectIdAndName(
      projectId,
      normalizedLabelName,
    );

    if (existingLabel) {
      return existingLabel.id;
    }

    const createdLabel = await this.createLabel({
      name: normalizedLabelName,
      projectId,
    });

    return createdLabel.id;
  }
}
