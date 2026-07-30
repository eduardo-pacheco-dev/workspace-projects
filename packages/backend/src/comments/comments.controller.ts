import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('job/:jobId')
  create(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.create(jobId, dto, author);
  }

  @Get('job/:jobId')
  findByJob(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.commentsService.findByJob(jobId);
  }
}
