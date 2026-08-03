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

  private getStorageDir(attachment: Pick<Attachment, 'jobId' | 'serviceOrderId' | 'stationId' | 'radioLinkId' | 'projectId' | 'clientId' | 'companyId'>): string {
    if (attachment.companyId) return path.resolve('uploads', `company-${attachment.companyId}`);
    if (attachment.clientId) return path.resolve('uploads', `client-${attachment.clientId}`);
    if (attachment.projectId) return path.resolve('uploads', `project-${attachment.projectId}`);
    if (attachment.radioLinkId) return path.resolve('uploads', `radio-link-${attachment.radioLinkId}`);
    if (attachment.stationId) return path.resolve('uploads', `station-${attachment.stationId}`);
    const subdir = attachment.serviceOrderId
      ? `service-order-${attachment.serviceOrderId}`
      : `job-${attachment.jobId}`;
    return path.resolve('uploads', subdir);
  }

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

  async uploadForServiceOrder(
    serviceOrderId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `service-order-${serviceOrderId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      serviceOrderId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async uploadForStation(
    stationId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `station-${stationId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      stationId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async uploadForRadioLink(
    radioLinkId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `radio-link-${radioLinkId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      radioLinkId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async uploadForProject(
    projectId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `project-${projectId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      projectId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async uploadForClient(
    clientId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `client-${clientId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      clientId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.attachmentRepository.save(attachment);
  }

  async uploadForCompany(
    companyId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `company-${companyId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      companyId,
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

  async findByServiceOrder(serviceOrderId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { serviceOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStation(stationId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { stationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByRadioLink(radioLinkId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { radioLinkId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCompany(
    companyId: number,
    query?: { page?: number; limit?: number; search?: string },
  ): Promise<{ data: Attachment[]; total: number }> {
    const { page = 1, limit = 10, search } = query ?? {};

    const qb = this.attachmentRepository.createQueryBuilder('a');
    qb.where('a.companyId = :companyId', { companyId });

    if (search) {
      qb.andWhere(
        'a.originalName LIKE :search OR a.filename LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async delete(id: number): Promise<void> {
    const attachment = await this.findById(id);

    const filePath = path.join(this.getStorageDir(attachment), attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.attachmentRepository.delete(id);
  }
}
