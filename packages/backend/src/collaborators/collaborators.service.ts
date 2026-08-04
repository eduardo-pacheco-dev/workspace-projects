import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from './collaborator.entity';
import { Company } from '../companies/company.entity';
import {
  CreateCollaboratorInput,
  UpdateCollaboratorInput,
} from './schemas/collaborator.schemas';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorsRepository: Repository<Collaborator>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  private async ensureCompany(companyId: number) {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) throw new BadRequestException('Empresa não encontrada');
  }

  private assertVisible(
    collaborator: Collaborator,
    currentUser?: { role: string; companyId: number | null },
  ) {
    if (currentUser && currentUser.role !== 'master') {
      if (collaborator.companyId !== currentUser.companyId) {
        throw new NotFoundException('Colaborador não encontrado');
      }
    }
  }

  async create(
    dto: CreateCollaboratorInput,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<Collaborator> {
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
    const nome =
      dto.nome || [dto.firstName, dto.lastName].filter(Boolean).join(' ') || undefined;

    const collaborator = this.collaboratorsRepository.create({
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
    const saved = await this.collaboratorsRepository.save(collaborator);
    if (!saved.codigo) {
      saved.codigo = saved.isFreelancer
        ? `FR-${String(saved.id).padStart(4, '0')}`
        : `COL-${String(saved.id).padStart(4, '0')}`;
      return this.collaboratorsRepository.save(saved);
    }
    return saved;
  }

  async findAllPaged(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      search?: string;
      isFreelancer?: boolean;
    },
    currentUser?: { role: string; companyId: number | null },
  ): Promise<{ data: Collaborator[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      isFreelancer,
    } = query;

    const qb = this.collaboratorsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.company', 'company');

    const isMaster = currentUser?.role === 'master';
    if (!isMaster) {
      qb.where('c.companyId = :companyId', { companyId: currentUser?.companyId ?? -1 });
    }

    if (isFreelancer !== undefined) {
      if (isMaster) {
        qb.where('c.isFreelancer = :isFreelancer', { isFreelancer });
      } else {
        qb.andWhere('c.isFreelancer = :isFreelancer', { isFreelancer });
      }
    }

    if (search) {
      const searchClause =
        'c.nome LIKE :search OR c.firstName LIKE :search OR c.lastName LIKE :search OR c.cpf LIKE :search OR c.email LIKE :search OR c.telefone LIKE :search OR c.cargo LIKE :search';
      const hasPriorWhere = !isMaster || isFreelancer !== undefined;
      if (hasPriorWhere) {
        qb.andWhere(`(${searchClause})`, { search: `%${search}%` });
      } else {
        qb.where(searchClause, { search: `%${search}%` });
      }
    }

    const allowedSort = [
      'id',
      'nome',
      'cpf',
      'cargo',
      'email',
      'telefone',
      'status',
      'createdAt',
      'firstName',
      'lastName',
      'hourlyRate',
      'experienceLevel',
      'availability',
    ];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getByIdOrFail(
    id: number,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<Collaborator> {
    const collaborator = await this.collaboratorsRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');
    this.assertVisible(collaborator, currentUser);
    return collaborator;
  }

  async update(
    id: number,
    dto: UpdateCollaboratorInput,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    Object.assign(collaborator, dto);
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      collaborator.nome =
        [dto.firstName ?? collaborator.firstName, dto.lastName ?? collaborator.lastName]
          .filter(Boolean)
          .join(' ') || collaborator.nome;
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

  async getFreelancerOrFail(
    id: number,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    if (!collaborator.isFreelancer) {
      throw new NotFoundException('Freelancer não encontrado');
    }
    return collaborator;
  }

  async delete(
    id: number,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<void> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    const result = await this.collaboratorsRepository.delete(collaborator.id);
    if (result.affected === 0) throw new NotFoundException('Colaborador não encontrado');
  }

  async updatePhoto(
    id: number,
    url: string,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id, currentUser);
    collaborator.foto = url;
    return this.collaboratorsRepository.save(collaborator);
  }

  async updateDocument(
    id: number,
    tipo: string,
    url: string,
    currentUser?: { role: string; companyId: number | null },
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
