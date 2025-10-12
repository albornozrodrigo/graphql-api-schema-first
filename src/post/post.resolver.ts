import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { buildPagination } from 'src/app.utils';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CommentService } from 'src/comment/comment.service';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { UserAttributes } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/user/user.decorator';
import { UserService } from 'src/user/user.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostLoader } from './post.loader';
import { PostService } from './post.service';

@Resolver('Post')
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly postLoader: PostLoader,
  ) {}

  @Query(() => [Post], { name: 'allPosts' })
  findAll(@Args('pagination') pagination: PaginationInput) {
    return this.postService.findAll(pagination);
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id') id: number) {
    return this.postService.findOne(id);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => [Post], { name: 'allPostsByAuthor' })
  findAllByAuthorId(
    @CurrentUser() user: UserAttributes,
    @Args('pagination') pagination: PaginationInput,
  ) {
    return this.postService.findAllByAuthorId(user.id, pagination);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post, { name: 'createPost' })
  create(
    @CurrentUser() user: UserAttributes,
    @Args('createPostInput') createPostInput: CreatePostInput,
  ) {
    createPostInput.authorId = user.id;
    return this.postService.create(createPostInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post, { name: 'updatePost' })
  update(
    @CurrentUser() user: UserAttributes,
    @Args('id') id: number,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ) {
    updatePostInput.authorId = user.id;
    return this.postService.update(id, updatePostInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removePost' })
  remove(@CurrentUser() user: UserAttributes, @Args('id') id: number) {
    return this.postService.remove(id, user.id);
  }

  // Fields

  @ResolveField('author')
  async author(@Parent() post: Post) {
    if (!post) return null;
    // return this.userService.findOne(post.authorId);

    const allUsers = await this.postLoader.authorByPost.load(post.authorId);

    return allUsers;
  }

  @ResolveField('comments')
  async comments(
    @Parent() post: Post,
    @Args('pagination') pagination: PaginationInput,
  ) {
    if (!post) return [];

    const allComments = await this.postLoader.commentsByPost.load(post.id);

    // Aplicar paginação se fornecida
    if (pagination) {
      const { limit, offset } = buildPagination(pagination);
      return allComments.slice(offset, offset + limit);
    }

    return allComments;
  }
}
