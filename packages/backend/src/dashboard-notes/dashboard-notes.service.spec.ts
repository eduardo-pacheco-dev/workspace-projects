import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardNoteEntity } from './dashboard-note.entity';
import { DashboardNotesService } from './dashboard-notes.service';

describe('DashboardNotesService', () => {
  let service: DashboardNotesService;
  let repo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };

  const makeNote = (overrides: Partial<DashboardNoteEntity> = {}) =>
    ({ id: 1, userId: 1, content: 'texto', ...overrides }) as DashboardNoteEntity;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn((note) => Promise.resolve(note)),
      create: jest.fn((props) => props),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardNotesService,
        { provide: getRepositoryToken(DashboardNoteEntity), useValue: repo },
      ],
    }).compile();

    service = module.get<DashboardNotesService>(DashboardNotesService);
  });

  it('should return empty content when no note exists', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findByUserId(1)).resolves.toEqual({ content: null });
    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
  });

  it('should return the stored content', async () => {
    repo.findOne.mockResolvedValue(makeNote({ content: 'anotação' }));

    await expect(service.findByUserId(1)).resolves.toEqual({ content: 'anotação' });
  });

  it('should update an existing note', async () => {
    const existing = makeNote({ content: 'antigo' });
    repo.findOne.mockResolvedValue(existing);

    const result = await service.save(1, 'novo');

    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ content: 'novo' });
  });

  it('should create a note when it does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockImplementation((note) => Promise.resolve(makeNote({ content: note.content })));

    const result = await service.save(1, 'novo');

    expect(repo.create).toHaveBeenCalledWith({ userId: 1, content: 'novo' });
    expect(result).toEqual({ content: 'novo' });
  });
});
