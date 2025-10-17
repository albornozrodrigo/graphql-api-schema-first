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
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PaginationInput } from '../common/dto/pagination.input';
import { PostLoader } from '../post/post.loader';
import { UserAttributes } from '../user/entities/user.entity';
import { CurrentUser } from '../user/user.decorator';
import { UserLoader } from '../user/user.loader';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';

@Resolver('Comment')
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly postLoader: PostLoader,
    private readonly userLoader: UserLoader,
  ) {}

  @Query(() => [Comment], { name: 'allComments' })
  findAll(
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.commentService.findAll(pagination, info);
  }

  @Query(() => [Comment], { name: 'commentsByPostId' })
  findAllByPostId(
    @Args('postId') postId: number,
    @Args('pagination') pagination: PaginationInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.commentService.findAllByPostId(postId, pagination, info);
  }

  @Query(() => Comment, { name: 'comment' })
  findOne(@Args('id') id: number, @Info() info: GraphQLResolveInfo) {
    return this.commentService.findOne(id, info);
  }

  // Protected queries and mutations

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Comment, { name: 'createComment' })
  create(
    @CurrentUser() user: UserAttributes,
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    createCommentInput.userId = user.id;
    return this.commentService.create(createCommentInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Comment, { name: 'updateComment' })
  update(
    @CurrentUser() user: UserAttributes,
    @Args('id') id: number,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ) {
    updateCommentInput.userId = user.id;
    return this.commentService.update(id, updateCommentInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'removeComment' })
  remove(@CurrentUser() user: UserAttributes, @Args('id') id: number) {
    return this.commentService.remove(id, user.id);
  }

  // Fields

  @ResolveField('user')
  async user(@Parent() comment: Comment, @Info() info: GraphQLResolveInfo) {
    if (!comment) return null;
    const loader = this.userLoader.setInfo(info);
    return await loader.findUsersByUserId.load(comment.userId);
  }

  @ResolveField('post')
  async post(@Parent() comment: Comment, @Info() info: GraphQLResolveInfo) {
    if (!comment) return null;
    const loader = this.postLoader.setInfo(info);
    return await loader.findPostsByPostId.load(comment.postId);
  }
}
