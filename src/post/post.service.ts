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

  async create(createPostInput: CreatePostInput): Promise<Post> {
    return await this.postModel.create(createPostInput);
  }

  async findAllPaginated(
    pagination: PaginationInput,
  ): Promise<PostAttributes[]> {
    const paginationData = buildPagination(pagination);
    const posts = await this.postModel.findAll(paginationData);
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findAll(): Promise<PostAttributes[]> {
    const posts = await this.postModel.findAll();
    return posts.map((post: Post) => post.get({ plain: true }));
  }

  async findOne(id: number) {
    return await this.postModel.findByPk(id);
  }

  async update(id: number, updatePostInput: UpdatePostInput) {
    const res = await this.postModel.update(updatePostInput, {
      where: { id },
    });

    if (res[0] === 0) {
      throw new Error('Post not found');
    }

    return this.postModel.findByPk(id);
  }

  async remove(id: number) {
    const res = await this.postModel.destroy({ where: { id } });
    return res === 1;
  }
}
