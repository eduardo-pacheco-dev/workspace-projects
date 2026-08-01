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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('cliente') cliente?: string,
  ) {
    return this.projectsService.findAll({ page, limit, sortBy, sortOrder, search, status, cliente });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.delete(id);
  }

  @Get(':id/stations')
  findStations(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findStations(id);
  }

  @Post(':id/stations')
  addStation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stationId: number },
  ) {
    return this.projectsService.addStation(id, Number(body.stationId));
  }

  @Delete(':id/stations/:stationId')
  removeStation(
    @Param('id', ParseIntPipe) id: number,
    @Param('stationId', ParseIntPipe) stationId: number,
  ) {
    return this.projectsService.removeStation(id, stationId);
  }
}
