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
import { LpuService } from './lpu.service';
import { CreateLpuDto } from './dto/create-lpu.dto';
import { UpdateLpuDto } from './dto/update-lpu.dto';

@Controller('lpus')
export class LpuController {
  constructor(private readonly lpuService: LpuService) {}

  @Post()
  create(@Body() dto: CreateLpuDto) {
    return this.lpuService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('freelancerId') freelancerId?: string,
    @Request() req?: any,
  ) {
    const companyId =
      req?.user && req.user.role !== 'master' ? (req.user.companyId ?? -1) : undefined;
    return this.lpuService.findAll(
      {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        status,
        freelancerId: freelancerId ? Number(freelancerId) : undefined,
      },
      companyId,
    );
  }

  @Get('freelancer/:freelancerId')
  findAllByFreelancer(@Param('freelancerId', ParseIntPipe) freelancerId: number) {
    return this.lpuService.findAllByFreelancer(freelancerId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.lpuService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLpuDto) {
    return this.lpuService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.lpuService.delete(id);
  }
}
