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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.clientsService.findAll({ page, limit, sortBy, sortOrder, search, status });
  }

  @Get(':clientId/responsaveis')
  findResponsaveis(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.clientsService.findResponsaveisByClient(clientId);
  }

  @Post(':clientId/responsaveis')
  createResponsavel(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: CreateResponsavelDto,
  ) {
    return this.clientsService.createResponsavel(clientId, dto);
  }

  @Patch('responsaveis/:id')
  updateResponsavel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResponsavelDto,
  ) {
    return this.clientsService.updateResponsavel(id, dto);
  }

  @Delete('responsaveis/:id')
  deleteResponsavel(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.deleteResponsavel(id);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.delete(id);
  }
}
