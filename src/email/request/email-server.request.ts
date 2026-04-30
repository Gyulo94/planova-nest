import { IsNotEmpty, IsString } from 'class-validator';

export class EmailServerRequest {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  clientUrl: string;

  @IsString()
  @IsNotEmpty()
  logo: string;

  @IsString()
  @IsNotEmpty()
  senderEmail: string;

  @IsString()
  @IsNotEmpty()
  senderPwd: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  type: 'register' | 'reset';

  static toModel(request: EmailServerRequest) {
    return {
      serviceName: request.serviceName,
      clientUrl: request.clientUrl,
      logo: request.logo,
      senderEmail: request.senderEmail,
      senderPwd: request.senderPwd,
      email: request.email,
      type: request.type,
    };
  }
}
