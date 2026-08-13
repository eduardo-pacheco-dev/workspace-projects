import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Project } from './domain/project.entity';
import { ProjectDocument } from './domain/project-document.entity';
import {
  ProjectRepository,
  ProjectQuery,
  PaginatedProjects,
  CurrentUser,
  PROJECT_REPOSITORY,
} from './domain/project.repository';
import { generateProjectCodigo } from './domain/project-rules';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectsRepository: ProjectRepository,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    let saved = await this.projectsRepository.create(new Project({ ...dto }));
    if (!saved.codigo) {
      saved = await this.projectsRepository.save(
        new Project({ ...saved, codigo: generateProjectCodigo(saved.id ?? 0) }),
      );
    }
    return saved;
  }

  async findAll(query: ProjectQuery, currentUser?: CurrentUser): Promise<PaginatedProjects> {
    const companyId =
      currentUser && currentUser.role !== 'master' ? (currentUser.companyId ?? -1) : undefined;
    return this.projectsRepository.findAll({ ...query, companyId });
  }

  async findById(id: number): Promise<Project> {
    return this.ensureProject(id);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.ensureProject(id);
    Object.assign(project, dto);
    return this.projectsRepository.save(project);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.projectsRepository.delete(id);
    if (!deleted) throw new NotFoundException('Projeto não encontrado');
  }

  async findByCompany(companyId: number, query: ProjectQuery): Promise<PaginatedProjects> {
    return this.projectsRepository.findByCompany(companyId, query);
  }

  async findCompanies(projectId: number): Promise<Project['companies']> {
    await this.ensureProject(projectId);
    return this.projectsRepository.findRelation(projectId, 'companies');
  }

  async addCompany(projectId: number, companyId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const company = await this.projectsRepository.findRelatedEntity('company', companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada');

    const companies = await this.projectsRepository.findRelation(projectId, 'companies');
    if (!companies.some((item) => item.id === companyId)) {
      companies.push(company);
    }
    project.companies = companies;
    return this.projectsRepository.save(project);
  }

  async removeCompany(projectId: number, companyId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const companies = await this.projectsRepository.findRelation(projectId, 'companies');
    project.companies = companies.filter((item) => item.id !== companyId);
    return this.projectsRepository.save(project);
  }

  async findStations(projectId: number): Promise<Project['stations']> {
    await this.ensureProject(projectId);
    return this.projectsRepository.findRelation(projectId, 'stations');
  }

  async addStation(projectId: number, stationId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const station = await this.projectsRepository.findRelatedEntity('station', stationId);
    if (!station) throw new NotFoundException('Estação não encontrada');

    const stations = await this.projectsRepository.findRelation(projectId, 'stations');
    if (!stations.some((item) => item.id === stationId)) {
      stations.push(station);
    }
    project.stations = stations;
    return this.projectsRepository.save(project);
  }

  async removeStation(projectId: number, stationId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const stations = await this.projectsRepository.findRelation(projectId, 'stations');
    project.stations = stations.filter((item) => item.id !== stationId);
    return this.projectsRepository.save(project);
  }

  async findRadioLinks(projectId: number): Promise<Project['radioLinks']> {
    await this.ensureProject(projectId);
    return this.projectsRepository.findRelation(projectId, 'radioLinks');
  }

  async addRadioLink(projectId: number, radioLinkId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const radioLink = await this.projectsRepository.findRelatedEntity('radioLink', radioLinkId);
    if (!radioLink) throw new NotFoundException('Enlace de rádio não encontrado');

    const radioLinks = await this.projectsRepository.findRelation(projectId, 'radioLinks');
    if (!radioLinks.some((item) => item.id === radioLinkId)) {
      radioLinks.push(radioLink);
    }
    project.radioLinks = radioLinks;
    return this.projectsRepository.save(project);
  }

  async removeRadioLink(projectId: number, radioLinkId: number): Promise<Project> {
    const project = await this.ensureProject(projectId);
    const radioLinks = await this.projectsRepository.findRelation(projectId, 'radioLinks');
    project.radioLinks = radioLinks.filter((item) => item.id !== radioLinkId);
    return this.projectsRepository.save(project);
  }

  async findDocuments(projectId: number): Promise<ProjectDocument[]> {
    await this.ensureProject(projectId);
    return this.projectsRepository.findDocuments(projectId);
  }

  async createDocument(projectId: number, dto: CreateProjectDocumentDto): Promise<ProjectDocument> {
    await this.ensureProject(projectId);
    return this.projectsRepository.createDocument(
      new ProjectDocument({
        projectId,
        nome: dto.nome,
        tipo: dto.tipo,
        quantidade: dto.quantidade ?? 1,
        observacoes: dto.observacoes,
      }),
    );
  }

  async updateDocument(
    projectId: number,
    documentId: number,
    dto: UpdateProjectDocumentDto,
  ): Promise<ProjectDocument> {
    const document = await this.projectsRepository.findDocumentById(projectId, documentId);
    if (!document) throw new NotFoundException('Documento não encontrado');
    Object.assign(document, dto);
    if (dto.quantidade !== undefined) {
      document.quantidade = dto.quantidade;
    }
    return this.projectsRepository.saveDocument(document);
  }

  async deleteDocument(projectId: number, documentId: number): Promise<void> {
    const deleted = await this.projectsRepository.deleteDocument(projectId, documentId);
    if (!deleted) throw new NotFoundException('Documento não encontrado');
  }

  private async ensureProject(id: number): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project;
  }
}
