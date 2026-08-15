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
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ROLE_TYPES } from '../common/guards/role-modules';
import {
  createCompanySchema,
  updateCompanySchema,
  CreateCompanyInput,
  UpdateCompanyInput,
} from './company.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('companies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('master')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  @Roles(...ROLE_TYPES)
  async findMe(@Request() req: any) {
    const companyId = req.user?.companyId;
    if (companyId == null) return null;
    return this.companyService.findById(companyId);
  }

  @Patch('me')
  @Roles('master', 'admin')
  async updateMe(
    @Request() req: any,
    @Body(new ZodValidationPipe(updateCompanySchema)) dto: UpdateCompanyInput,
  ) {
    const companyId = req.user?.companyId;
    if (companyId == null) {
      throw new NotFoundException('Usuário não vinculado a uma empresa');
    }
    return this.companyService.update(companyId, dto);
  }

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
