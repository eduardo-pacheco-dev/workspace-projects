import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyInput, UpdateCompanyInput } from './company.schemas';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(dto: CreateCompanyInput): Promise<Company> {
    const company = this.companyRepository.create({
      ...dto,
      ativa: dto.ativa ?? true,
    });
    return this.companyRepository.save(company);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
  }): Promise<{ data: Company[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'nome',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.companyRepository.createQueryBuilder('c');

    if (search) {
      qb.where(
        'c.nome LIKE :search OR c.cnpj LIKE :search OR c.email LIKE :search OR c.cidade LIKE :search',
        { search: `%${search}%` },
      );
    }

    const allowedSort = ['id', 'nome', 'cnpj', 'email', 'cidade', 'uf', 'ativa'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'nome';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async update(id: number, dto: UpdateCompanyInput): Promise<Company> {
    const company = await this.findById(id);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async delete(id: number): Promise<void> {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Empresa não encontrada');
    }
  }
}
