import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardNoteEntity } from './dashboard-note.entity';
import { DashboardNotesService } from './dashboard-notes.service';
import { DashboardNotesController } from './dashboard-notes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardNoteEntity])],
  providers: [DashboardNotesService],
  controllers: [DashboardNotesController],
})
export class DashboardNotesModule {}
