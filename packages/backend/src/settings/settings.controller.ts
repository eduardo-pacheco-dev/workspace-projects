import { Body, Controller, Get, Put, Request, ForbiddenException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { updateSettingsSchema, UpdateSettingsInput } from './settings.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

const SETTINGS_EDIT_ROLES = ['master', 'admin'];

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Put()
  async update(
    @Request() req: any,
    @Body(new ZodValidationPipe(updateSettingsSchema)) dto: UpdateSettingsInput,
  ) {
    const role = req.user?.role;
    if (!SETTINGS_EDIT_ROLES.includes(role)) {
      throw new ForbiddenException('Somente administradores podem alterar as configurações.');
    }
    return this.settingsService.upsert(dto);
  }
}
