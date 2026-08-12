import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  CreateCollaboratorInput,
  UpdateCollaboratorInput,
} from './schemas/collaborator.schemas';
import { Collaborator, CollaboratorProps } from './domain/collaborator.entity';
import {
  CollaboratorRepository,
  CollaboratorQuery,
  PaginatedCollaborators,
  CurrentUser,
  COLLABORATOR_REPOSITORY,
} from './domain/collaborator.repository';
import {
  buildNome,
  generateCodigo,
  isMaster,
  COLLABORATOR_DOCUMENT_FIELDS,
  CollaboratorDocumentType,
} from './domain/collaborator-rules';

@Injectable()
export class CollaboratorsService {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorsRepository: CollaboratorRepository,
  ) {}

  private async ensureCompanyExists(companyId: number): Promise<void> {
    const exists = await this.collaboratorsRepository.companyExists(companyId);
    if (!exists) throw new BadRequestException('Empresa não encontrada');
  }

  private assertVisible(collaborator: Collaborator, currentUser?: CurrentUser): void {
    if (currentUser && currentUser.role !== 'master') {
      if (collaborator.companyId !== currentUser.companyId) {
        throw new NotFoundException('Colaborador não encontrado');
      }
    }
  }

  private assertCanCreate(currentUser: CurrentUser | undefined, companyId: number): void {
    if (currentUser && currentUser.role !== 'master') {
      if (currentUser.companyId == null || companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'Usuário não-master só pode criar colaboradores para a própria empresa.',
        );
      }
    }
  }

  private async assertCanChangeCompany(
    currentUser: CurrentUser | undefined,
    companyId: number,
  ): Promise<void> {
    await this.ensureCompanyExists(companyId);
    if (currentUser && currentUser.role !== 'master' && companyId !== currentUser.companyId) {
      throw new BadRequestException(
        'Usuário não-master não pode mover o colaborador para outra empresa.',
      );
    }
  }

  private buildCreateProps(
    dto: CreateCollaboratorInput,
    companyId: number,
    isFreelancer: boolean,
  ): CollaboratorProps {
    const nome = dto.nome || buildNome(dto.firstName, dto.lastName) || undefined;
    return {
      ...dto,
      nome,
      status: dto.status ?? 'ativo',
      companyId,
      isFreelancer,
      skills: dto.skills ?? (isFreelancer ? '[]' : undefined),
      portfolio: dto.portfolio ?? (isFreelancer ? '[]' : undefined),
      experienceLevel: dto.experienceLevel ?? (isFreelancer ? 'junior' : undefined),
      availability: dto.availability ?? (isFreelancer ? 'available' : undefined),
    };
  }

  private refreshNome(collaborator: Collaborator, dto: UpdateCollaboratorInput): void {
    if (dto.firstName === undefined && dto.lastName === undefined) return;
    collaborator.nome =
      buildNome(dto.firstName ?? collaborator.firstName, dto.lastName ?? collaborator.lastName) ||
      collaborator.nome;
  }

  private withCodigo(saved: Collaborator): Collaborator {
    return new Collaborator({
      ...saved,
      codigo: generateCodigo(saved.isFreelancer, saved.id ?? 0),
    });
  }

  async create(dto: CreateCollaboratorInput, currentUser?: CurrentUser): Promise<Collaborator> {
    const companyId = dto.companyId;
    this.assertCanCreate(currentUser, companyId);
    await this.ensureCompanyExists(companyId);

    const isFreelancer = dto.isFreelancer ?? false;
    const collaborator = new Collaborator(this.buildCreateProps(dto, companyId, isFreelancer));

    let saved = await this.collaboratorsRepository.save(collaborator);
    if (!saved.codigo) {
      saved = await this.collaboratorsRepository.save(this.withCodigo(saved));
    }
    return saved;
  }

  async findAllPaged(
    query: CollaboratorQuery,
    currentUser?: CurrentUser,
  ): Promise<PaginatedCollaborators> {
    const companyId = isMaster(currentUser) ? undefined : (currentUser?.companyId ?? -1);
    return this.collaboratorsRepository.findAll({ ...query, companyId });
  }

  async getByIdOrFail(id: number, currentUser?: CurrentUser): Promise<Collaborator> {
    const collaborator = await this.collaboratorsRepository.findById(id);
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');
    this.assertVisible(collaborator, currentUser);
    return collaborator;
  }

  async update(
    id: number,
    dto: UpdateCollaboratorInput,
    currentUser?: CurrentUser,
  ): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    Object.assign(collaborator, dto);
    this.refreshNome(collaborator, dto);
    if (dto.companyId !== undefined) {
      await this.assertCanChangeCompany(currentUser, dto.companyId);
    }
    return this.collaboratorsRepository.save(collaborator);
  }

  async getFreelancerOrFail(id: number, currentUser?: CurrentUser): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    if (!collaborator.isFreelancer) {
      throw new NotFoundException('Freelancer não encontrado');
    }
    return collaborator;
  }

  async delete(id: number, currentUser?: CurrentUser): Promise<void> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    const deleted = await this.collaboratorsRepository.delete(collaborator.id ?? 0);
    if (!deleted) throw new NotFoundException('Colaborador não encontrado');
  }

  async updatePhoto(id: number, url: string, currentUser?: CurrentUser): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    collaborator.foto = url;
    return this.collaboratorsRepository.save(collaborator);
  }

  async updateDocument(
    id: number,
    tipo: string,
    url: string,
    currentUser?: CurrentUser,
  ): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    const field = COLLABORATOR_DOCUMENT_FIELDS[tipo as CollaboratorDocumentType];
    if (!field) throw new NotFoundException('Tipo de documento inválido');
    collaborator[field] = url;
    return this.collaboratorsRepository.save(collaborator);
  }
}
