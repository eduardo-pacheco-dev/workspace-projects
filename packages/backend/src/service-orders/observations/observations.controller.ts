import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ServiceOrderObservationsService } from './observations.service';
import * as fs from 'fs';

@Controller('service-orders')
export class ObservationsController {
  constructor(private readonly observationsService: ServiceOrderObservationsService) {}

  @Post(':serviceOrderId/observations')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Param('serviceOrderId', ParseIntPipe) serviceOrderId: number,
    @Body() body: { title?: string; description?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.observationsService.create(serviceOrderId, body, file);
  }

  @Get(':serviceOrderId/observations')
  findByServiceOrder(@Param('serviceOrderId', ParseIntPipe) serviceOrderId: number) {
    return this.observationsService.findByServiceOrder(serviceOrderId);
  }

  @Patch(':serviceOrderId/observations/reorder')
  reorder(
    @Param('serviceOrderId', ParseIntPipe) serviceOrderId: number,
    @Body() body: { ids: number[] },
  ) {
    return this.observationsService.reorder(serviceOrderId, body.ids);
  }

  @Get('observations/:observationId/file')
  async getFile(
    @Param('observationId', ParseIntPipe) observationId: number,
    @Res() res: Response,
  ) {
    const observation = await this.observationsService.findById(observationId);
    if (!observation.filename) {
      return res.status(404).json({ message: 'Observação sem anexo' });
    }
    const filePath = this.observationsService.getFilePath(observation);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    res.setHeader('Content-Type', observation.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  }

  @Delete('observations/:observationId')
  delete(@Param('observationId', ParseIntPipe) observationId: number) {
    return this.observationsService.delete(observationId);
  }
}
