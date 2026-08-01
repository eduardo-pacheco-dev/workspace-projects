import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './schemas/finance.schemas';

export interface CategoryQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class FinanceCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryInput): Promise<Category> {
    const category = this.categoriesRepository.create(dto);
    return this.categoriesRepository.save(category);
  }

  async findAll(query: CategoryQuery): Promise<{ data: Category[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.categoriesRepository.createQueryBuilder('ca');

    if (search) {
      qb.where('ca.name LIKE :search', { search: `%${search}%` });
    }

    const allowedSort = ['id', 'name'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`ca.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(id: number, dto: UpdateCategoryInput): Promise<Category> {
    const category = await this.findById(id);
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const result = await this.categoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }
  }
}
