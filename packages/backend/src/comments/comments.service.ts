import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(jobId: number, dto: CreateCommentDto, author: string): Promise<Comment> {
    const comment = this.commentRepository.create({ jobId, content: dto.content, author });
    return this.commentRepository.save(comment);
  }

  async createForServiceOrder(
    serviceOrderId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      serviceOrderId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async createForStation(
    stationId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      stationId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async createForRadioLink(
    radioLinkId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      radioLinkId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async createForProject(
    projectId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      projectId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async createForClient(
    clientId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      clientId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async createForCompany(
    companyId: number,
    dto: CreateCommentDto,
    author: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      companyId,
      content: dto.content,
      author,
    });
    return this.commentRepository.save(comment);
  }

  async findByJob(jobId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { jobId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByServiceOrder(serviceOrderId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { serviceOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStation(
    stationId: number,
    query?: { page?: number; limit?: number },
  ): Promise<{ data: Comment[]; total: number }> {
    const { page = 1, limit = 10 } = query ?? {};

    const [data, total] = await this.commentRepository
      .createQueryBuilder('c')
      .where('c.stationId = :stationId', { stationId })
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findByRadioLink(radioLinkId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { radioLinkId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCompany(
    companyId: number,
    query?: { page?: number; limit?: number },
  ): Promise<{ data: Comment[]; total: number }> {
    const { page = 1, limit = 10 } = query ?? {};

    const [data, total] = await this.commentRepository
      .createQueryBuilder('c')
      .where('c.companyId = :companyId', { companyId })
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comentário não encontrado');
    return comment;
  }

  async update(id: number, content: string, userEmail: string): Promise<Comment> {
    const comment = await this.findById(id);
    if (comment.author !== userEmail) {
      throw new ForbiddenException('Você não pode editar este comentário');
    }
    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async delete(id: number, userEmail: string): Promise<void> {
    const comment = await this.findById(id);
    if (comment.author !== userEmail) {
      throw new ForbiddenException('Você não pode excluir este comentário');
    }
    await this.commentRepository.delete(id);
  }
}
