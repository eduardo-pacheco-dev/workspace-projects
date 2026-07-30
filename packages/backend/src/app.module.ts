import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { JobsModule } from './jobs/jobs.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { SeedModule } from './seed/seed.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isProd
        ? {
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'myapp',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          }
        : {
            type: 'sqljs',
            autoSave: true,
            location: 'data/db.sqlite',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          },
    ),
    AuthModule,
    UsersModule,
    FreelancersModule,
    JobsModule,
    ProposalsModule,
    ContractsModule,
    ...(isProd ? [] : [SeedModule]),
  ],
})
export class AppModule {}
