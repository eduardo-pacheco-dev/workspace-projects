import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardNoteEntity } from './dashboard-note.entity';

export interface DashboardNoteResult {
  content: string | null;
}

@Injectable()
export class DashboardNotesService {
  constructor(
    @InjectRepository(DashboardNoteEntity)
    private readonly repository: Repository<DashboardNoteEntity>,
  ) {}

  async findByUserId(userId: number): Promise<DashboardNoteResult> {
    const note = await this.repository.findOne({ where: { userId } });
    return { content: note?.content ?? null };
  }

  async save(userId: number, content: string): Promise<DashboardNoteResult> {
    let note = await this.repository.findOne({ where: { userId } });
    if (note) {
      note.content = content;
      note = await this.repository.save(note);
    } else {
      note = await this.repository.save(this.repository.create({ userId, content }));
    }
    return { content: note.content };
  }
}
