import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { Attachment } from './attachment.entity';
import { ProjectsService } from '../projects/projects.service';
import * as fs from 'fs';
import * as path from 'path';

describe('AttachmentsService', () => {
  let service: AttachmentsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const projectsService = {
    findById: jest.fn(),
    findCompanies: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    projectsService.findById.mockResolvedValue({ id: 1, cliente: 'Cliente Teste' });
    projectsService.findCompanies.mockResolvedValue([{ id: 3, nome: 'Empresa Teste' }]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: getRepositoryToken(Attachment), useValue: repo },
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = moduleRef.get(AttachmentsService);
  });

  describe('uploadForProject', () => {
    const file = { originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100, buffer: Buffer.from('x') } as Express.Multer.File;

    it('should upload a file to the project root', async () => {
      const saved = { id: 1, projectId: 1, folderId: null, isFolder: false };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.uploadForProject(1, file, null);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 1, folderId: null, isFolder: false, originalName: 'doc.pdf' }),
      );
      expect(result.folderId).toBeNull();
    });

    it('should upload a file into a specific folder', async () => {
      const saved = { id: 1, projectId: 1, folderId: 5, isFolder: false };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      repo.findOne.mockResolvedValue({
        id: 5,
        folderId: null,
        originalName: 'Contratos',
        isFolder: true,
      });

      const result = await service.uploadForProject(1, file, 5);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ folderId: 5 }));
      expect(result.folderId).toBe(5);
    });
  });

  describe('createFolder', () => {
    it('should create a folder at root', async () => {
      const folder = { id: 2, projectId: 1, folderId: null, isFolder: true, originalName: 'Contratos' };
      repo.create.mockReturnValue(folder);
      repo.save.mockResolvedValue(folder);

      const result = await service.createFolder(1, { nome: 'Contratos' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 1,
          folderId: null,
          isFolder: true,
          originalName: 'Contratos',
          mimetype: 'folder',
          size: 0,
        }),
      );
      expect(result.isFolder).toBe(true);
    });

    it('should create a nested folder', async () => {
      const folder = { id: 3, projectId: 1, folderId: 2, isFolder: true, originalName: 'Sub' };
      repo.create.mockReturnValue(folder);
      repo.save.mockImplementation(async (f) => f);

      const result = await service.createFolder(1, { nome: 'Sub', folderId: 2 });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ folderId: 2 }));
      expect(result.folderId).toBe(2);
    });
  });

  describe('findByProject', () => {
    it('should return all attachments when no folderId is provided', async () => {
      const items = [{ id: 1 }, { id: 2 }];
      repo.find.mockResolvedValue(items);

      const result = await service.findByProject(1);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 1 } }),
      );
      expect(result).toEqual(items);
    });

    it('should filter by root folder when folderId is root', async () => {
      repo.find.mockResolvedValue([]);

      await service.findByProject(1, { folderId: 'root' });

      const where = repo.find.mock.calls[0][0].where;
      expect(where.projectId).toBe(1);
      expect(where.folderId?._type).toBe('isNull');
    });

    it('should filter by a specific folder', async () => {
      repo.find.mockResolvedValue([]);

      await service.findByProject(1, { folderId: 7 });

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 1, folderId: 7 } }),
      );
    });
  });

  describe('update', () => {
    it('should rename a file keeping the physical filename', async () => {
      const file = { id: 1, originalName: 'old.txt', filename: 'old.txt', isFolder: false };
      repo.findOne.mockResolvedValue(file);
      repo.save.mockImplementation(async (a) => a);

      const result = await service.update(1, { originalName: 'new.txt' });

      expect(result.originalName).toBe('new.txt');
      expect(result.filename).toBe('old.txt');
    });

    it('should rename a folder updating the folder name', async () => {
      const folder = { id: 2, originalName: 'Pasta', filename: 'Pasta', isFolder: true };
      repo.findOne.mockResolvedValue(folder);
      repo.save.mockImplementation(async (a) => a);

      const result = await service.update(2, { originalName: 'Pasta Nova' });

      expect(result.originalName).toBe('Pasta Nova');
      expect(result.filename).toBe('Pasta Nova');
    });

    it('should move an item to another folder', async () => {
      const item = { id: 3, originalName: 'a.txt', filename: 'a.txt', isFolder: false, folderId: null };
      repo.findOne.mockResolvedValue(item);
      repo.save.mockImplementation(async (a) => a);

      const result = await service.update(3, { folderId: 9 });

      expect(result.folderId).toBe(9);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { originalName: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a file and remove its physical file', async () => {
      const file = { id: 1, projectId: 1, folderId: null, isFolder: false, filename: 'doc.txt' };
      repo.findOne.mockResolvedValue(file);
      repo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('should recursively delete a folder and all descendants', async () => {
      const folder = { id: 10, projectId: 1, folderId: null, isFolder: true, originalName: 'Contratos', filename: 'Contratos' };
      const childFile = { id: 11, projectId: 1, folderId: 10, isFolder: false, originalName: 'a.pdf', filename: 'a.pdf' };
      const childFolder = { id: 12, projectId: 1, folderId: 10, isFolder: true, originalName: 'Sub', filename: 'Sub' };

      repo.findOne.mockImplementation(async ({ where }: any) => {
        const id = where?.id
        if (id === 10) return folder
        if (id === 11) return childFile
        if (id === 12) return childFolder
        return null
      })
      repo.find
        .mockResolvedValueOnce([childFile, childFolder])
        .mockResolvedValueOnce([]);
      repo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(10);

      expect(repo.delete).toHaveBeenCalledWith(11);
      expect(repo.delete).toHaveBeenCalledWith(12);
      expect(repo.delete).toHaveBeenCalledWith(10);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('organizeProject', () => {
    it('should return early when there are no root files', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.organizeProject(1);

      expect(result).toEqual({ organized: 0, folders: [] });
      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('should group root files by type into folders', async () => {
      const img = { id: 1, projectId: 1, folderId: null, isFolder: false, mimetype: 'image/png' };
      const pdf = { id: 2, projectId: 1, folderId: null, isFolder: false, mimetype: 'application/pdf' };
      const doc = { id: 3, projectId: 1, folderId: null, isFolder: false, mimetype: 'text/plain' };
      repo.find.mockResolvedValue([img, pdf, doc]);

      repo.findOne.mockResolvedValue(null);
      let folderId = 10;
      repo.create.mockImplementation((data) => ({ ...data }));
      repo.save.mockImplementation(async (x) => {
        if (Array.isArray(x)) return x;
        if (!x.id) x.id = folderId++;
        return x;
      });

      const result = await service.organizeProject(1);

      expect(result.organized).toBe(3);
      expect(result.folders).toEqual(['Imagens', 'PDFs', 'Documentos']);
      expect(img.folderId).toBe(10);
      expect(pdf.folderId).toBe(11);
      expect(doc.folderId).toBe(12);
    });

    it('should reuse existing root folders of the same name', async () => {
      const img = { id: 1, projectId: 1, folderId: null, isFolder: false, mimetype: 'image/jpeg' };
      repo.find.mockResolvedValue([img]);
      const existing = { id: 20, projectId: 1, isFolder: true, originalName: 'Imagens' };
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockImplementation(async (x) => x);

      const result = await service.organizeProject(1);

      expect(result.organized).toBe(1);
      expect(result.folders).toEqual([]);
      expect(img.folderId).toBe(20);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('resolvePhysicalPath', () => {
    it('should resolve the hierarchical path for a project attachment', async () => {
      const attachment = { id: 1, projectId: 1, filename: 'relatorio.pdf' } as Attachment;
      const dir = path.resolve(
        'uploads',
        'empresa-3-empresa-teste',
        'cliente-cliente-teste',
        'projeto-1',
      );
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'relatorio.pdf');
      fs.writeFileSync(file, 'x');

      const result = await service.resolvePhysicalPath(attachment);

      expect(result).toBe(file);
    });

    it('should prefer the hierarchical flat path when no folder and no file exists', async () => {
      const attachment = { id: 2, projectId: 1, filename: 'ausente.pdf' } as Attachment;

      const result = await service.resolvePhysicalPath(attachment);

      expect(result).toBe(
        path.resolve(
          'uploads',
          'empresa-3-empresa-teste',
          'cliente-cliente-teste',
          'projeto-1',
          'ausente.pdf',
        ),
      );
    });

    it('should use the legacy path for non-project attachments', async () => {
      const attachment = { id: 3, taskId: 9, filename: 'doc.txt' } as Attachment;

      const result = await service.resolvePhysicalPath(attachment);

      expect(result).toBe(path.resolve('uploads', 'task-9', 'doc.txt'));
    });
  });

  describe('streamFolderZip', () => {
    const folder = { id: 5, projectId: 1, folderId: null, isFolder: true, originalName: 'Contratos', filename: 'Contratos' };
    const file1 = { id: 21, projectId: 1, folderId: 5, isFolder: false, originalName: 'a.pdf', filename: 'a.pdf' };
    const res = { setHeader: jest.fn(), send: jest.fn() };

    it('should throw BadRequestException when the item is not a folder', async () => {
      repo.findOne.mockResolvedValue({ id: 6, isFolder: false });

      await expect(service.streamFolderZip(6, res as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the folder is empty', async () => {
      repo.findOne.mockResolvedValue(folder);
      repo.find.mockResolvedValue([]);

      await expect(service.streamFolderZip(5, res as any)).rejects.toThrow(NotFoundException);
    });

    it('should build a zip with the folder contents and send it', async () => {
      repo.findOne.mockImplementation(async ({ where }: any) => {
        const id = where?.id
        return id === 5 ? folder : null
      })
      repo.find.mockResolvedValue([file1]);

      await service.streamFolderZip(5, res as any);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="pasta-Contratos.zip"',
      );
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    });
  });

  afterAll(() => {
    const dir = path.resolve('uploads');
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
