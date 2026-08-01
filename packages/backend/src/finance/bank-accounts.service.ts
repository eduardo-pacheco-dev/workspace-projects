import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './bank-account.entity';
import {
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from './schemas/finance.schemas';

export interface BankAccountQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly accountsRepository: Repository<BankAccount>,
  ) {}

  async create(dto: CreateBankAccountInput): Promise<BankAccount> {
    const account = this.accountsRepository.create({
      ...dto,
      balance: dto.balance ?? 0,
    });
    return this.accountsRepository.save(account);
  }

  async findAll(query: BankAccountQuery): Promise<{ data: BankAccount[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.accountsRepository.createQueryBuilder('ba');

    if (search) {
      qb.where('ba.name LIKE :search OR ba.bank LIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedSort = ['id', 'name', 'bank', 'balance'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`ba.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<BankAccount> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Conta não encontrada');
    return account;
  }

  async update(id: number, dto: UpdateBankAccountInput): Promise<BankAccount> {
    const account = await this.findById(id);
    Object.assign(account, dto);
    return this.accountsRepository.save(account);
  }

  async delete(id: number): Promise<void> {
    const result = await this.accountsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Conta não encontrada');
    }
  }
}
