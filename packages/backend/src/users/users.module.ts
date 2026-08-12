import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserEntity } from './infrastructure/user.entity';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Company])],
  providers: [
    UsersService,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
