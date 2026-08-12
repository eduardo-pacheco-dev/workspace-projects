import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { ClientEntity } from './infrastructure/client.entity';
import { ResponsavelEntity } from './infrastructure/responsavel.entity';
import { TypeOrmClientRepository } from './infrastructure/typeorm-client.repository';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity, ResponsavelEntity])],
  providers: [
    ClientsService,
    { provide: CLIENT_REPOSITORY, useClass: TypeOrmClientRepository },
  ],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
