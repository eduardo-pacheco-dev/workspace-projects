import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Attachment } from './attachment.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  private getStorageDir(attachment: Pick<Attachment, 'jobId' | 'serviceOrderId' | 'stationId' | 'radioLinkId' | 'projectId' | 'clientId' | 'companyId' | 'taskId'>): string {
    if (attachment.taskId) return path.resolve('uploads', `task-${attachment.taskId}`);
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

  async uploadForTask(taskId: number, file: Express.Multer.File): Promise<Attachment> {
    const dir = path.resolve('uploads', `task-${taskId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      taskId,
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
    folderId?: number | null,
  ): Promise<Attachment> {
    const dir = path.resolve('uploads', `project-${projectId}`);
    const filename = this.saveFile(dir, file);

    const attachment = this.attachmentRepository.create({
      projectId,
      folderId: folderId ?? null,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      isFolder: false,
    });

    return this.attachmentRepository.save(attachment);
  }

  async createFolder(
    projectId: number,
    dto: CreateFolderDto,
  ): Promise<Attachment> {
    const folder = this.attachmentRepository.create({
      projectId,
      folderId: dto.folderId ?? null,
      filename: dto.nome,
      originalName: dto.nome,
      mimetype: 'folder',
      size: 0,
      isFolder: true,
    });

    return this.attachmentRepository.save(folder);
  }

  async update(id: number, dto: UpdateAttachmentDto): Promise<Attachment> {
    const attachment = await this.findById(id);
    if (dto.originalName != null) {
      attachment.originalName = dto.originalName;
      if (attachment.isFolder) {
        attachment.filename = dto.originalName;
      }
    }
    if (dto.folderId !== undefined) {
      attachment.folderId = dto.folderId;
    }
    return this.attachmentRepository.save(attachment);
  }

  async organizeProject(
    projectId: number,
  ): Promise<{ organized: number; folders: string[] }> {
    const rootFiles = await this.attachmentRepository.find({
      where: { projectId, folderId: IsNull(), isFolder: false },
    });
    if (rootFiles.length === 0) return { organized: 0, folders: [] };

    const groupName = (mimetype: string): string => {
      if (mimetype.startsWith('image/')) return 'Imagens';
      if (mimetype === 'application/pdf') return 'PDFs';
      return 'Documentos';
    };

    const groups = new Map<string, Attachment[]>();
    for (const file of rootFiles) {
      const name = groupName(file.mimetype);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(file);
    }

    const folders: string[] = [];
    for (const [name, files] of groups) {
      let folder = await this.attachmentRepository.findOne({
        where: { projectId, folderId: IsNull(), isFolder: true, originalName: name },
      });
      if (!folder) {
        folder = await this.attachmentRepository.save(
          this.attachmentRepository.create({
            projectId,
            folderId: null,
            filename: name,
            originalName: name,
            mimetype: 'folder',
            size: 0,
            isFolder: true,
          }),
        );
        folders.push(name);
      }
      for (const file of files) {
        file.folderId = folder.id;
      }
      await this.attachmentRepository.save(files);
    }

    return { organized: rootFiles.length, folders };
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

  async findByTask(taskId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByServiceOrder(serviceOrderId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { serviceOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStation(
    stationId: number,
    query?: { page?: number; limit?: number; search?: string; type?: string },
  ): Promise<{ data: Attachment[]; total: number }> {
    const { page = 1, limit = 10, search, type } = query ?? {};

    const qb = this.attachmentRepository.createQueryBuilder('a');
    qb.where('a.stationId = :stationId', { stationId });

    if (search) {
      qb.andWhere('a.originalName LIKE :search OR a.filename LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (type === 'image') {
      qb.andWhere('a.mimetype LIKE :image', { image: 'image/%' });
    } else if (type === 'pdf') {
      qb.andWhere('a.mimetype = :pdf', { pdf: 'application/pdf' });
    } else if (type === 'document') {
      qb.andWhere('a.mimetype NOT LIKE :image AND a.mimetype <> :pdf', {
        image: 'image/%',
        pdf: 'application/pdf',
      });
    }

    const [data, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findByRadioLink(
    radioLinkId: number,
    query?: { page?: number; limit?: number; search?: string; type?: string },
  ): Promise<{ data: Attachment[]; total: number }> {
    const { page = 1, limit = 10, search, type } = query ?? {};

    const qb = this.attachmentRepository.createQueryBuilder('a');
    qb.where('a.radioLinkId = :radioLinkId', { radioLinkId });

    if (search) {
      qb.andWhere('a.originalName LIKE :search OR a.filename LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (type === 'image') {
      qb.andWhere('a.mimetype LIKE :image', { image: 'image/%' });
    } else if (type === 'pdf') {
      qb.andWhere('a.mimetype = :pdf', { pdf: 'application/pdf' });
    } else if (type === 'document') {
      qb.andWhere('a.mimetype NOT LIKE :image AND a.mimetype <> :pdf', {
        image: 'image/%',
        pdf: 'application/pdf',
      });
    }

    const [data, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findByProject(
    projectId: number,
    query?: { folderId?: number | 'root' | null },
  ): Promise<Attachment[]> {
    const { folderId } = query ?? {};

    const where: any = { projectId };

    if (folderId === 'root' || folderId === null) {
      where.folderId = null;
    } else if (folderId !== undefined) {
      where.folderId = folderId;
    }

    const items = await this.attachmentRepository.find({
      where,
      order: { isFolder: 'DESC', originalName: 'ASC' },
    });

    return items;
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

    if (attachment.isFolder) {
      const children = await this.attachmentRepository.find({
        where: { folderId: id },
      });
      for (const child of children) {
        await this.delete(child.id);
      }
    } else {
      const filePath = path.join(this.getStorageDir(attachment), attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.attachmentRepository.delete(id);
  }
}
