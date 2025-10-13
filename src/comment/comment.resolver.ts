import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { PostLoader } from 'src/post/post.loader';
import { UserAttributes } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/user/user.decorator';
import { UserLoader } from 'src/user/user.loader';
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
  findAll(@Args('pagination') pagination: PaginationInput) {
    return this.commentService.findAll(pagination);
  }

  @Query(() => [Comment], { name: 'commentsByPostId' })
  findAllByPostId(
    @Args('postId') postId: number,
    @Args('pagination') pagination: PaginationInput,
  ) {
    return this.commentService.findAllByPostId(postId, pagination);
  }

  @Query(() => Comment, { name: 'comment' })
  findOne(@Args('id') id: number) {
    return this.commentService.findOne(id);
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
  user(@Parent() comment: Comment) {
    if (!comment) return null;
    return this.userLoader.findUsersByUserId.load(comment.userId);
  }

  @ResolveField('post')
  post(@Parent() comment: Comment) {
    if (!comment) return null;
    return this.postLoader.findPostsByPostId.load(comment.postId);
  }
}
