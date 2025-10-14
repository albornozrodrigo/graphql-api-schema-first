import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GraphQLResolveInfo } from 'graphql';
import { Op } from 'sequelize';
import { buildPagination, getAttributes } from 'src/app.utils';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post, PostAttributes, postDataMap } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post) private postModel: typeof Post) {}

  async create(createPostInput: CreatePostInput): Promise<PostAttributes> {
    const hasPost = await this.postModel.count({
      where: {
        title: createPostInput.title,
      },
    });

    if (hasPost > 0) {
      throw new Error('Title already used');
    }

    const newPost = await this.postModel.create(createPostInput);
    return newPost.get({ plain: true });
  }

  async findAll(
    pagination: PaginationInput,
    info: GraphQLResolveInfo,
  ): Promise<PostAttributes[]> {
    const attributes = getAttributes(info, postDataMap);
    const paginationData = buildPagination(pagination);
    const posts = await this.postModel.findAll({
      ...paginationData,
      attributes: [...attributes, 'authorId'],
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAllByAuthorId(
    authorId: number,
    pagination: PaginationInput,
    info: GraphQLResolveInfo,
  ): Promise<PostAttributes[]> {
    const attributes = getAttributes(info, postDataMap);
    const paginationData = buildPagination(pagination);
    const posts = await this.postModel.findAll({
      ...paginationData,
      where: { authorId },
      attributes: [...attributes, 'authorId'],
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAllByIds(
    ids: number[],
    info: GraphQLResolveInfo,
  ): Promise<PostAttributes[]> {
    const attributes = getAttributes(info, postDataMap);
    const posts = await this.postModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      attributes: [...attributes, 'authorId'],
      order: [['createdAt', 'DESC']],
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAllByAuthorIds(authorIds: number[], info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, postDataMap);
    const posts = await this.postModel.findAll({
      where: {
        authorId: {
          [Op.in]: authorIds,
        },
      },
      attributes: [...attributes, 'authorId'],
      order: [['createdAt', 'DESC']],
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findOne(id: number, info: GraphQLResolveInfo) {
    const attributes = getAttributes(info, postDataMap);
    const post = await this.postModel.findOne({
      where: { id },
      attributes: [...attributes, 'authorId'],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return post.get({ plain: true });
  }

  async update(postId: number, updatePostInput: UpdatePostInput) {
    const currentPost = await this.postModel.findByPk(postId);

    if (!currentPost) {
      throw new Error('Post not found');
    }

    const post = currentPost.get({ plain: true });

    if (post.authorId !== updatePostInput.authorId) {
      throw new Error('You are not authorized to update this post');
    }

    const res = await this.postModel.update(updatePostInput, {
      where: { id: postId },
    });

    if (res[0] === 0) {
      throw new Error('Post not found');
    }

    return {
      ...post,
      ...updatePostInput,
    };
  }

  async remove(postId: number, userId: number) {
    const post = await this.postModel.findByPk(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('You are not authorized to delete this post');
    }

    const res = await this.postModel.destroy({
      where: { id: postId, authorId: userId },
    });

    return res === 1;
  }
}
