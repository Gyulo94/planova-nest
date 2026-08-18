import { Module } from '@nestjs/common';
import { LabelModule } from 'src/modules/label/label.module';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.repository';
import { TaskController } from './controller/task.controller';
import { TaskGateway } from './gateway/task.gateway';
import { ProjectMemberModule } from 'src/modules/project-member/project-member.module';
import { ImageModule } from 'src/modules/image/image.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { EpicModule } from 'src/modules/epic/epic.module';

@Module({
  imports: [
    LabelModule,
    ProjectMemberModule,
    ImageModule,
    ActivityModule,
    EpicModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, TaskGateway],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
