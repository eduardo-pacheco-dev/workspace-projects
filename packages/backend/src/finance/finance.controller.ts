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
import { FinanceService } from './finance.service';
import {
  createFinanceEntrySchema,
  updateFinanceEntrySchema,
  CreateFinanceEntryInput,
  UpdateFinanceEntryInput,
} from './schemas/finance.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('finance/entries')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createFinanceEntrySchema)) dto: CreateFinanceEntryInput) {
    return this.financeService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.financeService.findAll({ page, limit, sortBy, sortOrder, search, type, status, category, month, year });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateFinanceEntrySchema)) dto: UpdateFinanceEntryInput,
  ) {
    return this.financeService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.financeService.delete(id);
    return { message: 'Entry deleted successfully' };
  }
}
