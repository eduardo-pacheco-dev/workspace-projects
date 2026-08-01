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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { join, extname } from 'path';
import { FinanceService } from './finance.service';
import {
  createFinanceEntrySchema,
  updateFinanceEntrySchema,
  CreateFinanceEntryInput,
  UpdateFinanceEntryInput,
} from './schemas/finance.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'entries');
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.txt', '.csv',
];

@Controller('finance/entries')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createFinanceEntrySchema)) dto: CreateFinanceEntryInput) {
    return this.financeService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('accountId') accountId?: number,
  ) {
    return this.financeService.findAll({ page, limit, sortBy, sortOrder, search, type, status, category, month, year, accountId });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateFinanceEntrySchema)) dto: UpdateFinanceEntryInput,
  ) {
    return this.financeService.update(id, dto);
  }

  @Post(':id/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido.'), false);
        }
      },
    }),
  )
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }
    const attachment = `/uploads/entries/${file.filename}`;
    return this.financeService.updateAttachment(id, attachment);
  }

  @Delete(':id/attachment')
  async deleteAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.updateAttachment(id, null);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.financeService.delete(id);
    return { message: 'Lançamento excluído com sucesso' };
  }
}
