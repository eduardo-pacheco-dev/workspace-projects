import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lpu } from './lpu.entity';
import { CreateLpuDto } from './dto/create-lpu.dto';
import { UpdateLpuDto } from './dto/update-lpu.dto';

@Injectable()
export class LpuService {
  constructor(
    @InjectRepository(Lpu)
    private readonly lpuRepository: Repository<Lpu>,
  ) {}

  async create(dto: CreateLpuDto): Promise<Lpu> {
    const lpu = this.lpuRepository.create(dto);
    return this.lpuRepository.save(lpu);
  }

  async findAllByFreelancer(freelancerId: number): Promise<Lpu[]> {
    return this.lpuRepository.find({ where: { freelancerId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Lpu> {
    const lpu = await this.lpuRepository.findOne({ where: { id } });
    if (!lpu) throw new NotFoundException('LPU não encontrada');
    return lpu;
  }

  async update(id: number, dto: UpdateLpuDto): Promise<Lpu> {
    const lpu = await this.findById(id);
    Object.assign(lpu, dto);
    return this.lpuRepository.save(lpu);
  }

  async delete(id: number): Promise<void> {
    const result = await this.lpuRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('LPU não encontrada');
  }
}
