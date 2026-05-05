import { Injectable } from '@nestjs/common';
import { LabelRepository } from '../repository/label.repository';

@Injectable()
export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async createDefaultLabels(projectId: string) {
    return this.labelRepository.createMany(projectId);
  }

  async findLabelsByProjectId(projectId: string) {
    return this.labelRepository.findByProjectId(projectId);
  }
}
