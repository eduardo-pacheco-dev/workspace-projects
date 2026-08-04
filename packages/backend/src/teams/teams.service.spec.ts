import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Collaborator } from '../collaborators/collaborator.entity';

describe('TeamsService', () => {
  let service: TeamsService;

  const teamsRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const membersRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const collaboratorsRepo = {
    findOne: jest.fn(),
  };

  const buildQueryBuilder = (data: Team[], total: number) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, total]),
    };
    return qb;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: teamsRepo },
        { provide: getRepositoryToken(TeamMember), useValue: membersRepo },
        { provide: getRepositoryToken(Collaborator), useValue: collaboratorsRepo },
      ],
    }).compile();

    service = moduleRef.get(TeamsService);
  });

  describe('create', () => {
    it('should create a team with ativo default', async () => {
      const saved = { id: 1, nome: 'Equipe Norte', status: 'ativo' };
      teamsRepo.create.mockReturnValue(saved);
      teamsRepo.save.mockResolvedValue(saved);

      const result = await service.create({ nome: 'Equipe Norte' });

      expect(teamsRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'ativo' }));
      expect(result).toEqual(saved);
    });

    it('should keep the provided status', async () => {
      const saved = { id: 1, nome: 'Equipe', status: 'inativo' };
      teamsRepo.create.mockReturnValue(saved);
      teamsRepo.save.mockResolvedValue(saved);

      await service.create({ nome: 'Equipe', status: 'inativo' });

      expect(teamsRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'inativo' }));
    });
  });

  describe('findAllPaged', () => {
    it('should list teams with members', async () => {
      const data = [{ id: 1, nome: 'Equipe Norte', members: [] }] as unknown as Team[];
      const qb = buildQueryBuilder(data, 1);
      teamsRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllPaged({ page: 1, limit: 10 });

      expect(teamsRepo.createQueryBuilder).toHaveBeenCalledWith('t');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('t.members', 'members');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search', async () => {
      const qb = buildQueryBuilder([], 0);
      teamsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ search: 'norte' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('t.nome LIKE :search'),
        { search: '%norte%' },
      );
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      teamsRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ sortBy: 'descricao;DROP', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('t.nome', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the team with members and collaborators', async () => {
      const team = { id: 1, nome: 'Equipe', members: [] };
      teamsRepo.findOne.mockResolvedValue(team);

      await expect(service.findById(1)).resolves.toEqual(team);
      expect(teamsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { members: { collaborator: true } },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      teamsRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the team', async () => {
      const team = { id: 1, nome: 'Antiga', status: 'ativo' };
      const updated = { ...team, nome: 'Nova' };
      teamsRepo.findOne
        .mockResolvedValueOnce(team)
        .mockResolvedValueOnce(updated);
      teamsRepo.save.mockResolvedValue(updated);

      const result = await service.update(1, { nome: 'Nova' });

      expect(result.nome).toBe('Nova');
    });

    it('should throw NotFoundException for missing team', async () => {
      teamsRepo.findOne.mockResolvedValue(null);
      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing team', async () => {
      teamsRepo.findOne.mockResolvedValue({ id: 1 });
      teamsRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when team does not exist', async () => {
      teamsRepo.findOne.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMember', () => {
    it('should add a member', async () => {
      teamsRepo.findOne.mockResolvedValue({ id: 1 });
      collaboratorsRepo.findOne.mockResolvedValue({ id: 5 });
      membersRepo.findOne.mockResolvedValue(null);
      const member = { id: 1, teamId: 1, collaboratorId: 5 };
      membersRepo.create.mockReturnValue(member);
      membersRepo.save.mockResolvedValue(member);

      const result = await service.addMember(1, 5);

      expect(result).toEqual(member);
    });

    it('should throw when team not found', async () => {
      teamsRepo.findOne.mockResolvedValue(null);
      await expect(service.addMember(99, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw when collaborator not found', async () => {
      teamsRepo.findOne.mockResolvedValue({ id: 1 });
      collaboratorsRepo.findOne.mockResolvedValue(null);
      await expect(service.addMember(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should throw Conflict when member already added', async () => {
      teamsRepo.findOne.mockResolvedValue({ id: 1 });
      collaboratorsRepo.findOne.mockResolvedValue({ id: 5 });
      membersRepo.findOne.mockResolvedValue({ id: 1, teamId: 1, collaboratorId: 5 });

      await expect(service.addMember(1, 5)).rejects.toThrow(ConflictException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      membersRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.removeMember(1, 5)).resolves.toBeUndefined();
    });

    it('should throw when member not found', async () => {
      membersRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.removeMember(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
