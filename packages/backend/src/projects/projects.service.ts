import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectDocument } from './project-document.entity';
import { Station } from '../stations/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Company } from '../companies/company.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';

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
    @InjectRepository(Station)
    private readonly stationsRepository: Repository<Station>,
    @InjectRepository(RadioLink)
    private readonly radioLinksRepository: Repository<RadioLink>,
    @InjectRepository(ProjectDocument)
    private readonly projectDocumentsRepository: Repository<ProjectDocument>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
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

  async findAll(
    query: ProjectQuery,
    currentUser?: { role: string; companyId: number | null },
  ): Promise<{ data: Project[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      cliente,
    } = query;

    const qb = this.projectsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.companies', 'companies');

    if (currentUser && currentUser.role !== 'master') {
      qb.innerJoin('p.companies', 'userCompany').andWhere('userCompany.id = :companyId', {
        companyId: currentUser?.companyId ?? -1,
      });
    }

    if (search) {
      qb.andWhere(
        'p.nome LIKE :search OR p.codigo LIKE :search OR p.cliente LIKE :search OR p.responsavel LIKE :search OR p.descricao LIKE :search',
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

  async findByCompany(
    companyId: number,
    query: ProjectQuery,
  ): Promise<{ data: Project[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.projectsRepository
      .createQueryBuilder('p')
      .innerJoin('p.companies', 'c')
      .where('c.id = :companyId', { companyId });

    if (search) {
      qb.andWhere(
        'p.nome LIKE :search OR p.codigo LIKE :search OR p.cliente LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('p.status = :status', { status });
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

  async findCompanies(projectId: number): Promise<Company[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['companies'],
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project.companies;
  }

  async addCompany(projectId: number, companyId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Empresa não encontrada');

    const companies = await this.findCompanies(projectId);
    if (!companies.some((c) => c.id === companyId)) {
      companies.push(company);
    }
    project.companies = companies;
    return this.projectsRepository.save(project);
  }

  async removeCompany(projectId: number, companyId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const companies = await this.findCompanies(projectId);
    project.companies = companies.filter((c) => c.id !== companyId);
    return this.projectsRepository.save(project);
  }

  async addStation(projectId: number, stationId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const station = await this.stationsRepository.findOne({ where: { id: stationId } });
    if (!station) throw new NotFoundException('Estação não encontrada');

    const stations = await this.findStations(projectId);
    if (!stations.some((s) => s.id === stationId)) {
      stations.push(station);
    }
    project.stations = stations;
    return this.projectsRepository.save(project);
  }

  async removeStation(projectId: number, stationId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const stations = await this.findStations(projectId);
    project.stations = stations.filter((s) => s.id !== stationId);
    return this.projectsRepository.save(project);
  }

  async findStations(projectId: number): Promise<Station[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['stations'],
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project.stations;
  }

  async addRadioLink(projectId: number, radioLinkId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const radioLink = await this.radioLinksRepository.findOne({ where: { id: radioLinkId } });
    if (!radioLink) throw new NotFoundException('Enlace de rádio não encontrado');

    const radioLinks = await this.findRadioLinks(projectId);
    if (!radioLinks.some((rl) => rl.id === radioLinkId)) {
      radioLinks.push(radioLink);
    }
    project.radioLinks = radioLinks;
    return this.projectsRepository.save(project);
  }

  async removeRadioLink(projectId: number, radioLinkId: number): Promise<Project> {
    const project = await this.findById(projectId);
    const radioLinks = await this.findRadioLinks(projectId);
    project.radioLinks = radioLinks.filter((rl) => rl.id !== radioLinkId);
    return this.projectsRepository.save(project);
  }

  async findRadioLinks(projectId: number): Promise<RadioLink[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['radioLinks'],
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project.radioLinks;
  }

  async findDocuments(projectId: number): Promise<ProjectDocument[]> {
    await this.findById(projectId);
    return this.projectDocumentsRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async createDocument(projectId: number, dto: CreateProjectDocumentDto): Promise<ProjectDocument> {
    await this.findById(projectId);
    const doc = this.projectDocumentsRepository.create({
      projectId,
      nome: dto.nome,
      tipo: dto.tipo,
      quantidade: dto.quantidade ?? 1,
      observacoes: dto.observacoes,
    });
    return this.projectDocumentsRepository.save(doc);
  }

  async updateDocument(
    projectId: number,
    docId: number,
    dto: UpdateProjectDocumentDto,
  ): Promise<ProjectDocument> {
    const doc = await this.projectDocumentsRepository.findOne({ where: { id: docId, projectId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    Object.assign(doc, dto, dto.quantidade == null ? {} : { quantidade: dto.quantidade });
    return this.projectDocumentsRepository.save(doc);
  }

  async deleteDocument(projectId: number, docId: number): Promise<void> {
    const doc = await this.projectDocumentsRepository.findOne({ where: { id: docId, projectId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    await this.projectDocumentsRepository.delete(docId);
  }
}
