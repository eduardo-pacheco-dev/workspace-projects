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
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import * as path from 'path';
import * as fs from 'fs';

const UPLOAD_LIMITS = { fileSize: 50 * 1024 * 1024 };

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload/:jobId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async upload(
    @Param('jobId', ParseIntPipe) jobId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.upload(jobId, file);
  }

  @Post('upload/service-order/:serviceOrderId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForServiceOrder(
    @Param('serviceOrderId', ParseIntPipe) serviceOrderId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForServiceOrder(serviceOrderId, file);
  }

  @Post('upload/station/:stationId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForStation(stationId, file);
  }

  @Post('upload/radio-link/:radioLinkId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForRadioLink(
    @Param('radioLinkId', ParseIntPipe) radioLinkId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForRadioLink(radioLinkId, file);
  }

  @Post('upload/project/:projectId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
    @Query('folderId') folderId?: string,
  ) {
    const folder = folderId && folderId !== 'root' ? Number(folderId) : null;
    return this.attachmentsService.uploadForProject(projectId, file, folder);
  }

  @Post('project/:projectId/folder')
  createFolder(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateFolderDto,
  ) {
    return this.attachmentsService.createFolder(projectId, dto);
  }

  @Post('upload/client/:clientId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForClient(clientId, file);
  }

  @Post('upload/company/:companyId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
  async uploadForCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForCompany(companyId, file);
  }

  @Post('upload/task/:taskId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: UPLOAD_LIMITS }))
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
  findByStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.attachmentsService.findByStation(stationId, { page, limit, search, type });
  }

  @Get('radio-link/:radioLinkId')
  findByRadioLink(
    @Param('radioLinkId', ParseIntPipe) radioLinkId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.attachmentsService.findByRadioLink(radioLinkId, { page, limit, search, type });
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('folderId') folderId?: string,
  ) {
    let parsed: number | 'root' | null | undefined;
    if (folderId === undefined) {
      parsed = undefined;
    } else if (folderId === 'root' || folderId === '') {
      parsed = 'root';
    } else {
      parsed = Number(folderId);
    }
    return this.attachmentsService.findByProject(projectId, { folderId: parsed });
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttachmentDto,
  ) {
    return this.attachmentsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.delete(id);
  }
}
