import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

export interface ProjectQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  cliente?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(dto);
    const saved = await this.projectsRepository.save(project);
    if (!saved.codigo) {
      saved.codigo = `PRJ-${String(saved.id).padStart(4, '0')}`;
      return this.projectsRepository.save(saved);
    }
    return saved;
  }

  async findAll(query: ProjectQuery): Promise<{ data: Project[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      cliente,
    } = query;

    const qb = this.projectsRepository.createQueryBuilder('p');

    if (search) {
      qb.where(
        'p.nome LIKE :search OR p.codigo LIKE :search OR p.cliente LIKE :search OR p.descricao LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('p.status = :status', { status });
    }

    if (cliente) {
      qb.andWhere('p.cliente = :cliente', { cliente });
    }

    const allowedSort = ['id', 'nome', 'codigo', 'cliente', 'status', 'dataInicio', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    Object.assign(project, dto);
    return this.projectsRepository.save(project);
  }

  async delete(id: number): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Projeto não encontrado');
  }
}
