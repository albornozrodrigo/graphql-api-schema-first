import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { buildPagination } from 'src/app.utils';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment) private commentModel: typeof Comment) {}

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    return await this.commentModel.create(createCommentInput);
  }

  async findAll(pagination: PaginationInput) {
    const paginationData = buildPagination(pagination);
    const comments = await this.commentModel.findAll(paginationData);
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findOne(id: number) {
    return await this.commentModel.findByPk(id);
  }

  async update(id: number, updateCommentInput: UpdateCommentInput) {
    const res = await this.commentModel.update(updateCommentInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('Comment not found');
    }

    return this.commentModel.findByPk(id);
  }

  async remove(id: number) {
    const res = await this.commentModel.destroy({ where: { id } });
    return res === 1;
  }
}
