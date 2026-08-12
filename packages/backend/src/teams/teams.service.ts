import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';
import {
  CreateTeamInput,
  UpdateTeamInput,
} from './schemas/team.schemas';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly membersRepository: Repository<TeamMember>,
    @InjectRepository(CollaboratorEntity)
    private readonly collaboratorsRepository: Repository<CollaboratorEntity>,
  ) {}

  async create(dto: CreateTeamInput): Promise<Team> {
    const team = this.teamsRepository.create({
      ...dto,
      status: dto.status ?? 'ativo',
    });
    return this.teamsRepository.save(team);
  }

  async findAllPaged(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
  }): Promise<{ data: Team[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'nome',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.teamsRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.members', 'members')
      .leftJoinAndSelect('members.collaborator', 'collaborator');

    if (search) {
      qb.where('t.nome LIKE :search OR t.descricao LIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedSort = ['id', 'nome', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'nome';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`t.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  private async getTeamOrFail(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('Equipe não encontrada');
    return team;
  }

  async findById(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: { members: { collaborator: true } },
    });
    if (!team) throw new NotFoundException('Equipe não encontrada');
    return team;
  }

  async update(id: number, dto: UpdateTeamInput): Promise<Team> {
    const team = await this.getTeamOrFail(id);
    Object.assign(team, dto);
    const saved = await this.teamsRepository.save(team);
    return this.findById(saved.id);
  }

  async delete(id: number): Promise<void> {
    const team = await this.getTeamOrFail(id);
    const result = await this.teamsRepository.delete(team.id);
    if (result.affected === 0) throw new NotFoundException('Equipe não encontrada');
  }

  async addMember(teamId: number, collaboratorId: number): Promise<TeamMember> {
    await this.getTeamOrFail(teamId);
    const collaborator = await this.collaboratorsRepository.findOne({
      where: { id: collaboratorId },
    });
    if (!collaborator) throw new NotFoundException('Colaborador não encontrado');

    const existing = await this.membersRepository.findOne({
      where: { teamId, collaboratorId },
    });
    if (existing) {
      throw new ConflictException('Colaborador já está na equipe');
    }

    const member = this.membersRepository.create({ teamId, collaboratorId });
    return this.membersRepository.save(member);
  }

  async removeMember(teamId: number, collaboratorId: number): Promise<void> {
    const result = await this.membersRepository.delete({ teamId, collaboratorId });
    if (result.affected === 0) {
      throw new NotFoundException('Membro não encontrado na equipe');
    }
  }
}
