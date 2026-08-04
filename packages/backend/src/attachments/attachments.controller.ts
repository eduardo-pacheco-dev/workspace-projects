import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload/:jobId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @Param('jobId', ParseIntPipe) jobId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.upload(jobId, file);
  }

  @Post('upload/service-order/:serviceOrderId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForServiceOrder(
    @Param('serviceOrderId', ParseIntPipe) serviceOrderId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForServiceOrder(serviceOrderId, file);
  }

  @Post('upload/station/:stationId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForStation(stationId, file);
  }

  @Post('upload/radio-link/:radioLinkId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForRadioLink(
    @Param('radioLinkId', ParseIntPipe) radioLinkId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForRadioLink(radioLinkId, file);
  }

  @Post('upload/project/:projectId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForProject(projectId, file);
  }

  @Post('upload/client/:clientId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForClient(clientId, file);
  }

  @Post('upload/company/:companyId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForCompany(companyId, file);
  }

  @Post('upload/task/:taskId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadForTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForTask(taskId, file);
  }

  @Get('job/:jobId')
  findByJob(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.attachmentsService.findByJob(jobId);
  }

  @Get('service-order/:serviceOrderId')
  findByServiceOrder(@Param('serviceOrderId', ParseIntPipe) serviceOrderId: number) {
    return this.attachmentsService.findByServiceOrder(serviceOrderId);
  }

  @Get('station/:stationId')
  findByStation(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.attachmentsService.findByStation(stationId);
  }

  @Get('radio-link/:radioLinkId')
  findByRadioLink(@Param('radioLinkId', ParseIntPipe) radioLinkId: number) {
    return this.attachmentsService.findByRadioLink(radioLinkId);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.attachmentsService.findByProject(projectId);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.attachmentsService.findByClient(clientId);
  }

  @Get('company/:companyId')
  findByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.attachmentsService.findByCompany(companyId, { page, limit, search });
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.attachmentsService.findByTask(taskId);
  }

  @Get('file/:id')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findById(id);
    const filePath = path.join(
      path.resolve('uploads'),
      attachment.taskId
        ? `task-${attachment.taskId}`
        : attachment.companyId
          ? `company-${attachment.companyId}`
          : attachment.clientId
            ? `client-${attachment.clientId}`
            : attachment.projectId
              ? `project-${attachment.projectId}`
              : attachment.radioLinkId
                ? `radio-link-${attachment.radioLinkId}`
                : attachment.stationId
                  ? `station-${attachment.stationId}`
                  : attachment.serviceOrderId
                    ? `service-order-${attachment.serviceOrderId}`
                    : `job-${attachment.jobId}`,
      attachment.filename,
    );
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  }

  @Get('download/:id')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findById(id);
    const filePath = path.join(
      path.resolve('uploads'),
      attachment.companyId
        ? `company-${attachment.companyId}`
        : attachment.clientId
          ? `client-${attachment.clientId}`
          : attachment.projectId
            ? `project-${attachment.projectId}`
            : attachment.radioLinkId
              ? `radio-link-${attachment.radioLinkId}`
              : attachment.stationId
                ? `station-${attachment.stationId}`
                : attachment.serviceOrderId
                  ? `service-order-${attachment.serviceOrderId}`
                  : `job-${attachment.jobId}`,
      attachment.filename,
    );
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    res.download(filePath, attachment.originalName);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.delete(id);
  }
}
