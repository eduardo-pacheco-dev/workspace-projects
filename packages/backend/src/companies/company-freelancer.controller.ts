import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CompanyFreelancerService } from './company-freelancer.service';

@Controller('companies/:companyId/freelancers')
export class CompanyFreelancerController {
  constructor(private readonly companyFreelancerService: CompanyFreelancerService) {}

  @Get()
  findAll(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('search') search?: string,
  ) {
    return this.companyFreelancerService.findAll(companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC' | undefined,
      search,
    });
  }

  @Post(':freelancerId')
  async associate(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('freelancerId', ParseIntPipe) freelancerId: number,
  ) {
    const row = await this.companyFreelancerService.associate(companyId, freelancerId);
    return { message: 'Freelancer vinculado com sucesso', data: row };
  }

  @Delete(':freelancerId')
  async remove(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('freelancerId', ParseIntPipe) freelancerId: number,
  ) {
    await this.companyFreelancerService.remove(companyId, freelancerId);
    return { message: 'Freelancer desvinculado com sucesso' };
  }
}
