import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalModule } from './global/global.module';
import { RequestMiddleware } from './global/middlewares/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { WorkspaceModule } from './workspace/workspace.module';
import { ImageModule } from './image/image.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ProjectMemberModule } from './project-member/project-member.module';
import { WorkspaceMemberModule } from './workspace-member/workspace-member.module';
import { LabelModule } from './label/label.module';
import { ActivityModule } from './activity/activity.module';
import { SubtaskModule } from './subtask/subtask.module';
import { CommentModule } from './comment/comment.module';
import { EpicModule } from './epic/epic.module';
import { MilestoneModule } from './milestone/milestone.module';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    UserModule,
    EmailModule,
    WorkspaceModule,
    ImageModule,
    ProjectModule,
    TaskModule,
    WorkspaceMemberModule,
    ProjectMemberModule,
    LabelModule,
    ActivityModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    SubtaskModule,
    CommentModule,
    EpicModule,
    MilestoneModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
