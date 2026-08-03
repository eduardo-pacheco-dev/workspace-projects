import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { JobsModule } from './jobs/jobs.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { LpuModule } from './lpu/lpu.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CommentsModule } from './comments/comments.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { ServiceOrderObservationsModule } from './service-orders/observations/observations.module';
import { FinanceModule } from './finance/finance.module';
import { StationsModule } from './stations/stations.module';
import { RadioLinksModule } from './radio-links/radio-links.module';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './clients/clients.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TasksModule } from './tasks/task.module';
import { MsProjectModule } from './ms-project/ms-project.module';
import { SettingsModule } from './settings/settings.module';
import { CompaniesModule } from './companies/company.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { SeedModule } from './seed/seed.module';

const dbType = process.env.DB_TYPE === 'sqljs' ? 'sqljs' : 'mysql';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      dbType === 'sqljs'
        ? {
            type: 'sqljs',
            autoSave: true,
            location: 'data/db.sqlite',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          }
        : {
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'admin',
            database: process.env.DB_NAME || 'db_workspace',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/*.{ts,js}'],
            synchronize: false,
            migrationsRun: true,
          },
    ),
    AuthModule,
    UsersModule,
    FreelancersModule,
    JobsModule,
    ProposalsModule,
    ContractsModule,
    LpuModule,
    AttachmentsModule,
    CommentsModule,
    ServiceOrdersModule,
    ServiceOrderObservationsModule,
    FinanceModule,
    StationsModule,
    RadioLinksModule,
    ProjectsModule,
    ClientsModule,
    ScheduleModule,
    TasksModule,
    MsProjectModule,
    SettingsModule,
    CompaniesModule,
    CollaboratorsModule,
    SeedModule,
  ],
})
export class AppModule {}
