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
