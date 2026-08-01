import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioLink } from './radio-link.entity';
import { Station } from '../stations/station.entity';
import { RadioLinksService } from './radio-links.service';
import { RadioLinksController } from './radio-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RadioLink, Station])],
  providers: [RadioLinksService],
  controllers: [RadioLinksController],
  exports: [RadioLinksService],
})
export class RadioLinksModule {}
