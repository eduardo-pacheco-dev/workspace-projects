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
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { CollaboratorsService } from './collaborators.service';
import {
  createCollaboratorSchema,
  updateCollaboratorSchema,
  CreateCollaboratorInput,
  UpdateCollaboratorInput,
} from './schemas/collaborator.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { COLLABORATOR_DOCUMENT_TYPES } from './domain/collaborator-rules';

@Controller('collaborators')
@UseGuards(AuthGuard('jwt'))
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  private saveUpload(
    id: number,
    prefix: string,
    file: Express.Multer.File,
    defaultExt = '',
  ): string {
    const dir = path.resolve('uploads', `freelancer-${id}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || defaultExt;
    const filename = `${prefix}-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    return `/uploads/freelancer-${id}/${filename}`;
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCollaboratorSchema)) dto: CreateCollaboratorInput,
    @Request() req: any,
  ) {
    return this.collaboratorsService.create(dto, req.user);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const url = this.saveUpload(id, 'photo', file, '.jpg');
    return this.collaboratorsService.updatePhoto(id, url, req.user);
  }

  @Post(':id/document/:tipo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('tipo') tipo: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!COLLABORATOR_DOCUMENT_TYPES.includes(tipo as (typeof COLLABORATOR_DOCUMENT_TYPES)[number])) {
      return { message: 'Tipo de documento inválido' };
    }
    const url = this.saveUpload(id, tipo, file);
    return this.collaboratorsService.updateDocument(id, tipo, url, req.user);
  }

  private parseBooleanQuery(value?: string): boolean | undefined {
    if (value === undefined) return undefined;
    return value === 'true' || value === '1';
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('isFreelancer') isFreelancer?: string,
    @Request() req?: any,
  ) {
    return this.collaboratorsService.findAllPaged(
      { page, limit, sortBy, sortOrder, search, isFreelancer: this.parseBooleanQuery(isFreelancer) },
      req?.user,
    );
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.collaboratorsService.getByIdOrFail(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCollaboratorSchema)) dto: UpdateCollaboratorInput,
    @Request() req: any,
  ) {
    return this.collaboratorsService.update(id, dto, req.user);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.collaboratorsService.delete(id, req.user);
    return { message: 'Colaborador excluído com sucesso' };
  }
}
