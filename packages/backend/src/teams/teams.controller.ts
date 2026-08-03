import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeamsService } from './teams.service';
import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  CreateTeamInput,
  UpdateTeamInput,
  AddMemberInput,
} from './schemas/team.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('teams')
@UseGuards(AuthGuard('jwt'))
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createTeamSchema)) dto: CreateTeamInput) {
    return this.teamsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('search') search?: string,
  ) {
    return this.teamsService.findAllPaged({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC' | undefined,
      search,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateTeamSchema)) dto: UpdateTeamInput,
  ) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.teamsService.delete(id);
    return { message: 'Equipe excluída com sucesso' };
  }

  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(addMemberSchema)) dto: AddMemberInput,
  ) {
    return this.teamsService.addMember(id, dto.collaboratorId);
  }

  @Delete(':id/members/:collaboratorId')
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
  ) {
    await this.teamsService.removeMember(id, collaboratorId);
    return { message: 'Membro removido da equipe com sucesso' };
  }
}
