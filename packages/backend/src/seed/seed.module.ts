import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { LpuModule } from '../lpu/lpu.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { TasksModule } from '../tasks/task.module';
import { MsProjectModule } from '../ms-project/ms-project.module';
import { SettingsModule } from '../settings/settings.module';
import { CompaniesModule } from '../companies/company.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { CommentsModule } from '../comments/comments.module';
import { ProjectsModule } from '../projects/projects.module';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { StationsModule } from '../stations/stations.module';
import { RadioLinksModule } from '../radio-links/radio-links.module';
import { ServiceOrdersModule } from '../service-orders/service-orders.module';
import { ClientsModule } from '../clients/clients.module';
import { PdcaModule } from '../pdca/pdca.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, JobsModule, LpuModule, ScheduleModule, TasksModule, MsProjectModule, SettingsModule, CompaniesModule, AttachmentsModule, CommentsModule, ProjectsModule, CollaboratorsModule, StationsModule, RadioLinksModule, ServiceOrdersModule, ClientsModule, PdcaModule],
  providers: [SeedService],
})
export class SeedModule {}
