import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pdca } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';
import { CreatePdcaDto } from './dto/create-pdca.dto';
import { UpdatePdcaDto } from './dto/update-pdca.dto';
import { CreatePdcaActionDto } from './dto/create-pdca-action.dto';
import { UpdatePdcaActionDto } from './dto/update-pdca-action.dto';

export interface PdcaQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  projectId?: number;
  fase?: string;
  status?: string;
}

const FASE_ORDER = ['plan', 'do', 'check', 'act'];

const today = (): string => new Date().toISOString().slice(0, 10);

@Injectable()
export class PdcaService {
  constructor(
    @InjectRepository(Pdca)
    private readonly pdcaRepository: Repository<Pdca>,
    @InjectRepository(PdcaAction)
    private readonly actionsRepository: Repository<PdcaAction>,
  ) {}

  async create(dto: CreatePdcaDto): Promise<Pdca> {
    const pdca = this.pdcaRepository.create({
      ...dto,
      fase: dto.fase ?? 'plan',
      statusCiclo: dto.statusCiclo ?? 'aberto',
    });
    return this.pdcaRepository.save(pdca);
  }

  async findAll(query: PdcaQuery): Promise<{ data: Pdca[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      projectId,
      fase,
      status,
    } = query;

    const qb = this.pdcaRepository.createQueryBuilder('p');

    if (projectId) {
      qb.where('p.projectId = :projectId', { projectId });
    }

    if (search) {
      qb.andWhere('p.titulo LIKE :search OR p.problema LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (fase) {
      qb.andWhere('p.fase = :fase', { fase });
    }

    if (status) {
      qb.andWhere('p.statusCiclo = :status', { status });
    }

    const allowedSort = ['id', 'titulo', 'fase', 'statusCiclo', 'createdAt', 'dataVerificacao'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Pdca> {
    const pdca = await this.pdcaRepository.findOne({
      where: { id },
      relations: { actions: true },
      order: { actions: { createdAt: 'ASC' } },
    });
    if (!pdca) throw new NotFoundException('Ciclo PDCA não encontrado');

    await this.refreshOverdueStatus(id);
    pdca.actions = await this.actionsRepository.find({
      where: { pdcaId: id },
      order: { createdAt: 'ASC' },
    });
    this.attachOverdueFlag(pdca.actions);
    return pdca;
  }

  async update(id: number, dto: UpdatePdcaDto): Promise<Pdca> {
    const pdca = await this.pdcaRepository.findOne({ where: { id } });
    if (!pdca) throw new NotFoundException('Ciclo PDCA não encontrado');

    if (dto.fase && dto.fase !== pdca.fase) {
      await this.validateTransition(pdca, dto.fase);
      pdca.fase = dto.fase;
      pdca.statusCiclo = this.statusFromFase(dto.fase);
    }

    Object.assign(pdca, dto);

    if (pdca.statusCiclo === 'concluido' && !pdca.dataConclusao) {
      pdca.dataConclusao = today();
    }

    const saved = await this.pdcaRepository.save(pdca);
    if (dto.fase && dto.fase !== saved.fase) {
      saved.actions = await this.actionsRepository.find({
        where: { pdcaId: id },
        order: { createdAt: 'ASC' },
      });
      this.attachOverdueFlag(saved.actions);
    }
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.pdcaRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Ciclo PDCA não encontrado');
  }

  async restart(id: number): Promise<Pdca> {
    const source = await this.pdcaRepository.findOne({ where: { id } });
    if (!source) throw new NotFoundException('Ciclo PDCA não encontrado');

    const novo = this.pdcaRepository.create({
      projectId: source.projectId,
      titulo: `Novo ciclo: ${source.titulo}`,
      problema: source.problema,
      impacto: source.impacto,
      areaSetor: source.areaSetor,
      responsavelCiclo: source.responsavelCiclo,
      tecnicaAnalise: source.tecnicaAnalise,
      cicloPaiId: source.id,
      fase: 'plan',
      statusCiclo: 'aberto',
    });
    return this.pdcaRepository.save(novo);
  }

  async findActions(pdcaId: number): Promise<PdcaAction[]> {
    await this.ensurePdca(pdcaId);
    await this.refreshOverdueStatus(pdcaId);
    const actions = await this.actionsRepository.find({
      where: { pdcaId },
      order: { createdAt: 'ASC' },
    });
    this.attachOverdueFlag(actions);
    return actions;
  }

  async createAction(pdcaId: number, dto: CreatePdcaActionDto): Promise<PdcaAction> {
    await this.ensurePdca(pdcaId);
    const action = this.actionsRepository.create({
      ...dto,
      pdcaId,
      status: dto.status ?? 'pendente',
      progresso: dto.progresso ?? 0,
    });
    return this.actionsRepository.save(action);
  }

  async updateAction(
    pdcaId: number,
    actionId: number,
    dto: UpdatePdcaActionDto,
  ): Promise<PdcaAction> {
    await this.ensurePdca(pdcaId);
    const action = await this.actionsRepository.findOne({ where: { id: actionId, pdcaId } });
    if (!action) throw new NotFoundException('Ação não encontrada');

    Object.assign(action, dto);

    if (action.status === 'concluido' && !action.dataConclusaoReal) {
      action.dataConclusaoReal = today();
    }
    if (action.status === 'em_andamento' && !action.dataInicioReal) {
      action.dataInicioReal = today();
    }
    if (action.status !== 'concluido' && action.status !== 'cancelado' && !action.dataConclusaoReal) {
      action.dataConclusaoReal = null;
    }
    if (this.isOverdue(action) && action.status !== 'concluido' && action.status !== 'cancelado') {
      action.status = 'atrasado';
    }

    const saved = await this.actionsRepository.save(action);
    saved.atrasado = this.isOverdue(saved);
    return saved;
  }

  async deleteAction(pdcaId: number, actionId: number): Promise<void> {
    await this.ensurePdca(pdcaId);
    const result = await this.actionsRepository.delete({ id: actionId, pdcaId });
    if (result.affected === 0) throw new NotFoundException('Ação não encontrada');
  }

  private async ensurePdca(pdcaId: number): Promise<Pdca> {
    const pdca = await this.pdcaRepository.findOne({ where: { id: pdcaId } });
    if (!pdca) throw new NotFoundException('Ciclo PDCA não encontrado');
    return pdca;
  }

  private statusFromFase(fase: string): string {
    switch (fase) {
      case 'plan':
        return 'aberto';
      case 'do':
        return 'em_execucao';
      case 'check':
        return 'em_verificacao';
      case 'act':
        return 'em_verificacao';
      default:
        return 'aberto';
    }
  }

  private async validateTransition(pdca: Pdca, newFase: string): Promise<void> {
    const currentIdx = FASE_ORDER.indexOf(pdca.fase);
    const newIdx = FASE_ORDER.indexOf(newFase);
    if (newIdx <= currentIdx) return;

    if (newFase === 'do') {
      if (!pdca.causaRaiz) {
        throw new BadRequestException(
          'Para avançar para Do, preencha a análise da causa raiz (etapa Plan).',
        );
      }
      const count = await this.actionsRepository.count({ where: { pdcaId: pdca.id } });
      if (count === 0) {
        throw new BadRequestException(
          'Para avançar para Do, crie ao menos uma ação no plano de ação (5W2H).',
        );
      }
    }

    if (newFase === 'check') {
      const concluidas = await this.actionsRepository.count({
        where: { pdcaId: pdca.id, status: 'concluido' },
      });
      if (concluidas === 0) {
        throw new BadRequestException(
          'Para avançar para Check, ao menos uma ação do plano deve estar concluída.',
        );
      }
    }

    if (newFase === 'act') {
      if (!pdca.resultadoCheck) {
        throw new BadRequestException(
          'Para avançar para Act, preencha a avaliação de resultados (etapa Check).',
        );
      }
      if (!pdca.statusValidacao) {
        throw new BadRequestException(
          'Para avançar para Act, defina o status da validação (etapa Check).',
        );
      }
    }
  }

  private isOverdue(action: PdcaAction): boolean {
    return (
      !!action.whenPrazo &&
      action.whenPrazo < today() &&
      action.status !== 'concluido' &&
      action.status !== 'cancelado'
    );
  }

  private async refreshOverdueStatus(pdcaId: number): Promise<void> {
    const actions = await this.actionsRepository.find({ where: { pdcaId } });
    for (const action of actions) {
      if (this.isOverdue(action) && action.status !== 'atrasado') {
        action.status = 'atrasado';
        await this.actionsRepository.save(action);
      }
    }
  }

  private attachOverdueFlag(actions: PdcaAction[]): void {
    for (const action of actions) {
      action.atrasado = this.isOverdue(action);
    }
  }
}
