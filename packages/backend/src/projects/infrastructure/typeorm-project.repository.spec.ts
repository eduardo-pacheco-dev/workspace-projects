import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmProjectRepository } from './typeorm-project.repository';
import { ProjectEntity } from './project.entity';
import { ProjectDocumentEntity } from './project-document.entity';
import { StationEntity } from '../../stations/infrastructure/station.entity';
import { RadioLinkEntity } from '../../radio-links/infrastructure/radio-link.entity';
import { Company } from '../../companies/company.entity';
import { Project } from '../domain/project.entity';
import { ProjectDocument } from '../domain/project-document.entity';

describe('TypeOrmProjectRepository', () => {
  let repository: TypeOrmProjectRepository;
  let moduleRef: TestingModule;
  let projectRepo: Repository<ProjectEntity>;
  let companyRepo: Repository<Company>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ProjectEntity, ProjectDocumentEntity, StationEntity, RadioLinkEntity, Company],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          ProjectEntity,
          ProjectDocumentEntity,
          StationEntity,
          RadioLinkEntity,
          Company,
        ]),
      ],
      providers: [TypeOrmProjectRepository],
    }).compile();

    repository = moduleRef.get(TypeOrmProjectRepository);
    projectRepo = moduleRef.get<Repository<ProjectEntity>>(getRepositoryToken(ProjectEntity));
    companyRepo = moduleRef.get<Repository<Company>>(getRepositoryToken(Company));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await projectRepo.clear();
    await companyRepo.clear();
  });

  describe('findAll with company filter', () => {
    it('should filter projects by the given company', async () => {
      const company = await companyRepo.save({ nome: 'Empresa A' });
      const projectA = await projectRepo.save({ nome: 'Projeto A', status: 'ativo' });
      await projectRepo.save({ nome: 'Projeto B', status: 'ativo' });
      const project = await repository.findById(projectA.id);
      await repository.save(new Project({ ...project, companies: [{ id: company.id, nome: 'Empresa A' }] }));

      const { data, total } = await repository.findAll({ companyId: company.id });

      expect(total).toBe(1);
      expect(data[0].nome).toBe('Projeto A');
    });
  });

  describe('findByCompany', () => {
    it('should return only the projects linked to the company', async () => {
      const company = await companyRepo.save({ nome: 'Empresa A' });
      const linked = await projectRepo.save({ nome: 'Projeto A' });
      await projectRepo.save({ nome: 'Projeto B' });
      const project = await repository.findById(linked.id);
      await repository.save(new Project({ ...project, companies: [{ id: company.id }] }));

      const { data, total } = await repository.findByCompany(company.id, { limit: 10 });

      expect(total).toBe(1);
      expect(data[0].nome).toBe('Projeto A');
    });
  });

  describe('companies relation', () => {
    it('should find the related company by id and the relation of a project', async () => {
      const company = await companyRepo.save({ nome: 'Empresa A' });
      const project = await projectRepo.save({ nome: 'Projeto A' });
      await repository.save(new Project({ ...(await repository.findById(project.id)!), companies: [{ id: company.id }] }));

      const related = await repository.findRelatedEntity('company', company.id);
      expect(related).toEqual({ id: company.id, nome: 'Empresa A' });

      const relation = await repository.findRelation(project.id, 'companies');
      expect(relation).toHaveLength(1);
      expect(relation[0].id).toBe(company.id);
    });

    it('should return null when the related company does not exist', async () => {
      await expect(repository.findRelatedEntity('company', 999)).resolves.toBeNull();
    });
  });

  describe('documents', () => {
    it('should delete a document scoped to the project', async () => {
      const project = await projectRepo.save({ nome: 'Projeto A' });
      const doc = await repository.createDocument(
        new ProjectDocument({ projectId: project.id, nome: 'Contrato' }),
      );

      await expect(repository.deleteDocument(project.id, doc.id!)).resolves.toBe(true);
      await expect(repository.deleteDocument(project.id, doc.id!)).resolves.toBe(false);
    });
  });
});
