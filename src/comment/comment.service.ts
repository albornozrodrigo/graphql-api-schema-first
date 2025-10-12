import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { buildPagination } from 'src/app.utils';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment, CommentAttributes } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment) private commentModel: typeof Comment) {}

  async create(
    createCommentInput: CreateCommentInput,
  ): Promise<CommentAttributes> {
    const newComment = await this.commentModel.create(createCommentInput);
    return newComment.get({ plain: true });
  }

  async findAll(pagination: PaginationInput): Promise<CommentAttributes[]> {
    const paginationData = buildPagination(pagination);
    const comments = await this.commentModel.findAll(paginationData);
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findAllByPostIds(postIds: number[]) {
    const comments = await this.commentModel.findAll({
      where: { postId: postIds },
      order: [['createdAt', 'DESC']],
    });
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findAllByPostId(
    postId: number,
    pagination: PaginationInput,
  ): Promise<CommentAttributes[]> {
    const paginationData = buildPagination(pagination);
    const comments = await this.commentModel.findAll({
      ...paginationData,
      where: { postId },
    });
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findOne(id: number): Promise<CommentAttributes> {
    const comment = await this.commentModel.findByPk(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment.get({ plain: true });
  }

  async update(id: number, updateCommentInput: UpdateCommentInput) {
    const comment = await this.findOne(id);

    if (comment.userId !== updateCommentInput.userId) {
      throw new Error('You are not authorized to update this comment');
    }

    const res = await this.commentModel.update(updateCommentInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('Comment not found');
    }

    return this.findOne(id);
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.findOne(commentId);

    if (comment.userId !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    const res = await this.commentModel.destroy({
      where: { id: commentId, userId },
    });

    return res === 1;
  }
}
