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

  private saveFile(dir: string, file: Express.Multer.File): string {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let filename = file.originalname;
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    let filePath = path.join(dir, filename);
    let counter = 1;
    while (fs.existsSync(filePath)) {
      filename = `${base} (${counter})${ext}`;
      filePath = path.join(dir, filename);
      counter++;
    }
    fs.writeFileSync(filePath, file.buffer);
    return filename;
  }

  async upload(jobId: number, file: Express.Multer.File): Promise<Attachment> {
    const dir = path.resolve('uploads', `job-${jobId}`);
    const filename = this.saveFile(dir, file);
    const attachment = this.attachmentRepository.create({
      jobId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    return this.attachmentRepository.save(attachment);
  }

  async uploadFreelancer(freelancerId: number, file: Express.Multer.File): Promise<Attachment> {
    const dir = path.resolve('uploads', `freelancer-${freelancerId}`);
    const filename = this.saveFile(dir, file);
    const attachment = this.attachmentRepository.create({
      freelancerId,
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

  async findByFreelancer(freelancerId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { freelancerId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: number): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');

    const subdir = attachment.freelancerId
      ? `freelancer-${attachment.freelancerId}`
      : `job-${attachment.jobId}`;
    const filePath = path.resolve('uploads', subdir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.attachmentRepository.delete(id);
  }
}
