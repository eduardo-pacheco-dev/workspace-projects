import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceEntry } from './finance-entry.entity';
import { SpendingLimit } from './spending-limit.entity';

@Injectable()
export class FinanceReportsService {
  constructor(
    @InjectRepository(FinanceEntry)
    private readonly entriesRepository: Repository<FinanceEntry>,
    @InjectRepository(SpendingLimit)
    private readonly limitsRepository: Repository<SpendingLimit>,
  ) {}

  async summary(month: number, year: number, accountId?: number) {
    const qb = this.entriesRepository
      .createQueryBuilder('fe')
      .select('fe.type', 'type')
      .addSelect('SUM(fe.amount)', 'total')
      .addSelect('fe.status', 'status')
      .where('YEAR(fe.date) = :year', { year })
      .andWhere('MONTH(fe.date) = :month', { month })
      .andWhere("fe.status != 'canceled'");

    if (accountId) {
      qb.andWhere('fe.accountId = :accountId', { accountId });
    }

    qb.groupBy('fe.type').addGroupBy('fe.status');

    const rows = await qb.getRawMany();

    let income = 0;
    let expenses = 0;
    let pending = 0;

    for (const row of rows) {
      const total = Number(row.total) || 0;
      if (row.type === 'income') {
        income += total;
      } else if (row.type === 'expense') {
        expenses += total;
      }
      if (row.status === 'pending') {
        pending += total;
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      pending,
    };
  }

  async byCategory(month: number, year: number) {
    const rows = await this.entriesRepository
      .createQueryBuilder('fe')
      .select('fe.category', 'category')
      .addSelect('SUM(fe.amount)', 'total')
      .addSelect('COUNT(fe.id)', 'count')
      .where('YEAR(fe.date) = :year', { year })
      .andWhere('MONTH(fe.date) = :month', { month })
      .andWhere("fe.status != 'canceled'")
      .andWhere("fe.type = 'expense'")
      .groupBy('fe.category')
      .orderBy('total', 'DESC')
      .getRawMany();

    const data = rows.map((row) => ({
      category: row.category,
      total: Number(row.total) || 0,
      count: Number(row.count) || 0,
    }));

    return {
      data,
      total: data.reduce((sum, item) => sum + item.total, 0),
    };
  }

  async limits(month: number, year: number) {
    const limits = await this.limitsRepository.find({
      where: { month, year },
      order: { category: 'ASC' },
    });

    const spentRows = await this.entriesRepository
      .createQueryBuilder('fe')
      .select('fe.category', 'category')
      .addSelect('SUM(fe.amount)', 'spent')
      .where('YEAR(fe.date) = :year', { year })
      .andWhere('MONTH(fe.date) = :month', { month })
      .andWhere("fe.status != 'canceled'")
      .andWhere("fe.type = 'expense'")
      .groupBy('fe.category')
      .getRawMany();

    const spentByCategory = new Map<string, number>();
    for (const row of spentRows) {
      spentByCategory.set(row.category, Number(row.spent) || 0);
    }

    const data = limits.map((limit) => {
      const spent = spentByCategory.get(limit.category) || 0;
      const percentage = limit.amount > 0 ? (spent / limit.amount) * 100 : 0;
      return {
        id: limit.id,
        category: limit.category,
        month: limit.month,
        year: limit.year,
        amount: limit.amount,
        spent,
        remaining: limit.amount - spent,
        percentage,
      };
    });

    return { data, total: data.length };
  }
}
