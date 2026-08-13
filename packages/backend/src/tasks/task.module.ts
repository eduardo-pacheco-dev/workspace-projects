import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TASK_REPOSITORY } from './domain/task.repository';
import { TaskEntity } from './infrastructure/task.entity';
import { TypeOrmTaskRepository } from './infrastructure/typeorm-task.repository';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  providers: [
    TaskService,
    { provide: TASK_REPOSITORY, useClass: TypeOrmTaskRepository },
  ],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TasksModule {}
