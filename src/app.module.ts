import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalModule } from './global/global.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ImageModule } from './modules/image/image.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { ProjectMemberModule } from './modules/project-member/project-member.module';
import { WorkspaceMemberModule } from './modules/workspace-member/workspace-member.module';
import { LabelModule } from './modules/label/label.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SubtaskModule } from './modules/subtask/subtask.module';
import { CommentModule } from './modules/comment/comment.module';
import { EpicModule } from './modules/epic/epic.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { IdeaModule } from './modules/idea/idea.module';
import { AuthGuard, RequestMiddleware } from './global';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    UserModule,
    WorkspaceModule,
    ImageModule,
    ProjectModule,
    TaskModule,
    WorkspaceMemberModule,
    ProjectMemberModule,
    LabelModule,
    ActivityModule,
    BetterAuthModule.forRootAsync({
      imports: [AuthModule],
      useFactory: (auth) => ({ auth }),
      inject: ['BETTER_AUTH'],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    SubtaskModule,
    CommentModule,
    EpicModule,
    MilestoneModule,
    IdeaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
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
