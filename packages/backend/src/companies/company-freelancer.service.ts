import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFreelancer } from './company-freelancer.entity';
import { CompanyService } from './company.service';
import { FreelancersService } from '../freelancers/freelancers.service';
import { Freelancer } from '../freelancers/freelancer.entity';

@Injectable()
export class CompanyFreelancerService {
  constructor(
    @InjectRepository(CompanyFreelancer)
    private readonly companyFreelancerRepository: Repository<CompanyFreelancer>,
    private readonly companyService: CompanyService,
    private readonly freelancersService: FreelancersService,
  ) {}

  async findAll(
    companyId: number,
  ): Promise<(CompanyFreelancer & { freelancer: Freelancer })[]> {
    await this.companyService.findById(companyId);
    const rows = await this.companyFreelancerRepository.find({
      where: { companyId },
      relations: ['freelancer'],
      order: { createdAt: 'DESC' },
    });
    return rows as (CompanyFreelancer & { freelancer: Freelancer })[];
  }

  async associate(companyId: number, freelancerId: number): Promise<CompanyFreelancer> {
    await this.companyService.findById(companyId);
    await this.freelancersService.findById(freelancerId);

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
