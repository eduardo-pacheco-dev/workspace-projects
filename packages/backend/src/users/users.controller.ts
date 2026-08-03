import {
  BadRequestException,
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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from './schemas/user.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserInput,
    @Request() req: any,
  ) {
    const user = await this.usersService.createUser(dto, req.user);
    return this.usersService.toPublicUser(user);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.usersService.findAllPaged({ page, limit, sortBy, sortOrder, search });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUserOrFail(id);
    return this.usersService.toPublicUser(user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserInput,
    @Request() req: any,
  ) {
    const user = await this.usersService.updateUser(id, dto, req.user?.id);
    return this.usersService.toPublicUser(user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    if (req.user?.id === id) {
      throw new BadRequestException('Não é possível excluir o próprio usuário.');
    }
    await this.usersService.deleteUser(id);
    return { message: 'Usuário excluído com sucesso' };
  }
}
