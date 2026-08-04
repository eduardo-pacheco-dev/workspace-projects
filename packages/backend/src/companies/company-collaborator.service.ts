import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyCollaborator } from './company-collaborator.entity';
import { CompanyService } from './company.service';
import {
  CreateCompanyCollaboratorInput,
  UpdateCompanyCollaboratorInput,
} from './company.schemas';

@Injectable()
export class CompanyCollaboratorService {
  constructor(
    @InjectRepository(CompanyCollaborator)
    private readonly collaboratorRepository: Repository<CompanyCollaborator>,
    private readonly companyService: CompanyService,
  ) {}

  private async ensureCompany(companyId: number) {
    await this.companyService.findById(companyId);
  }

  async create(
    companyId: number,
    dto: CreateCompanyCollaboratorInput,
  ): Promise<CompanyCollaborator> {
    await this.ensureCompany(companyId);
    const collaborator = this.collaboratorRepository.create({
      companyId,
      ...dto,
      ativo: dto.ativo ?? true,
    });
    return this.collaboratorRepository.save(collaborator);
  }

  async findAll(
    companyId: number,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      search?: string;
    },
  ): Promise<{ data: CompanyCollaborator[]; total: number }> {
    await this.ensureCompany(companyId);
    const {
      page = 1,
      limit = 10,
      sortBy = 'nome',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.collaboratorRepository
      .createQueryBuilder('cc')
      .where('cc.companyId = :companyId', { companyId });

    if (search) {
      qb.andWhere(
        'cc.nome LIKE :search OR cc.cargo LIKE :search OR cc.email LIKE :search',
        { search: `%${search}%` },
      );
    }

    const allowedSort = ['id', 'nome', 'cargo', 'email', 'telefone', 'ativo', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'nome';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`cc.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(companyId: number, id: number): Promise<CompanyCollaborator> {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id, companyId },
    });
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');
    return collaborator;
  }

  async update(
    companyId: number,
    id: number,
    dto: UpdateCompanyCollaboratorInput,
  ): Promise<CompanyCollaborator> {
    const collaborator = await this.findById(companyId, id);
    Object.assign(collaborator, dto);
    return this.collaboratorRepository.save(collaborator);
  }

  async delete(companyId: number, id: number): Promise<void> {
    const result = await this.collaboratorRepository.delete({ id, companyId });
    if (result.affected === 0) {
      throw new NotFoundException('Colaborador não encontrado');
    }
  }
}
