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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FreelancersService } from './freelancers.service';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('freelancers')
export class FreelancersController {
  constructor(private readonly freelancersService: FreelancersService) {}

  @Post()
  create(@Body() dto: CreateFreelancerDto) {
    return this.freelancersService.create(dto);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const dir = path.resolve('uploads', `freelancer-${id}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `photo-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    const url = `/uploads/freelancer-${id}/${filename}`;
    return this.freelancersService.updatePhoto(id, url);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('availability') availability?: string,
  ) {
    return this.freelancersService.findAll({ page, limit, sortBy, sortOrder, search, experienceLevel, availability });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.freelancersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFreelancerDto) {
    return this.freelancersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.freelancersService.delete(id);
  }
}
