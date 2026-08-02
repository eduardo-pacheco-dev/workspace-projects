import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './settings.entity';
import { UpdateSettingsInput } from './settings.schemas';

export type SettingsRecord = Record<string, string>;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  async findAll(): Promise<SettingsRecord> {
    const rows = await this.settingsRepository.find();
    const record: SettingsRecord = {};
    for (const row of rows) {
      record[row.key] = row.value ?? '';
    }
    return record;
  }

  async upsert(patch: UpdateSettingsInput): Promise<SettingsRecord> {
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) continue;
      const existing = await this.settingsRepository.findOne({ where: { key } });
      if (existing) {
        existing.value = String(value);
        await this.settingsRepository.save(existing);
      } else {
        await this.settingsRepository.save(
          this.settingsRepository.create({ key, value: String(value) }),
        );
      }
    }
    return this.findAll();
  }
}
