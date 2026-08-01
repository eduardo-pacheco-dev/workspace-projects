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
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';

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

  @Get(':id/radio-links')
  findRadioLinks(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findRadioLinks(id);
  }

  @Post(':id/radio-links')
  addRadioLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { radioLinkId: number },
  ) {
    return this.projectsService.addRadioLink(id, Number(body.radioLinkId));
  }

  @Delete(':id/radio-links/:radioLinkId')
  removeRadioLink(
    @Param('id', ParseIntPipe) id: number,
    @Param('radioLinkId', ParseIntPipe) radioLinkId: number,
  ) {
    return this.projectsService.removeRadioLink(id, radioLinkId);
  }

  @Get(':id/documents')
  findDocuments(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findDocuments(id);
  }

  @Post(':id/documents')
  createDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectDocumentDto,
  ) {
    return this.projectsService.createDocument(id, dto);
  }

  @Patch(':id/documents/:docId')
  updateDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('docId', ParseIntPipe) docId: number,
    @Body() dto: UpdateProjectDocumentDto,
  ) {
    return this.projectsService.updateDocument(id, docId, dto);
  }

  @Delete(':id/documents/:docId')
  deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('docId', ParseIntPipe) docId: number,
  ) {
    return this.projectsService.deleteDocument(id, docId);
  }
}
