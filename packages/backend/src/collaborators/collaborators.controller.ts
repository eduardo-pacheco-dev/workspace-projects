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
import { CollaboratorsService } from './collaborators.service';
import {
  createCollaboratorSchema,
  updateCollaboratorSchema,
  CreateCollaboratorInput,
  UpdateCollaboratorInput,
} from './schemas/collaborator.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('collaborators')
@UseGuards(AuthGuard('jwt'))
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createCollaboratorSchema)) dto: CreateCollaboratorInput) {
    return this.collaboratorsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.collaboratorsService.findAllPaged({ page, limit, sortBy, sortOrder, search });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.collaboratorsService.getByIdOrFail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCollaboratorSchema)) dto: UpdateCollaboratorInput,
  ) {
    return this.collaboratorsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.collaboratorsService.delete(id);
    return { message: 'Colaborador excluído com sucesso' };
  }
}
