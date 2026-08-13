import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Client } from './domain/client.entity';
import { Responsavel } from './domain/responsavel.entity';
import {
  ClientRepository,
  ClientQuery,
  PaginatedClients,
  CLIENT_REPOSITORY,
} from './domain/client.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientsRepository: ClientRepository,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    return this.clientsRepository.create(new Client({ ...dto }));
  }

  async findAll(query: ClientQuery): Promise<PaginatedClients> {
    return this.clientsRepository.findAll(query);
  }

  async findById(id: number): Promise<Client> {
    const client = await this.clientsRepository.findById(id);
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async update(id: number, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.clientsRepository.delete(id);
    if (!deleted) throw new NotFoundException('Cliente não encontrado');
  }

  async findResponsaveisByClient(clientId: number): Promise<Responsavel[]> {
    await this.findById(clientId);
    return this.clientsRepository.findResponsaveisByClient(clientId);
  }

  async createResponsavel(
    clientId: number,
    dto: CreateResponsavelDto,
  ): Promise<Responsavel> {
    await this.findById(clientId);
    return this.clientsRepository.createResponsavel(new Responsavel({ clientId, ...dto }));
  }

  async updateResponsavel(
    id: number,
    dto: UpdateResponsavelDto,
  ): Promise<Responsavel> {
    const responsavel = await this.clientsRepository.findResponsavelById(id);
    if (!responsavel) throw new NotFoundException('Responsável não encontrado');
    Object.assign(responsavel, dto);
    return this.clientsRepository.saveResponsavel(responsavel);
  }

  async deleteResponsavel(id: number): Promise<void> {
    const deleted = await this.clientsRepository.deleteResponsavel(id);
    if (!deleted) throw new NotFoundException('Responsável não encontrado');
  }
}
