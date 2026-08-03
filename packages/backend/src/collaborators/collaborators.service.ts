import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from './collaborator.entity';
import {
  CreateCollaboratorInput,
  UpdateCollaboratorInput,
} from './schemas/collaborator.schemas';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorsRepository: Repository<Collaborator>,
  ) {}

  async create(dto: CreateCollaboratorInput): Promise<Collaborator> {
    const collaborator = this.collaboratorsRepository.create({
      nome: dto.nome,
      cpf: dto.cpf ?? null,
      cargo: dto.cargo ?? null,
      email: dto.email ?? null,
      telefone: dto.telefone ?? null,
      endereco: dto.endereco ?? null,
      cidade: dto.cidade ?? null,
      uf: dto.uf ?? null,
      dataAdmissao: dto.dataAdmissao ?? null,
      status: dto.status ?? 'ativo',
    });
    const saved = await this.collaboratorsRepository.save(collaborator);
    if (!saved.codigo) {
      saved.codigo = `COL-${String(saved.id).padStart(4, '0')}`;
      return this.collaboratorsRepository.save(saved);
    }
    return saved;
  }

  async findAllPaged(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
  }): Promise<{ data: Collaborator[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.collaboratorsRepository.createQueryBuilder('c');

    if (search) {
      qb.where(
        'c.nome LIKE :search OR c.cpf LIKE :search OR c.email LIKE :search OR c.telefone LIKE :search OR c.cargo LIKE :search',
        { search: `%${search}%` },
      );
    }

    const allowedSort = ['id', 'nome', 'cpf', 'cargo', 'email', 'telefone', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getByIdOrFail(id: number): Promise<Collaborator> {
    const collaborator = await this.collaboratorsRepository.findOne({ where: { id } });
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');
    return collaborator;
  }

  async update(id: number, dto: UpdateCollaboratorInput): Promise<Collaborator> {
    const collaborator = await this.getByIdOrFail(id);
    Object.assign(collaborator, dto);
    return this.collaboratorsRepository.save(collaborator);
  }

  async delete(id: number): Promise<void> {
    const result = await this.collaboratorsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Colaborador não encontrado');
  }
}
