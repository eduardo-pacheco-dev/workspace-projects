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
import { ScheduleService } from './schedule.service';
import {
  createScheduleEventSchema,
  updateScheduleEventSchema,
  CreateScheduleEventInput,
  UpdateScheduleEventInput,
} from './schedule-event.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createScheduleEventSchema)) dto: CreateScheduleEventInput) {
    return this.scheduleService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.scheduleService.findAll({ page, limit, sortBy, sortOrder, search, status, from, to });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateScheduleEventSchema)) dto: UpdateScheduleEventInput,
  ) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleService.delete(id);
    return { message: 'Agendamento excluído com sucesso' };
  }
}
