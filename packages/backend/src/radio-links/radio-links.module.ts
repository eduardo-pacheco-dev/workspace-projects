import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RADIO_LINK_REPOSITORY } from './domain/radio-link.repository';
import { RadioLinkEntity } from './infrastructure/radio-link.entity';
import { TypeOrmRadioLinkRepository } from './infrastructure/typeorm-radio-link.repository';
import { RadioLinksService } from './radio-links.service';
import { RadioLinksController } from './radio-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RadioLinkEntity, StationEntity])],
  providers: [
    RadioLinksService,
    { provide: RADIO_LINK_REPOSITORY, useClass: TypeOrmRadioLinkRepository },
  ],
  controllers: [RadioLinksController],
  exports: [RadioLinksService],
})
export class RadioLinksModule {}
