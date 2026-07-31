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
