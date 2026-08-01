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
import { FinanceLimitsService } from './finance-limits.service';
import {
  createSpendingLimitSchema,
  updateSpendingLimitSchema,
  CreateSpendingLimitInput,
  UpdateSpendingLimitInput,
} from './schemas/finance.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('finance/limits')
export class FinanceLimitsController {
  constructor(private readonly financeLimitsService: FinanceLimitsService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createSpendingLimitSchema)) dto: CreateSpendingLimitInput) {
    return this.financeLimitsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.financeLimitsService.findAll({ page, limit, sortBy, sortOrder, search, month, year });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.financeLimitsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateSpendingLimitSchema)) dto: UpdateSpendingLimitInput,
  ) {
    return this.financeLimitsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.financeLimitsService.delete(id);
    return { message: 'Limite de gasto excluído com sucesso' };
  }
}
