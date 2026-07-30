import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
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

  @Post('upload-freelancer/:freelancerId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFreelancer(
    @Param('freelancerId', ParseIntPipe) freelancerId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadFreelancer(freelancerId, file);
  }

  @Get('job/:jobId')
  findByJob(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.attachmentsService.findByJob(jobId);
  }

  @Get('freelancer/:freelancerId')
  findByFreelancer(@Param('freelancerId', ParseIntPipe) freelancerId: number) {
    return this.attachmentsService.findByFreelancer(freelancerId);
  }

  private sendFile(attachment: any, res: Response, disposition: 'inline' | 'attachment') {
    const subdir = attachment.freelancerId
      ? `freelancer-${attachment.freelancerId}`
      : `job-${attachment.jobId}`;
    const filePath = path.resolve('uploads', subdir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    res.setHeader('Content-Type', attachment.mimetype);
    if (disposition === 'inline') {
      res.setHeader('Content-Disposition', 'inline');
      res.sendFile(filePath);
    } else {
      res.download(filePath, attachment.originalName);
    }
  }

  @Get('file/:id')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findById(id);
    this.sendFile(attachment, res, 'inline');
  }

  @Get('download/:id')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findById(id);
    this.sendFile(attachment, res, 'attachment');
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.delete(id);
  }
}
