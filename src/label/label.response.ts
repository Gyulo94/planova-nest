import { Label } from '@prisma/client';

export class LabelResponse {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;

  static fromModel(model: Label): LabelResponse;
  static fromModel(model: any): LabelResponse {
    const response = new LabelResponse();
    response.id = model.id;
    response.name = model.name;
    response.bgColor = model.bgColor;
    response.textColor = model.textColor;
    return response;
  }
}
