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
import { CompanyService } from './company.service';
import {
  createCompanySchema,
  updateCompanySchema,
  CreateCompanyInput,
  UpdateCompanyInput,
} from './company.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createCompanySchema)) dto: CreateCompanyInput) {
    return this.companyService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.companyService.findAll({ page, limit, sortBy, sortOrder, search });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCompanySchema)) dto: UpdateCompanyInput,
  ) {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.delete(id);
    return { message: 'Empresa excluída com sucesso' };
  }
}
