import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GraphQLResolveInfo } from 'graphql';
import { Op } from 'sequelize';
import { buildPagination, getAttributes } from 'src/app.utils';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import {
  Comment,
  CommentAttributes,
  commentDataMap,
} from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment) private commentModel: typeof Comment) {}

  async create(
    createCommentInput: CreateCommentInput,
  ): Promise<CommentAttributes> {
    const newComment = await this.commentModel.create(createCommentInput);
    return newComment.get({ plain: true });
  }

  async findAll(
    pagination: PaginationInput,
    info: GraphQLResolveInfo,
  ): Promise<CommentAttributes[]> {
    const attributes = getAttributes(info, commentDataMap);
    const paginationData = buildPagination(pagination);
    const comments = await this.commentModel.findAll({
      ...paginationData,
      attributes: [...attributes, 'userId', 'postId'],
    });
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findAllByPostIds(postIds: number[], info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, commentDataMap);

    const comments = await this.commentModel.findAll({
      where: {
        postId: {
          [Op.in]: postIds,
        },
      },
      attributes: [...attributes, 'userId', 'postId'],
      order: [['createdAt', 'DESC']],
    });
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findAllByPostId(
    postId: number,
    pagination: PaginationInput,
    info: GraphQLResolveInfo,
  ): Promise<CommentAttributes[]> {
    const attributes = getAttributes(info, commentDataMap);
    const paginationData = buildPagination(pagination);
    const comments = await this.commentModel.findAll({
      ...paginationData,
      where: { postId },
      attributes: [...attributes, 'userId', 'postId'],
    });
    return comments.map((comment: Comment) => comment.get({ plain: true }));
  }

  async findOne(
    id: number,
    info: GraphQLResolveInfo,
  ): Promise<CommentAttributes> {
    const attributes = getAttributes(info, commentDataMap);
    const comment = await this.commentModel.findOne({
      where: { id },
      attributes: [...attributes, 'userId', 'postId'],
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment.get({ plain: true });
  }

  async update(id: number, updateCommentInput: UpdateCommentInput) {
    const currentComment = await this.commentModel.findByPk(id);

    if (!currentComment) {
      throw new Error('Comment not found');
    }

    const comment = currentComment.get({ plain: true });

    if (comment.userId !== updateCommentInput.userId) {
      throw new Error('You are not authorized to update this comment');
    }

    const res = await this.commentModel.update(updateCommentInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('Comment not found');
    }

    return {
      ...comment,
      ...updateCommentInput,
    };
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.commentModel.findByPk(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    const res = await this.commentModel.destroy({
      where: { id: commentId, userId },
    });

    return res === 1;
  }
}
