import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
  findAll(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companyCollaboratorService.findAll(companyId);
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
