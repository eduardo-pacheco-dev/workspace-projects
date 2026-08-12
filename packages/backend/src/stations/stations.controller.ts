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
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ImportStationsDto } from './dto/import-stations.dto';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  create(@Body() dto: CreateStationDto) {
    return this.stationsService.create(dto);
  }

  @Post('import')
  import(@Body() dto: ImportStationsDto) {
    return this.stationsService.importStations(dto.stations);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('mobileCarrier') mobileCarrier?: string,
  ) {
    return this.stationsService.findAll({ page, limit, sortBy, sortOrder, search, status, mobileCarrier });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStationDto) {
    return this.stationsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.stationsService.delete(id);
  }
}
