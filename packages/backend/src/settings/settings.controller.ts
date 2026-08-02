import { Body, Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { updateSettingsSchema, UpdateSettingsInput } from './settings.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Put()
  async update(@Body(new ZodValidationPipe(updateSettingsSchema)) dto: UpdateSettingsInput) {
    return this.settingsService.upsert(dto);
  }
}
