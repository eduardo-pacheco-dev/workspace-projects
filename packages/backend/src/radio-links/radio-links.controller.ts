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
import { RadioLinksService } from './radio-links.service';
import { CreateRadioLinkDto } from './dto/create-radio-link.dto';
import { UpdateRadioLinkDto } from './dto/update-radio-link.dto';
import { ImportRadioLinksDto } from './dto/import-radio-links.dto';

@Controller('radio-links')
export class RadioLinksController {
  constructor(private readonly radioLinksService: RadioLinksService) {}

  @Post()
  create(@Body() dto: CreateRadioLinkDto) {
    return this.radioLinksService.create(dto);
  }

  @Post('import')
  import(@Body() dto: ImportRadioLinksDto) {
    return this.radioLinksService.importRadioLinks(dto.radioLinks);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('operadora') operadora?: string,
  ) {
    return this.radioLinksService.findAll({ page, limit, sortBy, sortOrder, search, status, operadora });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.radioLinksService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRadioLinkDto) {
    return this.radioLinksService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.radioLinksService.delete(id);
  }
}
