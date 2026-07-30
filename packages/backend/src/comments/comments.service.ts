import { Injectable } from '@nestjs/common';
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

  async findByJob(jobId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { jobId },
      order: { createdAt: 'DESC' },
    });
  }
}
