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
import { ServiceOrdersService } from './service-orders.service';
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
} from './schemas/service-order.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createServiceOrderSchema)) dto: CreateServiceOrderInput) {
    return this.serviceOrdersService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.serviceOrdersService.findAll({ page, limit, sortBy, sortOrder, search, status });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrdersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateServiceOrderSchema)) dto: UpdateServiceOrderInput,
  ) {
    return this.serviceOrdersService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.serviceOrdersService.delete(id);
    return { message: 'Ordem de serviço excluída com sucesso' };
  }
}
