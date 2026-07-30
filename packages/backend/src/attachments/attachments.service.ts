import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}
  async upload(
    jobId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const jobDir = path.resolve('uploads', `job-${jobId}`);
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }

    let filename = file.originalname;
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    let filePath = path.join(jobDir, filename);
    let counter = 1;
    while (fs.existsSync(filePath)) {
      filename = `${base} (${counter})${ext}`;
      filePath = path.join(jobDir, filename);
      counter++;
    }

    fs.writeFileSync(filePath, file.buffer);

    const attachment = this.attachmentRepository.create({
      jobId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async findById(id: number): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');
    return attachment;
  }

  async findByJob(jobId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { jobId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: number): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');

    const jobDir = path.resolve('uploads', `job-${attachment.jobId}`);
    const filePath = path.join(jobDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.attachmentRepository.delete(id);
  }
}
