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
import { Collaborator } from './domain/collaborator.entity';
import {
  CollaboratorRepository,
  CollaboratorQuery,
  PaginatedCollaborators,
  CurrentUser,
  COLLABORATOR_REPOSITORY,
} from './domain/collaborator.repository';
import { buildNome, generateCodigo, isMaster } from './domain/collaborator-rules';

@Injectable()
export class CollaboratorsService {
  constructor(
    @Inject(COLLABORATOR_REPOSITORY)
    private readonly collaboratorsRepository: CollaboratorRepository,
  ) {}

  private async ensureCompany(companyId: number): Promise<void> {
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

  async create(dto: CreateCollaboratorInput, currentUser?: CurrentUser): Promise<Collaborator> {
    const companyId = dto.companyId;
    if (currentUser && currentUser.role !== 'master') {
      if (currentUser.companyId == null || companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'Usuário não-master só pode criar colaboradores para a própria empresa.',
        );
      }
    }
    await this.ensureCompany(companyId);

    const isFreelancer = dto.isFreelancer ?? false;
    const nome = dto.nome || buildNome(dto.firstName, dto.lastName) || undefined;

    const collaborator = new Collaborator({
      ...dto,
      nome,
      status: dto.status ?? 'ativo',
      companyId,
      isFreelancer,
      skills: dto.skills ?? (isFreelancer ? '[]' : undefined),
      portfolio: dto.portfolio ?? (isFreelancer ? '[]' : undefined),
      experienceLevel: dto.experienceLevel ?? (isFreelancer ? 'junior' : undefined),
      availability: dto.availability ?? (isFreelancer ? 'available' : undefined),
    });

    let saved = await this.collaboratorsRepository.save(collaborator);
    if (!saved.codigo) {
      saved = new Collaborator({
        ...saved,
        codigo: generateCodigo(saved.isFreelancer, saved.id ?? 0),
      });
      saved = await this.collaboratorsRepository.save(saved);
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
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      collaborator.nome =
        buildNome(dto.firstName ?? collaborator.firstName, dto.lastName ?? collaborator.lastName) ||
        collaborator.nome;
    }
    if (dto.companyId !== undefined) {
      await this.ensureCompany(dto.companyId);
      if (currentUser && currentUser.role !== 'master' && dto.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'Usuário não-master não pode mover o colaborador para outra empresa.',
        );
      }
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
    if (tipo === 'rg') {
      collaborator.rgArquivo = url;
    } else if (tipo === 'carteira') {
      collaborator.carteiraArquivo = url;
    } else if (tipo === 'habilitacao') {
      collaborator.habilitacaoArquivo = url;
    } else if (tipo === 'nr10') {
      collaborator.nr10Arquivo = url;
    } else if (tipo === 'nr35') {
      collaborator.nr35Arquivo = url;
    } else if (tipo === 'aso') {
      collaborator.asoArquivo = url;
    } else if (tipo === 'epi') {
      collaborator.epiArquivo = url;
    } else if (tipo === 'ordemServico') {
      collaborator.ordemServicoArquivo = url;
    } else if (tipo === 'contrato') {
      collaborator.contratoArquivo = url;
    } else {
      throw new NotFoundException('Tipo de documento inválido');
    }
    return this.collaboratorsRepository.save(collaborator);
  }
}
