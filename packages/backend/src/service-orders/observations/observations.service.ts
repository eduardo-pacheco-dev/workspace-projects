import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrderObservation } from './observation.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ServiceOrderObservationsService {
  constructor(
    @InjectRepository(ServiceOrderObservation)
    private readonly observationRepository: Repository<ServiceOrderObservation>,
  ) {}

  private storageDir(serviceOrderId: number): string {
    return path.resolve('uploads', `service-order-${serviceOrderId}`, 'observations');
  }

  async create(
    serviceOrderId: number,
    body: { title?: string; description?: string },
    file?: Express.Multer.File,
  ): Promise<ServiceOrderObservation> {
    const title = body.title?.trim();
    if (!title) {
      throw new BadRequestException('Título é obrigatório.');
    }

    const data: Partial<ServiceOrderObservation> = {
      serviceOrderId,
      title,
      description: body.description || null,
      filename: null,
      originalName: null,
      mimetype: null,
      size: null,
    };

    if (file) {
      const dir = this.storageDir(serviceOrderId);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      fs.writeFileSync(path.join(dir, filename), file.buffer);

      data.filename = filename;
      data.originalName = file.originalname;
      data.mimetype = file.mimetype;
      data.size = file.size;
    }

    const observation = this.observationRepository.create(data);
    return this.observationRepository.save(observation);
  }

  async findByServiceOrder(serviceOrderId: number): Promise<ServiceOrderObservation[]> {
    return this.observationRepository.find({
      where: { serviceOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<ServiceOrderObservation> {
    const observation = await this.observationRepository.findOne({ where: { id } });
    if (!observation) throw new NotFoundException('Observação não encontrada');
    return observation;
  }

  getFilePath(observation: ServiceOrderObservation): string {
    return path.join(this.storageDir(observation.serviceOrderId), observation.filename || '');
  }

  async delete(id: number): Promise<void> {
    const observation = await this.findById(id);

    if (observation.filename) {
      const filePath = this.getFilePath(observation);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.observationRepository.delete(id);
  }
}
