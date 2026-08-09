import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { Responsavel } from './responsavel.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';

export interface ClientQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Responsavel)
    private readonly responsaveisRepository: Repository<Responsavel>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create(dto);
    return this.clientsRepository.save(client);
  }

  async findAll(query: ClientQuery): Promise<{ data: Client[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.clientsRepository.createQueryBuilder('c');

    if (search) {
      qb.where(
        'c.nome LIKE :search OR c.documento LIKE :search OR c.email LIKE :search OR c.telefone LIKE :search OR c.cidade LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    const allowedSort = ['id', 'nome', 'documento', 'email', 'telefone', 'cidade', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`c.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async update(id: number, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async delete(id: number): Promise<void> {
    const result = await this.clientsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Cliente não encontrado');
  }

  async findResponsaveisByClient(clientId: number): Promise<Responsavel[]> {
    await this.findById(clientId);
    return this.responsaveisRepository.find({
      where: { clientId },
      order: { nome: 'ASC' },
    });
  }

  async createResponsavel(
    clientId: number,
    dto: CreateResponsavelDto,
  ): Promise<Responsavel> {
    await this.findById(clientId);
    const responsavel = this.responsaveisRepository.create({ clientId, ...dto });
    return this.responsaveisRepository.save(responsavel);
  }

  async updateResponsavel(
    id: number,
    dto: UpdateResponsavelDto,
  ): Promise<Responsavel> {
    const responsavel = await this.responsaveisRepository.findOne({ where: { id } });
    if (!responsavel) throw new NotFoundException('Responsável não encontrado');
    Object.assign(responsavel, dto);
    return this.responsaveisRepository.save(responsavel);
  }

  async deleteResponsavel(id: number): Promise<void> {
    const result = await this.responsaveisRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Responsável não encontrado');
  }
}
