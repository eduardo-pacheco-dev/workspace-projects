import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Freelancer } from './freelancer.entity';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';

@Injectable()
export class FreelancersService {
  constructor(
    @InjectRepository(Freelancer)
    private readonly freelancersRepository: Repository<Freelancer>,
  ) {}

  async create(dto: CreateFreelancerDto): Promise<Freelancer> {
    const freelancer = this.freelancersRepository.create({
      ...dto,
      skills: dto.skills ?? '[]',
      portfolio: dto.portfolio ?? '[]',
      experienceLevel: dto.experienceLevel ?? 'junior',
      availability: dto.availability ?? 'available',
    });
    return this.freelancersRepository.save(freelancer);
  }

  async findAll(): Promise<Freelancer[]> {
    return this.freelancersRepository.find();
  }

  async findById(id: number): Promise<Freelancer> {
    const freelancer = await this.freelancersRepository.findOne({ where: { id } });
    if (!freelancer) throw new NotFoundException('Freelancer not found');
    return freelancer;
  }

  async findByUserId(userId: number): Promise<Freelancer | null> {
    return this.freelancersRepository.findOne({ where: { userId } });
  }

  async update(id: number, dto: UpdateFreelancerDto): Promise<Freelancer> {
    const freelancer = await this.findById(id);
    Object.assign(freelancer, dto);
    return this.freelancersRepository.save(freelancer);
  }

  async delete(id: number): Promise<void> {
    const result = await this.freelancersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Freelancer not found');
  }
}
