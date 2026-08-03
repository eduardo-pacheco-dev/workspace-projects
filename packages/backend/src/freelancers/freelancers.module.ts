import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborator } from '../collaborators/collaborator.entity';
import { FreelancersService } from './freelancers.service';
import { FreelancersController } from './freelancers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collaborator])],
  providers: [FreelancersService],
  controllers: [FreelancersController],
  exports: [FreelancersService],
})
export class FreelancersModule {}
