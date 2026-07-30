import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalsRepository: Repository<Proposal>,
  ) {}

  async create(dto: CreateProposalDto): Promise<Proposal> {
    const proposal = this.proposalsRepository.create({
      ...dto,
      status: 'pending',
    });
    return this.proposalsRepository.save(proposal);
  }

  async findAll(): Promise<Proposal[]> {
    return this.proposalsRepository.find();
  }

  async findById(id: number): Promise<Proposal> {
    const proposal = await this.proposalsRepository.findOne({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async update(id: number, dto: UpdateProposalDto): Promise<Proposal> {
    const proposal = await this.findById(id);
    Object.assign(proposal, dto);
    return this.proposalsRepository.save(proposal);
  }

  async delete(id: number): Promise<void> {
    const result = await this.proposalsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Proposal not found');
  }
}
