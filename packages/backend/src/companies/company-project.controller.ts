import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

@Controller('companies/:companyId/projects')
export class CompanyProjectController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.projectsService.findByCompany(companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC' | undefined,
      search,
      status,
    });
  }

  @Post(':projectId')
  async associate(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    const project = await this.projectsService.addCompany(projectId, companyId);
    return { message: 'Projeto vinculado com sucesso', data: project };
  }

  @Delete(':projectId')
  async remove(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    await this.projectsService.removeCompany(projectId, companyId);
    return { message: 'Projeto desvinculado com sucesso' };
  }
}
