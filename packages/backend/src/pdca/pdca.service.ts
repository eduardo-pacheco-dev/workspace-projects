import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Pdca } from './domain/pdca.entity';
import { PdcaAction } from './domain/pdca-action.entity';
import {
  PdcaRepository,
  PdcaQuery,
  PaginatedPdcas,
  PDCA_REPOSITORY,
} from './domain/pdca.repository';
import {
  applyActionStatusTimestamps,
  applyCycleConclusionDate,
  attachOverdueFlags,
  buildRestartProps,
  isActionOverdue,
  statusFromFase,
  validateTransition as validateTransitionRule,
} from './domain/pdca-rules';
import { CreatePdcaDto } from './dto/create-pdca.dto';
import { UpdatePdcaDto } from './dto/update-pdca.dto';
import { CreatePdcaActionDto } from './dto/create-pdca-action.dto';
import { UpdatePdcaActionDto } from './dto/update-pdca-action.dto';

@Injectable()
export class PdcaService {
  constructor(
    @Inject(PDCA_REPOSITORY)
    private readonly pdcaRepository: PdcaRepository,
  ) {}

  async create(dto: CreatePdcaDto): Promise<Pdca> {
    return this.pdcaRepository.create(new Pdca({ ...dto }));
  }

  async findAll(query: PdcaQuery): Promise<PaginatedPdcas> {
    return this.pdcaRepository.findAll(query);
  }

  async findById(id: number): Promise<Pdca> {
    const pdca = await this.ensurePdca(id);
    await this.refreshOverdueStatus(id);
    const actions = await this.pdcaRepository.findActions(id);
    attachOverdueFlags(actions);
    pdca.actions = actions;
    return pdca;
  }

  async update(id: number, dto: UpdatePdcaDto): Promise<Pdca> {
    const pdca = await this.ensurePdca(id);

    if (dto.fase && dto.fase !== pdca.fase) {
      await this.validateTransition(pdca, dto.fase);
      pdca.fase = dto.fase;
      pdca.statusCiclo = statusFromFase(dto.fase);
    }

    Object.assign(pdca, dto);
    applyCycleConclusionDate(pdca);
    return this.pdcaRepository.save(pdca);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.pdcaRepository.delete(id);
    if (!deleted) throw new NotFoundException('Ciclo PDCA não encontrado');
  }

  async restart(id: number): Promise<Pdca> {
    const source = await this.ensurePdca(id);
    return this.pdcaRepository.create(new Pdca(buildRestartProps(source)));
  }

  async findActions(pdcaId: number): Promise<PdcaAction[]> {
    await this.ensurePdca(pdcaId);
    await this.refreshOverdueStatus(pdcaId);
    const actions = await this.pdcaRepository.findActions(pdcaId);
    attachOverdueFlags(actions);
    return actions;
  }

  async createAction(pdcaId: number, dto: CreatePdcaActionDto): Promise<PdcaAction> {
    await this.ensurePdca(pdcaId);
    return this.pdcaRepository.createAction(new PdcaAction({ ...dto, pdcaId }));
  }

  async updateAction(
    pdcaId: number,
    actionId: number,
    dto: UpdatePdcaActionDto,
  ): Promise<PdcaAction> {
    await this.ensurePdca(pdcaId);
    const action = await this.pdcaRepository.findActionById(pdcaId, actionId);
    if (!action) throw new NotFoundException('Ação não encontrada');

    Object.assign(action, dto);
    applyActionStatusTimestamps(action);

    if (isActionOverdue(action) && action.status !== 'concluido' && action.status !== 'cancelado') {
      action.status = 'atrasado';
    }

    const saved = await this.pdcaRepository.saveAction(action);
    saved.atrasado = isActionOverdue(saved);
    return saved;
  }

  async deleteAction(pdcaId: number, actionId: number): Promise<void> {
    await this.ensurePdca(pdcaId);
    const deleted = await this.pdcaRepository.deleteAction(pdcaId, actionId);
    if (!deleted) throw new NotFoundException('Ação não encontrada');
  }

  private async ensurePdca(pdcaId: number): Promise<Pdca> {
    const pdca = await this.pdcaRepository.findById(pdcaId);
    if (!pdca) throw new NotFoundException('Ciclo PDCA não encontrado');
    return pdca;
  }

  private async validateTransition(pdca: Pdca, newFase: string): Promise<void> {
    const actionCount = await this.pdcaRepository.countActions(pdca.id ?? 0);
    const concludedCount = await this.pdcaRepository.countActionsByStatus(
      pdca.id ?? 0,
      'concluido',
    );
    const error = validateTransitionRule(pdca, newFase, { actionCount, concludedCount });
    if (error) throw new BadRequestException(error);
  }

  private async refreshOverdueStatus(pdcaId: number): Promise<void> {
    const actions = await this.pdcaRepository.findActions(pdcaId);
    for (const action of actions) {
      if (isActionOverdue(action) && action.status !== 'atrasado') {
        action.status = 'atrasado';
        await this.pdcaRepository.saveAction(action);
      }
    }
  }
}
