import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { STATION_REPOSITORY } from './domain/station.repository';
import { StationEntity } from './infrastructure/station.entity';
import { TypeOrmStationRepository } from './infrastructure/typeorm-station.repository';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StationEntity])],
  providers: [
    StationsService,
    { provide: STATION_REPOSITORY, useClass: TypeOrmStationRepository },
  ],
  controllers: [StationsController],
  exports: [StationsService],
})
export class StationsModule {}
