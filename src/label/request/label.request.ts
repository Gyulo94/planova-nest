import { IsString } from 'class-validator';

export class LabelRequest {
  @IsString()
  name: string;

  @IsString()
  projectId: string;

  static toModel(
    request: LabelRequest,
    palette: { bgColor: string; textColor: string },
  ) {
    return {
      name: request.name.trim(),
      bgColor: palette.bgColor,
      textColor: palette.textColor,
      project: {
        connect: { id: request.projectId },
      },
    };
  }
}
