import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lpu } from './lpu.entity';
import { LpuService } from './lpu.service';
import { LpuController } from './lpu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lpu])],
  providers: [LpuService],
  controllers: [LpuController],
  exports: [LpuService],
})
export class LpuModule {}
