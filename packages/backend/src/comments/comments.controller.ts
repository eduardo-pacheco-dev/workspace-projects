import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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

  @Post('service-order/:serviceOrderId')
  createForServiceOrder(
    @Param('serviceOrderId', ParseIntPipe) serviceOrderId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForServiceOrder(serviceOrderId, dto, author);
  }

  @Get('service-order/:serviceOrderId')
  findByServiceOrder(@Param('serviceOrderId', ParseIntPipe) serviceOrderId: number) {
    return this.commentsService.findByServiceOrder(serviceOrderId);
  }

  @Post('station/:stationId')
  createForStation(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForStation(stationId, dto, author);
  }

  @Get('station/:stationId')
  findByStation(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.commentsService.findByStation(stationId);
  }

  @Post('radio-link/:radioLinkId')
  createForRadioLink(
    @Param('radioLinkId', ParseIntPipe) radioLinkId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForRadioLink(radioLinkId, dto, author);
  }

  @Get('radio-link/:radioLinkId')
  findByRadioLink(@Param('radioLinkId', ParseIntPipe) radioLinkId: number) {
    return this.commentsService.findByRadioLink(radioLinkId);
  }

  @Post('project/:projectId')
  createForProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForProject(projectId, dto, author);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.commentsService.findByProject(projectId);
  }

  @Post('client/:clientId')
  createForClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForClient(clientId, dto, author);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.commentsService.findByClient(clientId);
  }

  @Post('company/:companyId')
  createForCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const author = req.user?.email || 'Anônimo';
    return this.commentsService.createForCompany(companyId, dto, author);
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.commentsService.findByCompany(companyId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const userEmail = req.user?.email || 'Anônimo';
    return this.commentsService.update(id, dto.content, userEmail);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const userEmail = req.user?.email || 'Anônimo';
    return this.commentsService.delete(id, userEmail);
  }
}
