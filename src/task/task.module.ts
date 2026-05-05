import { Module } from '@nestjs/common';
import { LabelModule } from 'src/label/label.module';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.repository';
import { TaskController } from './controller/task.controller';
import { TaskGateway } from './gateway/task.gateway';
import { ProjectMemberModule } from 'src/project-member/project-member.module';

@Module({
  imports: [LabelModule, ProjectMemberModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, TaskGateway],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
