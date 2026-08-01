import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from './credit-card.entity';
import {
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from './schemas/finance.schemas';

export interface CreditCardQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly cardsRepository: Repository<CreditCard>,
  ) {}

  async create(dto: CreateCreditCardInput): Promise<CreditCard> {
    const card = this.cardsRepository.create({
      ...dto,
      bank: dto.bank ?? null,
      brand: dto.brand ?? null,
    });
    return this.cardsRepository.save(card);
  }

  async findAll(query: CreditCardQuery): Promise<{ data: CreditCard[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.cardsRepository.createQueryBuilder('cc');

    if (search) {
      qb.where('cc.name LIKE :search OR cc.bank LIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedSort = ['id', 'name', 'bank', 'brand', 'limit', 'closingDay', 'dueDay'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`cc.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findAllCards(): Promise<CreditCard[]> {
    return this.cardsRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<CreditCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Cartão não encontrado');
    return card;
  }

  async update(id: number, dto: UpdateCreditCardInput): Promise<CreditCard> {
    const card = await this.findById(id);
    Object.assign(card, dto);
    return this.cardsRepository.save(card);
  }

  async delete(id: number): Promise<void> {
    const result = await this.cardsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cartão não encontrado');
    }
  }
}
