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
import { MsProjectService } from './ms-project.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createMsProjectSchema,
  updateMsProjectSchema,
  createMsTaskSchema,
  updateMsTaskSchema,
  createMsDependencySchema,
  createMsResourceSchema,
  updateMsResourceSchema,
  createMsAssignmentSchema,
  updateMsAssignmentSchema,
  CreateMsProjectInput,
  UpdateMsProjectInput,
  CreateMsTaskInput,
  UpdateMsTaskInput,
  CreateMsDependencyInput,
  CreateMsResourceInput,
  UpdateMsResourceInput,
  CreateMsAssignmentInput,
  UpdateMsAssignmentInput,
} from './ms-project.schemas';

@Controller('ms-project')
export class MsProjectController {
  constructor(private readonly msProjectService: MsProjectService) {}

  @Post()
  async createPlan(@Body(new ZodValidationPipe(createMsProjectSchema)) dto: CreateMsProjectInput) {
    return this.msProjectService.createPlan(dto);
  }

  @Get()
  async findAllPlans(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.msProjectService.findAllPlans({ page, limit, sortBy, sortOrder, search, status });
  }

  @Get(':id')
  async findPlanDetail(@Param('id', ParseIntPipe) id: number) {
    return this.msProjectService.findPlanDetail(id);
  }

  @Patch(':id')
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateMsProjectSchema)) dto: UpdateMsProjectInput,
  ) {
    return this.msProjectService.updatePlan(id, dto);
  }

  @Delete(':id')
  async deletePlan(@Param('id', ParseIntPipe) id: number) {
    await this.msProjectService.deletePlan(id);
    return { message: 'Plano de projeto excluído com sucesso' };
  }

  @Post(':projectId/schedule')
  async recompute(@Param('projectId', ParseIntPipe) projectId: number) {
    await this.msProjectService.recomputeSchedule(projectId);
    return this.msProjectService.findPlanDetail(projectId);
  }

  @Post(':projectId/tasks')
  async addTask(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new ZodValidationPipe(createMsTaskSchema)) dto: CreateMsTaskInput,
  ) {
    return this.msProjectService.addTask(projectId, dto);
  }

  @Patch('tasks/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateMsTaskSchema)) dto: UpdateMsTaskInput,
  ) {
    return this.msProjectService.updateTask(id, dto);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    await this.msProjectService.deleteTask(id);
    return { message: 'Tarefa excluída com sucesso' };
  }

  @Post(':projectId/dependencies')
  async addDependency(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new ZodValidationPipe(createMsDependencySchema)) dto: CreateMsDependencyInput,
  ) {
    return this.msProjectService.addDependency(projectId, dto);
  }

  @Delete('dependencies/:id')
  async deleteDependency(@Param('id', ParseIntPipe) id: number) {
    await this.msProjectService.deleteDependency(id);
    return { message: 'Dependência excluída com sucesso' };
  }

  @Post(':projectId/resources')
  async addResource(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new ZodValidationPipe(createMsResourceSchema)) dto: CreateMsResourceInput,
  ) {
    return this.msProjectService.addResource(projectId, dto);
  }

  @Patch('resources/:id')
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateMsResourceSchema)) dto: UpdateMsResourceInput,
  ) {
    return this.msProjectService.updateResource(id, dto);
  }

  @Delete('resources/:id')
  async deleteResource(@Param('id', ParseIntPipe) id: number) {
    await this.msProjectService.deleteResource(id);
    return { message: 'Recurso excluído com sucesso' };
  }

  @Post(':projectId/assignments')
  async addAssignment(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new ZodValidationPipe(createMsAssignmentSchema)) dto: CreateMsAssignmentInput,
  ) {
    return this.msProjectService.addAssignment(projectId, dto);
  }

  @Patch('assignments/:id')
  async updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateMsAssignmentSchema)) dto: UpdateMsAssignmentInput,
  ) {
    return this.msProjectService.updateAssignment(id, dto);
  }

  @Delete('assignments/:id')
  async deleteAssignment(@Param('id', ParseIntPipe) id: number) {
    await this.msProjectService.deleteAssignment(id);
    return { message: 'Atribuição excluída com sucesso' };
  }
}
