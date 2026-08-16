import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardNotesService } from './dashboard-notes.service';

@Controller('dashboard-notes')
export class DashboardNotesController {
  constructor(private readonly notesService: DashboardNotesService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMine(@Request() req: any) {
    return this.notesService.findByUserId(req.user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  async saveMine(@Request() req: any, @Body() body: { content?: string }) {
    return this.notesService.save(req.user.id, body.content ?? '');
  }
}
