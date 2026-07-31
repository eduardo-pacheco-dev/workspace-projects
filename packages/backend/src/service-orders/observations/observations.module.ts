import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrderObservation } from './observation.entity';
import { ServiceOrderObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrderObservation])],
  providers: [ServiceOrderObservationsService],
  controllers: [ObservationsController],
  exports: [ServiceOrderObservationsService],
})
export class ServiceOrderObservationsModule {}
