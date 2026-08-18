import { Injectable } from '@nestjs/common';
import { LabelRepository } from '../repository/label.repository';
import { LabelRequest } from '../request/label.request';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateRandomPastelColor } from 'src/global';
@Injectable()
export class LabelService {
  constructor(
    private readonly labelRepository: LabelRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createLabel(request: LabelRequest) {
    const palette = generateRandomPastelColor();
    const label = await this.labelRepository.create(
      LabelRequest.toModel(request, palette),
    );

    this.eventEmitter.emit('label.created', {
      projectId: label.projectId,
      label,
    });

    return label;
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
