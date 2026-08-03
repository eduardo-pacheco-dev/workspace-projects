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
import { CompanyCollaboratorService } from './company-collaborator.service';
import {
  createCompanyCollaboratorSchema,
  updateCompanyCollaboratorSchema,
  CreateCompanyCollaboratorInput,
  UpdateCompanyCollaboratorInput,
} from './company.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('companies/:companyId/collaborators')
export class CompanyCollaboratorController {
  constructor(private readonly companyCollaboratorService: CompanyCollaboratorService) {}

  @Post()
  async create(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body(new ZodValidationPipe(createCompanyCollaboratorSchema)) dto: CreateCompanyCollaboratorInput,
  ) {
    return this.companyCollaboratorService.create(companyId, dto);
  }

  @Get()
  findAll(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('search') search?: string,
  ) {
    return this.companyCollaboratorService.findAll(companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC' | undefined,
      search,
    });
  }

  @Patch(':id')
  async update(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCompanyCollaboratorSchema)) dto: UpdateCompanyCollaboratorInput,
  ) {
    return this.companyCollaboratorService.update(companyId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.companyCollaboratorService.delete(companyId, id);
    return { message: 'Colaborador excluído com sucesso' };
  }
}
