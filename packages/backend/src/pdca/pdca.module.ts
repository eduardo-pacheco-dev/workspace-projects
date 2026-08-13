import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDCA_REPOSITORY } from './domain/pdca.repository';
import { PdcaEntity } from './infrastructure/pdca.entity';
import { PdcaActionEntity } from './infrastructure/pdca-action.entity';
import { TypeOrmPdcaRepository } from './infrastructure/typeorm-pdca.repository';
import { PdcaService } from './pdca.service';
import { PdcaController } from './pdca.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PdcaEntity, PdcaActionEntity])],
  providers: [
    PdcaService,
    { provide: PDCA_REPOSITORY, useClass: TypeOrmPdcaRepository },
  ],
  controllers: [PdcaController],
  exports: [PdcaService],
})
export class PdcaModule {}
