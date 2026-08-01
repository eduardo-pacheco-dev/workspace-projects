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
import { BankAccountsService } from './bank-accounts.service';
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from './schemas/finance.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('finance/accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createBankAccountSchema)) dto: CreateBankAccountInput) {
    return this.bankAccountsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.bankAccountsService.findAll({ page, limit, sortBy, sortOrder, search });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.bankAccountsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateBankAccountSchema)) dto: UpdateBankAccountInput,
  ) {
    return this.bankAccountsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.bankAccountsService.delete(id);
    return { message: 'Conta excluída com sucesso' };
  }
}
