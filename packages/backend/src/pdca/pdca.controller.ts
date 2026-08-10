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
import { PdcaService } from './pdca.service';
import { CreatePdcaDto } from './dto/create-pdca.dto';
import { UpdatePdcaDto } from './dto/update-pdca.dto';
import { CreatePdcaActionDto } from './dto/create-pdca-action.dto';
import { UpdatePdcaActionDto } from './dto/update-pdca-action.dto';

@Controller('pdca')
export class PdcaController {
  constructor(private readonly pdcaService: PdcaService) {}

  @Post()
  create(@Body() dto: CreatePdcaDto) {
    return this.pdcaService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('projectId') projectId?: string,
    @Query('fase') fase?: string,
    @Query('status') status?: string,
  ) {
    const parsedProjectId = projectId ? Number(projectId) : undefined;
    return this.pdcaService.findAll({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      projectId: parsedProjectId,
      fase,
      status,
    });
  }

  @Get(':id/actions')
  findActions(@Param('id', ParseIntPipe) id: number) {
    return this.pdcaService.findActions(id);
  }

  @Post(':id/actions')
  createAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePdcaActionDto,
  ) {
    return this.pdcaService.createAction(id, dto);
  }

  @Patch(':id/actions/:actionId')
  updateAction(
    @Param('id', ParseIntPipe) id: number,
    @Param('actionId', ParseIntPipe) actionId: number,
    @Body() dto: UpdatePdcaActionDto,
  ) {
    return this.pdcaService.updateAction(id, actionId, dto);
  }

  @Delete(':id/actions/:actionId')
  deleteAction(
    @Param('id', ParseIntPipe) id: number,
    @Param('actionId', ParseIntPipe) actionId: number,
  ) {
    return this.pdcaService.deleteAction(id, actionId);
  }

  @Post(':id/restart')
  restart(@Param('id', ParseIntPipe) id: number) {
    return this.pdcaService.restart(id);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.pdcaService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePdcaDto) {
    return this.pdcaService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pdcaService.delete(id);
  }
}
