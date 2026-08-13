import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OBSERVATION_REPOSITORY } from './domain/observation.repository';
import { ServiceOrderObservationEntity } from './infrastructure/observation.entity';
import { TypeOrmObservationRepository } from './infrastructure/typeorm-observation.repository';
import { ObservationFileStorage } from './infrastructure/observation-file-storage';
import { ServiceOrderObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrderObservationEntity])],
  providers: [
    ServiceOrderObservationsService,
    ObservationFileStorage,
    { provide: OBSERVATION_REPOSITORY, useClass: TypeOrmObservationRepository },
  ],
  controllers: [ObservationsController],
  exports: [ServiceOrderObservationsService],
})
export class ServiceOrderObservationsModule {}
