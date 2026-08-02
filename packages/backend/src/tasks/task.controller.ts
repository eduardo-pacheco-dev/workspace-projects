import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  CreateTaskInput,
  UpdateTaskInput,
} from './task.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTaskInput) {
    return this.taskService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.taskService.findAll({ page, limit, sortBy, sortOrder, search, status, priority });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTaskInput,
  ) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.taskService.delete(id);
    return { message: 'Tarefa excluída com sucesso' };
  }
}
