import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFreelancer } from './company-freelancer.entity';
import { CompanyService } from './company.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Collaborator } from '../collaborators/collaborator.entity';

@Injectable()
export class CompanyFreelancerService {
  constructor(
    @InjectRepository(CompanyFreelancer)
    private readonly companyFreelancerRepository: Repository<CompanyFreelancer>,
    private readonly companyService: CompanyService,
    private readonly collaboratorsService: CollaboratorsService,
  ) {}

  async findAll(
    companyId: number,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      search?: string;
    },
  ): Promise<{ data: (CompanyFreelancer & { freelancer: Collaborator })[]; total: number }> {
    await this.companyService.findById(companyId);
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC' as 'ASC' | 'DESC',
      search,
    } = query;

    const qb = this.companyFreelancerRepository
      .createQueryBuilder('cf')
      .innerJoinAndSelect('cf.freelancer', 'f')
      .where('cf.companyId = :companyId', { companyId });

    if (search) {
      qb.andWhere(
        '(f.firstName LIKE :search OR f.lastName LIKE :search OR f.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let orderByCol = 'cf.createdAt';
    if (['firstName', 'lastName', 'email'].includes(sortBy)) {
      orderByCol = `f.${sortBy}`;
    }
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [data, total] = await qb
      .orderBy(orderByCol, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data as (CompanyFreelancer & { freelancer: Collaborator })[], total };
  }

  async associate(companyId: number, freelancerId: number): Promise<CompanyFreelancer> {
    await this.companyService.findById(companyId);
    await this.collaboratorsService.getFreelancerOrFail(freelancerId);

    const existing = await this.companyFreelancerRepository.findOne({
      where: { companyId, freelancerId },
    });
    if (existing) {
      throw new ConflictException('Freelancer já vinculado a esta empresa');
    }

    const row = this.companyFreelancerRepository.create({ companyId, freelancerId });
    return this.companyFreelancerRepository.save(row);
  }

  async remove(companyId: number, freelancerId: number): Promise<void> {
    const result = await this.companyFreelancerRepository.delete({ companyId, freelancerId });
    if (result.affected === 0) {
      throw new NotFoundException('Vínculo não encontrado');
    }
  }
}
