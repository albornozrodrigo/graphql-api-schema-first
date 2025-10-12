import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { buildPagination } from 'src/app.utils';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post, PostAttributes } from './entities/post.entity';

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

  async findAll(pagination: PaginationInput): Promise<PostAttributes[]> {
    const paginationData = buildPagination(pagination);
    const posts = await this.postModel.findAll(paginationData);
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAllByAuthorId(
    authorId: number,
    pagination: PaginationInput,
  ): Promise<PostAttributes[]> {
    const paginationData = buildPagination(pagination);
    const posts = await this.postModel.findAll({
      ...paginationData,
      where: { authorId },
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAllByAuthorIds(authorIds: number[]) {
    const posts = await this.postModel.findAll({
      where: { authorId: authorIds },
      order: [['createdAt', 'DESC']],
    });
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findOne(id: number) {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post.get({ plain: true });
  }

  async update(postId: number, updatePostInput: UpdatePostInput) {
    const post = await this.findOne(postId);

    if (post.authorId !== updatePostInput.authorId) {
      throw new Error('You are not authorized to update this post');
    }

    const res = await this.postModel.update(updatePostInput, {
      where: { id: postId },
    });

    if (res[0] === 0) {
      throw new Error('Post not found');
    }

    return this.findOne(postId);
  }

  async remove(postId: number, userId: number) {
    const post = await this.findOne(postId);

    if (post.authorId !== userId) {
      throw new Error('You are not authorized to delete this post');
    }

    const res = await this.postModel.destroy({
      where: { id: postId, authorId: userId },
    });

    return res === 1;
  }
}
