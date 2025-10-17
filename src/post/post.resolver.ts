import { UseGuards } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { buildPagination } from '../app.utils';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CommentLoader } from '../comment/comment.loader';
import { PaginationInput } from '../common/dto/pagination.input';
import { UserAttributes } from '../user/entities/user.entity';
import { CurrentUser } from '../user/user.decorator';
import { UserLoader } from '../user/user.loader';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

@Resolver('Post')
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userLoader: UserLoader,
    private readonly commentLoader: CommentLoader,
  ) {}

  @Query(() => [Post], { name: 'allPosts' })
  findAll(
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.postService.findAll(pagination, info);
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.postService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Query(() => [Post], { name: 'allPostsByAuthor' })
  findAllByAuthorId(
    @CurrentUser() user: UserAttributes,
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.postService.findAllByAuthorId(user.id, pagination, info);
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
  async author(@Parent() post: Post, @Info() info: GraphQLResolveInfo) {
    if (!post) return null;

    const loader = this.userLoader.setInfo(info);
    const user = await loader.findUsersByUserId.load(post.authorId);

    return user;
  }

  @ResolveField('comments')
  async comments(
    @Parent() post: Post,
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!post) return [];

    const loader = this.commentLoader.setInfo(info);
    const comments = await loader.findCommentsByPostId.load(post.id);

    if (pagination) {
      const { limit, offset } = buildPagination(pagination);
      return comments.slice(offset, offset + limit);
    }

    return comments;
  }
}
