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
import { FinanceCategoriesService } from './finance-categories.service';
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './schemas/finance.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('finance/categories')
export class FinanceCategoriesController {
  constructor(private readonly financeCategoriesService: FinanceCategoriesService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategoryInput) {
    return this.financeCategoriesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.financeCategoriesService.findAll({ page, limit, sortBy, sortOrder, search });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.financeCategoriesService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCategorySchema)) dto: UpdateCategoryInput,
  ) {
    return this.financeCategoriesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.financeCategoriesService.delete(id);
    return { message: 'Categoria excluída com sucesso' };
  }
}
