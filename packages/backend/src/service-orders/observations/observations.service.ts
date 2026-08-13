import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ServiceOrderObservation } from './domain/observation.entity';
import {
  ObservationRepository,
  OBSERVATION_REPOSITORY,
} from './domain/observation.repository';
import { applyPositions, requireTitle } from './domain/observation-rules';
import { ObservationFileStorage } from './infrastructure/observation-file-storage';

@Injectable()
export class ServiceOrderObservationsService {
  constructor(
    @Inject(OBSERVATION_REPOSITORY)
    private readonly observationRepository: ObservationRepository,
    private readonly fileStorage: ObservationFileStorage,
  ) {}

  getFilePath(observation: ServiceOrderObservation): string {
    return this.fileStorage.getFilePath(observation);
  }

  async create(
    serviceOrderId: number,
    body: { title?: string; description?: string },
    file?: Express.Multer.File,
  ): Promise<ServiceOrderObservation> {
    const { title, error } = requireTitle(body.title);
    if (!title) throw new BadRequestException(error);

    const position = (await this.observationRepository.findMaxPosition(serviceOrderId)) + 1;
    const stored = file ? this.fileStorage.store(serviceOrderId, file) : null;

    return this.observationRepository.create(
      new ServiceOrderObservation({
        serviceOrderId,
        title,
        description: body.description || null,
        position,
        filename: stored?.filename ?? null,
        originalName: stored?.originalName ?? null,
        mimetype: stored?.mimetype ?? null,
        size: stored?.size ?? null,
      }),
    );
  }

  async findByServiceOrder(serviceOrderId: number): Promise<ServiceOrderObservation[]> {
    return this.observationRepository.findByServiceOrder(serviceOrderId);
  }

  async reorder(serviceOrderId: number, ids: number[]): Promise<void> {
    const observations = await this.observationRepository.findByServiceOrder(serviceOrderId);
    if (applyPositions(observations, ids)) {
      await this.observationRepository.saveMany(observations);
    }
  }

  async update(
    id: number,
    body: { title?: string; description?: string },
    file?: Express.Multer.File,
  ): Promise<ServiceOrderObservation> {
    const observation = await this.findById(id);

    if (body.title !== undefined) {
      const { title, error } = requireTitle(body.title);
      if (!title) throw new BadRequestException(error);
      observation.title = title;
    }
    if (body.description !== undefined) {
      observation.description = body.description;
    }

    if (file) {
      this.fileStorage.remove(observation);
      const stored = this.fileStorage.store(observation.serviceOrderId, file);
      observation.filename = stored.filename;
      observation.originalName = stored.originalName;
      observation.mimetype = stored.mimetype;
      observation.size = stored.size;
    }

    return this.observationRepository.save(observation);
  }

  async findById(id: number): Promise<ServiceOrderObservation> {
    const observation = await this.observationRepository.findById(id);
    if (!observation) throw new NotFoundException('Observação não encontrada');
    return observation;
  }

  async delete(id: number): Promise<void> {
    const observation = await this.findById(id);
    this.fileStorage.remove(observation);
    await this.observationRepository.delete(id);
  }
}
