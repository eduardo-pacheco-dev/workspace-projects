import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdca } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';
import { PdcaService } from './pdca.service';
import { PdcaController } from './pdca.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pdca, PdcaAction])],
  providers: [PdcaService],
  controllers: [PdcaController],
  exports: [PdcaService],
})
export class PdcaModule {}
