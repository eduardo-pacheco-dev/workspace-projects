import { Project, ProjectRelationItem } from './project.entity';
import { ProjectDocument } from './project-document.entity';

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

export interface CurrentUser {
  role: string;
  companyId: number | null;
}

export interface ProjectQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  cliente?: string;
  companyId?: number;
}

export interface PaginatedProjects {
  data: Project[];
  total: number;
}

export type ProjectRelation = 'companies' | 'stations' | 'radioLinks';
export type RelatedEntityKind = 'company' | 'station' | 'radioLink';

export interface ProjectRepository {
  create(project: Project): Promise<Project>;
  save(project: Project): Promise<Project>;
  findAll(query: ProjectQuery): Promise<PaginatedProjects>;
  findByCompany(companyId: number, query: ProjectQuery): Promise<PaginatedProjects>;
  findById(id: number): Promise<Project | null>;
  delete(id: number): Promise<boolean>;
  findRelation(projectId: number, relation: ProjectRelation): Promise<ProjectRelationItem[]>;
  findRelatedEntity(kind: RelatedEntityKind, id: number): Promise<ProjectRelationItem | null>;
  findDocuments(projectId: number): Promise<ProjectDocument[]>;
  createDocument(document: ProjectDocument): Promise<ProjectDocument>;
  findDocumentById(projectId: number, documentId: number): Promise<ProjectDocument | null>;
  saveDocument(document: ProjectDocument): Promise<ProjectDocument>;
  deleteDocument(projectId: number, documentId: number): Promise<boolean>;
}
