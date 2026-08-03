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

  async findAll(companyId: number): Promise<CompanyCollaborator[]> {
    await this.ensureCompany(companyId);
    return this.collaboratorRepository.find({
      where: { companyId },
      order: { nome: 'ASC' },
    });
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
