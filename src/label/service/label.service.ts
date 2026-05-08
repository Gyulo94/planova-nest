import { Injectable } from '@nestjs/common';
import { LabelRepository } from '../repository/label.repository';
import { LabelRequest } from '../request/label.request';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LabelService {
  constructor(
    private readonly labelRepository: LabelRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private generateRandomPastelColor() {
    // 0~360도 색조 무작위 추출
    const hue = Math.floor(Math.random() * 360);
    // 채도 60%~90% 사이에서 무작위
    const saturation = Math.floor(Math.random() * 30) + 60;
    // 밝기 85%~95% 사이에서 무작위 (부드러운 파스텔톤)
    const lightness = Math.floor(Math.random() * 10) + 85;

    const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    // 텍스트 가독성을 위해 채도는 높이고 밝기는 확 낮춤
    const textColor = `hsl(${hue}, ${saturation + 10}%, 30%)`;

    return { bgColor, textColor };
  }

  async createLabel(request: LabelRequest) {
    const palette = this.generateRandomPastelColor();
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
