import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SERVICE_ORDER_REPOSITORY } from './domain/service-order.repository';
import { ServiceOrderEntity } from './infrastructure/service-order.entity';
import { TypeOrmServiceOrderRepository } from './infrastructure/typeorm-service-order.repository';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrderObservationsModule } from './observations/observations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrderEntity]),
    ServiceOrderObservationsModule,
  ],
  providers: [
    ServiceOrdersService,
    { provide: SERVICE_ORDER_REPOSITORY, useClass: TypeOrmServiceOrderRepository },
  ],
  controllers: [ServiceOrdersController],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}
