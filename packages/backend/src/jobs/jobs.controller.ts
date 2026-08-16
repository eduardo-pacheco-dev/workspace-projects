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
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto, @Request() req: any) {
    return this.jobsService.create(dto, this.resolveCompanyId(req));
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    return this.jobsService.findAll(
      { page, limit, sortBy, sortOrder, search, status },
      this.resolveCompanyId(req),
    );
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.jobsService.findById(id, this.resolveCompanyId(req));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.update(id, dto, this.resolveCompanyId(req));
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.jobsService.delete(id, this.resolveCompanyId(req));
    return { message: 'Job excluído com sucesso' };
  }

  @Post(':id/run')
  run(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.jobsService.runNow(id, this.resolveCompanyId(req));
  }

  private resolveCompanyId(req: any): number | undefined {
    return req?.user && req.user.role !== 'master'
      ? (req.user.companyId ?? -1)
      : undefined;
  }
}